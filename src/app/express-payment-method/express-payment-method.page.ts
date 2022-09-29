import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {UiElementsService} from '../services/common/ui-elements.service';
import {ApiService} from '../services/network/api.service';
import {ExpressECommerceService} from '../services/common/ecommerce.service';
import {Subscription} from 'rxjs';
import {PaymentMethod} from 'src/models/payment-method.models';
import {Helper} from 'src/models/helper.models';
import {NavigationExtras, Router} from '@angular/router';
import {WalletTransaction} from 'src/models/wallet-transaction.models';
import {ifStmt} from '@angular/compiler/src/output/output_ast';
import {User} from 'src/models/user.models';
import {OrderRequestNew} from 'src/models/order-request-updated.models';

declare let fbq: Function;

@Component({
    selector: 'app-express-payment-method',
    templateUrl: './express-payment-method.page.html',
    styleUrls: ['./express-payment-method.page.scss']
})
export class ExpressPaymentMethodPage implements OnInit {
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
    payMode: any = 'online';
    useWallet: boolean = false;
    deliveryDetails: Date;
    seasonal: boolean;
    payonline: boolean;
    userMe: User;
    orderRequestNew = new OrderRequestNew();

    constructor(private navCtrl: NavController, private translate: TranslateService, private router: Router,
                private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ExpressECommerceService) {
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.userMe = this.apiService.getUserMe();
        // hard coding payment selection to COD / Wallet
        this.paymentMethoIdSelected = 3;
        this.deliveryDetails = this.router.getCurrentNavigation().extras.state.deliveryDetails;

        this.seasonal = this.router.getCurrentNavigation().extras.state.seasonal;
        this.payonline = this.router.getCurrentNavigation().extras.state.payonline;
    }

    ionViewDidEnter() {
        fbq('track', 'Payment_Page');
        if (!this.once) {
            this.translate.get('loading').subscribe(value => {
                this.uiElementService.presentLoading(value);
                this.subscriptions.push(this.apiService.getPaymentMethods().subscribe(res => {
                    this.paymentMethods = this.spliceFor(res, ['payu', 'cod']);
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

    placeOrder() {
        let finalWallet = this.balance;
        this.uiElementService.presentLoading(this.translate.instant('loading'));
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
            console.log('#####Seasonal##########');
            this.eComService.setupCustomOrderRequestPaymentMethod(payModeSlug);
            const orderRequest = this.eComService.getOrderRequest();
            orderRequest.email = this.userMe.email;
            orderRequest.delivery_date = new Date(this.deliveryDetails.toISOString().split('T')[0]);
            orderRequest.name = this.userMe.name;
            orderRequest.mobile_number = this.userMe.mobile_number;
            orderRequest.seasonal = this.seasonal ? 1 : 0
            this.orderRequestNew.address_id = orderRequest.address_id;
            this.orderRequestNew.payment_method_id = orderRequest.payment_method_id;
            this.orderRequestNew.payment_method_slug = orderRequest.payment_method_slug;
            this.orderRequestNew.coupon_code = orderRequest.coupon_code;
            this.orderRequestNew.delivery_date = this.deliveryDetails.toISOString().split('T')[0];
            this.orderRequestNew.express = orderRequest.express;
            this.orderRequestNew.seasonal = orderRequest.seasonal;
            this.orderRequestNew.products = orderRequest.products;
            this.orderRequestNew.meta = orderRequest.meta;
            this.orderRequestNew.name = orderRequest.name;
            this.orderRequestNew.email = orderRequest.email;
            this.orderRequestNew.mobile_number = orderRequest.mobile_number;
            this.translate.get(['order_placing', 'order_placed', 'order_place_err']).subscribe(values => {
                this.apiService.createOrderv3(this.orderRequestNew).subscribe(res => {
                    const navigationExtras: NavigationExtras = {state: {order: res.order, payment: res.payment, balance: this.balance}};
                    this.router.routeReuseStrategy.shouldReuseRoute = () => {
                        return false;
                    }
                    this.router.onSameUrlNavigation = 'reload';
                    this.uiElementService.dismissLoading();
                    this.router.navigate(['./express-order-placed'], navigationExtras);
                }, err => {
                    this.uiElementService.dismissLoading();
                    this.uiElementService.presentToast(err);
                });
            });
        } else {
            this.translate.get('select_payment_method').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    getSelectedPaymentMethod(): PaymentMethod {
        let toReturn = null;
        for (const pm of this.paymentMethods) if (this.paymentMethoIdSelected == pm.id) {
            toReturn = pm;
            break;
        }
        if (this.eComService.getCartTotal(true) - this.balance > 0) {
            if (toReturn.slug !== 'wallet') {
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
        for (const toRemoveFor of removeFor) {
            let indexToRemove = -1;
            for (let i = 0; i < pgs.length; i++) {
                if (pgs[i].slug === toRemoveFor) {
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
        if (this.payMode === 'online') {
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
