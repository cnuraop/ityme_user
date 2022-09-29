import {Component, OnInit, OnDestroy} from '@angular/core';
import {PrescriptionPage} from '../prescription/prescription.page';
import {ModalController, NavController} from '@ionic/angular';
import {ECommerceService, ExpressECommerceService} from '../services/common/ecommerce.service';
import {UiElementsService} from '../services/common/ui-elements.service';
import {Helper} from 'src/models/helper.models';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {ApiService} from '../services/network/api.service';
import {Coupon} from 'src/models/coupon.models';
import {Constants} from 'src/models/constants.models';
import {Router} from '@angular/router';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import * as moment from 'moment';

@Component({
    selector: 'app-my-express-cart',
    templateUrl: './my-express-cart.page.html',
    styleUrls: ['./my-express-cart.page.scss']
})
export class MyExpressCartPage implements OnInit {
    private once = false;
    private subscriptions = new Array<Subscription>();
    fabAction = true;
    couponCode: string;
    // tslint:disable-next-line:variable-name
    currency_icon: string;
    couponRes: Coupon;
    showPrescription: boolean;
    public wedFriDeliveryDate: boolean;
    public isSubscribed = false;
    currentDay = new Date().getDay();
    public deliveryDate: Date;
    public deliveryDay: string;

    constructor(private route: Router, private navCtrl: NavController, private modalController: ModalController,
                private translate: TranslateService,
                public eComService: ExpressECommerceService, private uiElementService: UiElementsService,
                private apiService: ApiService, private photoViewer: PhotoViewer) {
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.eComService.removeCoupon();
        for (const cartItems of this.eComService.getCartItems()) {
            if (cartItems.product.delivery_type === '2DAYDELIVERY') {
                this.wedFriDeliveryDate = true;
                break;
            }
        }
        this.calculateDeliveryDate();
        this.showPrescription = this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL) != null;
    }

    ionViewWillLeave() {
        for (const sub of this.subscriptions) sub.unsubscribe();
        this.uiElementService.dismissLoading();
    }

    ionViewDidEnter() {
        // if (!this.once) {
        const tempCouponCode = window.localStorage.getItem(Constants.TEMP_COUPON);
        if (tempCouponCode != null && tempCouponCode.length) {
            this.couponCode = tempCouponCode;
            this.verifyCoupon();
        }
        window.localStorage.removeItem(Constants.TEMP_COUPON);
        this.verifySubscription();
    }

    removeOrDecrementCartItemAndCheck(ci) {
        const removed = this.eComService.removeOrDecrementCartItem(ci);
        if (removed) {
            let needsPrescription = false;
            // tslint:disable-next-line:no-shadowed-variable
            for (const cartItems of this.eComService.getCartItems()) {
                if (cartItems.product.prescription_required) {
                    needsPrescription = true;
                    break;
                }
                if (cartItems.product.delivery_type === '2DAYDELIVERY') {
                    this.wedFriDeliveryDate = true;
                    break;
                } else {
                    this.wedFriDeliveryDate = false;
                }
            }
            this.calculateDeliveryDate()
            if (!needsPrescription) this.removePrescription();
            if (!this.eComService.getCartItems().length) {
                this.couponCode = '';
                this.couponRes = null;
                this.applyCoupon();
            }
        }
    }

    verifyCoupon() {
        if (Helper.getLoggedInUser() != null) {
            if (this.couponCode && this.couponCode.length) {
                this.translate.get(['verifying', 'invalid_coupon']).subscribe(values => {
                    this.uiElementService.presentLoading(values['verifying']);
                    this.subscriptions.push(this.apiService.checkCoupon(this.couponCode).subscribe(res => {
                        this.uiElementService.dismissLoading();
                        if (moment(res.expires_at).diff(moment()) > 0) {
                            this.couponRes = res;
                            this.applyCoupon();
                            this.uiElementService.presentToast('Hurray, coupon applied successfully!');
                        } else {
                            this.couponRes = null;
                            this.uiElementService.presentToast(values['invalid_coupon']);
                        }
                    }, err => {
                        this.couponCode = '';
                        this.couponRes = null;
                        this.uiElementService.presentToast(values['invalid_coupon']);
                        this.uiElementService.dismissLoading();
                    }));
                });
            } else {
                this.translate.get('err_field_coupon').subscribe(value => this.uiElementService.presentToast(value));
            }
        } else {
            this.alertLogin();
        }
    }

    removeCoupon() {
        this.couponCode = '';
        this.couponRes = null;
        this.applyCoupon();
        this.translate.get('offer_removed').subscribe(value => this.uiElementService.presentToast(value));
    }

    applyCoupon() {
        this.eComService.applyCoupon(this.couponRes);
    }

    toggleFab() {
        this.fabAction = !this.fabAction;
    }

    verifySubscription() {
        this.apiService.IsSubscribed().subscribe(res => {
            if (res.message === 1) {
                this.isSubscribed = true;
            }
        }, err => {
            this.isSubscribed = false;
        });
    }

    calculateDeliveryDate() {
        this.deliveryDate = new Date();
        this.deliveryDate.setDate(this.deliveryDate.getDate() + 1);
        const dayNum = this.deliveryDate.getDay() > this.currentDay ? this.deliveryDate.getDay() - this.currentDay
            : this.currentDay - this.deliveryDate.getDay();
        if (this.wedFriDeliveryDate && !(this.currentDay === 2 || this.currentDay === 5)) {
            this.deliveryDate.setDate(this.deliveryDate.getDate() + dayNum);
        }
        this.deliveryDay = this.deliveryDate.toDateString();
    }

    navCheckout() {
        if (Helper.getLoggedInUser() != null) {
            let needsPrescription = false;
            for (let ci of this.eComService.getCartItems()) {
                if (ci.product.prescription_required) {
                    needsPrescription = true;
                    break;
                }
            }
            if (needsPrescription && this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL) == null) {
                this.modalController.create({component: PrescriptionPage}).then((modalElement) => {
                    modalElement.onDidDismiss().then(data => {
                        if (data && data.data) {
                            this.translate.get('uploaded_prescription')
                                .subscribe(value => this.uiElementService.presentToast(value));
                            this.eComService.setupOrderRequestMeta(Constants.KEY_PRESCRIPTION_URL, data.data);
                            this.showPrescription = true;
                        }
                    });
                    modalElement.present();
                })
            } else {
                this.navCtrl.navigateForward(['./confirm-express-order']);
            }
        } else {
            this.alertLogin();
        }
    }

    alertLogin() {
        this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
        this.navCtrl.navigateForward(['./sign-in']);
    }

    navOffers() {
        this.navCtrl.navigateForward(['./offers']);
    }

    viewPrescription() {
        this.photoViewer.show(this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL));
    }

    removePrescription() {
        const isPrescriptionUploaded = this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL) != null;
        this.eComService.removeOrderRequestMeta(Constants.KEY_PRESCRIPTION_URL);
        this.showPrescription = false;
        if (isPrescriptionUploaded) this.translate.get('removed_prescription')
            .subscribe(value => this.uiElementService.presentToast(value));
    }
}
