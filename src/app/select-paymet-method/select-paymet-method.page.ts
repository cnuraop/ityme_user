import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Subscription } from 'rxjs';
import { PaymentMethod } from 'src/models/payment-method.models';
import { Helper } from 'src/models/helper.models';
import { NavigationExtras, Router } from '@angular/router';
import { WalletTransaction } from 'src/models/wallet-transaction.models';
import { ifStmt } from '@angular/compiler/src/output/output_ast';
import { User } from 'src/models/user.models';
declare let fbq: Function;

@Component({
    selector: 'app-select-paymet-method',
    templateUrl: './select-paymet-method.page.html',
    styleUrls: ['./select-paymet-method.page.scss']
})
export class SelectPaymetMethodPage implements OnInit {
    private once = false;
    private subscriptions = new Array<Subscription>();
    currency_icon: string;
    paymentMethods = new Array<PaymentMethod>();
    paymentMethoIdSelected = -1;
    fabAction = true;
    amountToBePaid = 0;
    amountToBePaidCopy = 0;
    isLoading = true;
    transactions = new Array<WalletTransaction>();
    balance = 0;
    payMode: any = "online";
    useWallet: boolean = false;
    deliveryDetails:string;
    seasonal:boolean;
    payonline:boolean;
    userMe: User;

    constructor(private navCtrl: NavController, private translate: TranslateService,private router: Router,
        private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService) {
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.userMe = this.apiService.getUserMe();  
        // hard coding payment selection to COD / Wallet
        this.paymentMethoIdSelected = 3;
        this.deliveryDetails=this.router.getCurrentNavigation().extras.state.deliveryDetails;
        
        this.seasonal=this.router.getCurrentNavigation().extras.state.seasonal;
        this.payonline=this.router.getCurrentNavigation().extras.state.payonline;
    }

    ionViewDidEnter() {
        fbq('track', 'Payment_Page');
        if (!this.once) {
            this.translate.get('loading').subscribe(value => {
                this.uiElementService.presentLoading(value);
                this.subscriptions.push(this.apiService.getPaymentMethods().subscribe(res => {
                    this.paymentMethods = this.spliceFor(res, ["payu", "cod"]);
                    this.uiElementService.dismissLoading();
                }, err => {
                    console.log('getPaymentMethods', err);
                    this.uiElementService.dismissLoading();
                }));
            });
        }
        this.once = true;
        this.getAmountTobePaid('');
        this.refreshBalance();

    }

    ionViewWillLeave() {
        for (const sub of this.subscriptions) sub.unsubscribe();
        this.uiElementService.dismissLoading();
    }

    onPaymentMethodSelected(event) {
        console.log('selection' + event.detail.value);
        if (event.detail && event.detail.value) {
            this.paymentMethoIdSelected = event.detail.value;
        }
        let paymentSlug;
        this.paymentMethods.forEach((val) => {
            // tslint:disable-next-line:triple-equals
            if (val.id == this.paymentMethoIdSelected) {
                paymentSlug = val.slug;
            }
        });
        this.getAmountTobePaid(paymentSlug);
    }

