import {Component, OnInit} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {MyAddress} from 'src/models/address.models';
import {DeliverySlot} from 'src/models/delivery-slot.models';
import {Helper} from 'src/models/helper.models';
import {User} from 'src/models/user.models';
import {SavedItemsPage} from '../saved-items/saved-items.page';
import {ExpressECommerceService} from '../services/common/ecommerce.service';
import {UiElementsService} from '../services/common/ui-elements.service';
import {MyEventsService} from '../services/events/my-events.service';
import {ApiService} from '../services/network/api.service';

declare let fbq: Function;

@Component({
    selector: 'app-confirm-express-order',
    templateUrl: './confirm-express-order.page.html',
    styleUrls: ['./confirm-express-order.page.scss'],
})
export class ConfirmExpressOrderPage implements OnInit {
    private subscriptions = new Array<Subscription>();
    // tslint:disable-next-line:variable-name
    currency_icon: string;
    selectedLocation: MyAddress;
    expressDeliverySettings: DeliverySlot;
    deliverySlots = new Array<Date>();
    deliverySlot: Date;
    deliveryDetails: string;
    deliveryLabel: string;
    seasonal: boolean;
    payonline: boolean;
    userMe: User;
    public deliveryDate: Date;
    public deliveryDay: string;
    public wedFriDeliveryDate: boolean;
    currentDay = new Date().getDay();

    constructor(private route: Router, private navCtrl: NavController, private modalController: ModalController,
                private translate: TranslateService,
                public eComService: ExpressECommerceService, private uiElementService: UiElementsService,
                private apiService: ApiService, private myEvent: MyEventsService) {
    }

    ngOnInit() {
        this.getOnlineCoupon();

        this.userMe = this.apiService.getUserMe();
        if (this.userMe.email === 'newuser@jeevamrut.in')
            this.userMe.email = '';

        this.currency_icon = Helper.getSetting('currency_icon');
        this.selectedLocation = Helper.getAddressSelected();
        console.log('address' + this.selectedLocation.id);
        this.expressDeliverySettings = Helper.getExpressPincode();
        if (this.expressDeliverySettings.slot1 != undefined || this.expressDeliverySettings.slot1 != null)
            this.deliverySlots.push(this.expressDeliverySettings.slot1);
        if (this.expressDeliverySettings.slot2 != undefined || this.expressDeliverySettings.slot2 != null)
            this.deliverySlots.push(this.expressDeliverySettings.slot2);
        for (const cartItems of this.eComService.getCartItems()) {
            if (cartItems.product.delivery_type === '2DAYDELIVERY') {
                this.wedFriDeliveryDate = true;
                break;
            }
        }
        this.calculateDeliveryDate();
        this.getDeliveryDates();

        fbq('track', 'Checkout');
    }

    calculateDeliveryDate(){
        this.deliveryDate = new Date();
        this.deliveryDate.setDate(this.deliveryDate.getDate() + 1);
        const dayNum = this.deliveryDate.getDay() > this.currentDay ? this.deliveryDate.getDay() - this.currentDay
            : this.currentDay - this.deliveryDate.getDay();
        if (this.wedFriDeliveryDate && !(this.currentDay === 2 || this.currentDay === 5)) {
            this.deliveryDate.setDate(this.deliveryDate.getDate() + dayNum);
        }
        this.deliveryDay = this.deliveryDate.toDateString();
    }

    select_paymet_method() {
        if (this.profilUpdate()) {
            this.eComService.setupOrderRequestAddress(this.selectedLocation);
            const navigationExtras: NavigationExtras = {
                state: {
                    deliveryDetails: this.deliveryDate,
                    seasonal: this.seasonal,
                    payonline: this.payonline
                }
            };
            this.navCtrl.navigateForward(['./express-payment-method'], navigationExtras);
        }
    }

    profilUpdate() {
        let saved: boolean;
        saved = false;
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (this.userMe.email.length <= 5 || !reg.test(this.userMe.email)) {
            this.translate.get('err_valid_email').subscribe(value => this.uiElementService.presentToast(value));
        } else {
            this.saveMe();
            saved = true;
        }
        return saved;
    }

    saveMe(updateRequestIn?: any) {
        let uur = updateRequestIn != null ? updateRequestIn : {name: this.userMe.name, email: this.userMe.email};
        this.translate.get(['saving', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values['saving']);

            this.apiService.updateUser(uur).subscribe(res => {
                this.uiElementService.dismissLoading();
                Helper.setLoggedInUser(res);
                this.myEvent.setUserMeData(res);
            }, err => {
                console.log('updateUser', err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentErrorAlert(values['something_wrong']);
            });
        });
    }


    getAddressToShow(address) {
        return MyAddress.getDetailedAddressToShow(address);
    }

    getOnlineCoupon() {
        this.eComService.getExtraCharges().forEach(extracharge => {
                console.log('here1' + extracharge.extraChargeObject.title);
                if (extracharge.extraChargeObject.title == 'PAYONLINE') {
                    this.payonline = true;
                    this.uiElementService.presentToast('Thanks for helping us pay farmers on time!');
                }
            }
        );
    }

    getDeliveryDates() {
        // 0: regular, 1: seasonal, 2: mixed
        let seasonalOrder = 0;
        let week: string;

        this.eComService.getCartItems().forEach(item => {
            console.log(item);
            console.log(seasonalOrder);
            seasonalOrder = 1;
            if (item.week != null && seasonalOrder != 1 && seasonalOrder != 2) {
                seasonalOrder = 1;
                week = item.week;
            } else if (item.week == null && seasonalOrder === 1) {
                seasonalOrder = 2;
            }
        });

        if (seasonalOrder === 1 || seasonalOrder === 2) {
            this.seasonal = true;
            // this.deliveryLabel="Dispatch Week";
            // this.deliveryDetails=week;
        } else {
            this.deliveryLabel = 'Delivery Date';
            console.log(this.deliverySlots[0].toString());
            console.log(this.deliveryDay);
            this.deliveryDetails = this.deliveryDay;
        }
    }

}
