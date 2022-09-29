import {Component, OnInit} from '@angular/core';
import {Router, NavigationExtras} from '@angular/router';
import {Order} from 'src/models/order.models';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {UiElementsService} from '../services/common/ui-elements.service';
import {Constants} from 'src/models/constants.models';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';
import {ExpressECommerceService} from '../services/common/ecommerce.service';
import {ModalController} from '@ionic/angular';
import {Product} from 'src/models/product.models';
import {MyAddress} from 'src/models/address.models';
import {Subscription} from 'rxjs';
import {Helper} from 'src/models/helper.models';
import {ApiService} from '../services/network/api.service';
import {TitlePage} from '../title/title.page';
import {PrescriptionPage} from '../prescription/prescription.page';

@Component({
    selector: 'app-orders-info',
    templateUrl: './reorder.page.html',
    styleUrls: ['./reorder.page.scss']
})
export class ReorderPage implements OnInit {
    order: Order;
    orderProgress = 0;
    fabAction = true;
    prescriptionLink: string;
    location: MyAddress;
    showPrescription: boolean;
    private subscriptions = new Array<Subscription>();

    constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
                private uiElementService: UiElementsService, private photoViewer: PhotoViewer,public eComService: ExpressECommerceService,private modalController: ModalController,private apiService: ApiService) {
    }

    ngOnInit() {
        if (this.router.getCurrentNavigation().extras.state) {
            this.order = this.router.getCurrentNavigation().extras.state.order;
            switch (this.order.status) {
                case 'cancelled':
                case 'refund':
                case 'hold':
                case 'rejected':
                case 'failed':
                case 'new':
                case 'pending':
                    this.orderProgress = 0;
                    break;
                case 'accepted':
                    this.orderProgress = 1;
                    break;
                case 'preparing':
                case 'prepared':
                case 'dispatched':
                case 'intransit':
                    this.orderProgress = 2;
                    break;
                case 'complete':
                    this.orderProgress = 3;
                    break;
            }
        }
    }

    toggleFab() {
        this.fabAction = !this.fabAction;
    }
    updateAddress() {
        // this.location.latitude = "17.4842285";
        // this.location.longitude = "78.3541741";
        this.translate.get(['address_creating', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values.address_creating);
            this.subscriptions.push(this.apiService.addressUpdate(this.location).subscribe(res => {
                this.uiElementService.dismissLoading();
                this.selectAddress(res);
            }, err => {
                console.log('addressAdd', err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values.something_wrong);
            }));
        });
    }
    
    addProCart(pro: Product) {
        if (this.location.address2 == null) {
            this.modalController.create({component: TitlePage, componentProps: {address: this.location}}).then((modalElement) => {
                modalElement.onDidDismiss().then(data => {
                    if (data && data.data) {
                        this.location = data.data;
                        this.updateAddress();
                    }
                });
                modalElement.present();
            })
        }
        const added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
        if (added === -1) {
            // Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
            this.uiElementService.alertCartConflict().then(res => {
                if (res) {
                    this.eComService.clearCart();
                    this.addProCart(pro);
                }
            });
        }
    }

    removeProCart(pro: Product) {
        this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromProduct(pro));
    }

    selectAddress(address: MyAddress) {
        Helper.setAddressSelected(address);
    }

    navTrackOrder() {
        if (this.canTrack()) {
            const navigationExtras: NavigationExtras = {
                state: {
                    delivery: this.order.delivery,
                    address: this.order.address,
                    vendor: {
                        name: this.order.vendor.name,
                        image: this.order.vendor.image,
                        location: {latitude: this.order.vendor.latitude, longitude: this.order.vendor.longitude}
                    }
                }
            };
            this.navCtrl.navigateForward(['./order-tracking'], navigationExtras);
        } else {
            this.translate.get('track_unavailable').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    canTrack(): boolean {
        return (this.order.status == 'dispatched' || this.order.status == 'intransit') && this.order.delivery != null;
    }

    viewPresciption() {
        this.photoViewer.show(this.prescriptionLink);
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
                this.navCtrl.navigateForward(['./confirm-express-reorder']);
            }
        } else {
            this.alertLogin();
        }
    }

    alertLogin() {
        this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
        this.navCtrl.navigateForward(['./sign-in']);
    }

}