    // not in use
    placeOrderCopy() {
        const selectedPaymentMethod = this.getSelectedPaymentMethod();
        if (selectedPaymentMethod != null) {
            this.eComService.setupOrderRequestPaymentMethod(selectedPaymentMethod);
            const orderRequest = this.eComService.getOrderRequest();
            orderRequest.email=this.userMe.email;
            orderRequest.name=this.userMe.name;
            orderRequest.mobile_number=this.userMe.mobile_number;
            console.log("email"+orderRequest.email);
            this.translate.get(['order_placing', 'order_placed', 'order_place_err']).subscribe(values => {
                this.uiElementService.presentLoading(values.order_placing);

                this.apiService.createOrderv2(orderRequest).subscribe(res => {
                    this.uiElementService.dismissLoading();
                    console.log(orderRequest.payment_method_slug);
                    const navigationExtras: NavigationExtras = { state: { order: res.order, payment: res.payment, balance: this.balance } };
                    //this.navCtrl.navigateRoot(['./order-placed'], navigationExtras);
                    this.router.routeReuseStrategy.shouldReuseRoute = function () {
                        return false;
                    }
                    this.router.onSameUrlNavigation = 'reload';
                    this.router.navigate(['./order-placed'], navigationExtras);
                }, err => {
                    this.uiElementService.dismissLoading();
                    this.uiElementService.presentToast(values.order_place_err);
                });
            });
        } else {
            this.translate.get('select_payment_method').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    placeOrder() {
        
        let finalWallet = this.balance;
        if (this.useWallet) {
            if (this.amountToBePaid > 0) {
                if (this.payMode == 'online') {
                    finalWallet = 0;
                    this.OrderPayment('payuw');
                } else {
                    finalWallet = this.balance - this.eComService.getCartTotal(true);
                    this.OrderPayment('wallet');
                }
            } else {
                finalWallet = this.balance - this.eComService.getCartTotal(true);
                this.OrderPayment('wallet');
            }
        } else {
            if (this.payMode == 'wallet') {
                finalWallet = this.balance - this.eComService.getCartTotal(true);
                this.OrderPayment('wallet');
            } else {
                this.OrderPayment('payu');
            }
        }
    }
    OrderPayment(payModeSlug) {
        if (payModeSlug != null) {            
            //seasonal
            if(this.seasonal==true)
            this.eComService.setupSeasonalOrderRequestPaymentMethod(payModeSlug, this.deliveryDetails);
            //regular
            else
            this.eComService.setupCustomOrderRequestPaymentMethod(payModeSlug);

            const orderRequest = this.eComService.getOrderRequest();
            orderRequest.email=this.userMe.email;
            orderRequest.name=this.userMe.name;
            orderRequest.mobile_number=this.userMe.mobile_number;
            // console.log("sdf"+orderRequest.products[0].dispatch_week);

            this.translate.get(['order_placing', 'order_placed', 'order_place_err']).subscribe(values => {
                this.uiElementService.presentLoading(values.order_placing);

                this.apiService.createOrderv2(orderRequest).subscribe(res => {
                    this.uiElementService.dismissLoading();
                    console.log("ORDER REQUEST");
                    console.log(orderRequest.payment_method_slug);
                    const navigationExtras: NavigationExtras = { state: { order: res.order, payment: res.payment, balance: this.balance } };
                    // this.navCtrl.navigateRoot(['./order-placed'], navigationExtras);
                    this.router.routeReuseStrategy.shouldReuseRoute = function () {
                        return false;
                    }
                    this.router.onSameUrlNavigation = 'reload';
                    this.router.navigate(['./order-placed'], navigationExtras);
                }, err => {
                    this.uiElementService.dismissLoading();
                    // this.uiElementService.presentToast(values.order_place_err);
                    this.uiElementService.presentToast(err);
                });
            });
        } else {
            this.translate.get('select_payment_method').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    getSelectedPaymentMethod(): PaymentMethod {
        let toReturn = null;

        for (const pm of this.paymentMethods) {
            if (this.paymentMethoIdSelected == pm.id) {
                toReturn = pm;
                break;
            }
        }

        if (this.eComService.getCartTotal(true) - this.balance > 0) {
            if (toReturn.slug != 'wallet') {
                for (const pm of this.paymentMethods) if (pm.slug == 'wallet') {
                    toReturn = pm;
                    break;
                }
            }
        }
        return toReturn;
    }

    toggleFab() {
        this.fabAction = !this.fabAction;
    }

    refreshBalance() {
        this.subscriptions.push(this.apiService.getBalance().subscribe(res => {
            this.isLoading = false;
            this.balance = res.balance;
            if (this.useWallet && this.balance > 0) {
                this.amountToBePaid = this.eComService.getCartTotal(true) - this.balance;
            } else {
                this.amountToBePaid = this.eComService.getCartTotal(true);
            }
            if (this.amountToBePaid < 0)
                this.amountToBePaid = 0;

            this.amountToBePaidCopy = this.eComService.getCartTotal(true) - this.balance;
            if (this.amountToBePaidCopy < 0)
                this.amountToBePaidCopy = 0;
        }, err => {
            console.log('getBalance', err);
            this.isLoading = false;
        }));

    }

    getAmountTobePaid(slug) {

        if (slug == 'cod' && this.eComService.getCartTotal(true) - this.balance > 0) {
            this.amountToBePaid = this.eComService.getCartTotal(true) - this.balance;
        } else {
            this.amountToBePaid = this.eComService.getCartTotal(true);
        }
        console.log(this.amountToBePaid);
    }

    private spliceFor(pgs: Array<PaymentMethod>, removeFor: Array<string>): Array<PaymentMethod> {

        for (let toRemoveFor of removeFor) {
            let indexToRemove = -1;
            for (let i = 0; i < pgs.length; i++) {
                if (pgs[i].slug == toRemoveFor) {
                    indexToRemove = i;
                    break;
                }
            }
            if (indexToRemove != -1) pgs.splice(indexToRemove, 1);
        }
        return pgs;
    }
    radioGroupChange(event) {
        this.payMode = event.detail.value;
        if (this.payMode == 'online') {
            this.useWallet = false;
        } else if (this.balance > 0) {
            this.useWallet = true;
        } else {
            this.useWallet = false;
        }
        this.refreshBalance();
    }
    checkboxClick(event) {
        this.useWallet = event.detail.checked;
        this.refreshBalance();
    }
}
