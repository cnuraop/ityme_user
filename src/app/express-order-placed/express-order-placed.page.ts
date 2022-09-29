import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Order } from 'src/models/order.models';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { AppConfig, APP_CONFIG } from '../app.config';
import { sha512 } from 'js-sha512';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ExpressECommerceService } from '../services/common/ecommerce.service';
import { ApiService } from '../services/network/api.service';
import { OrderPayment } from 'src/models/order-payment.models';
import { Subscription } from 'rxjs';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { Helper } from 'src/models/helper.models';
import { PartialWalletPayment } from 'src/models/payout-request.models';
import { RazorPayment } from 'src/models/payment-method.models';
declare let fbq: Function;
declare var Razorpay: any;

@Component({
    selector: 'app-express-order-placed',
    templateUrl: './express-order-placed.page.html',
    styleUrls: ['./express-order-placed.page.scss']
})
export class ExpressOrderPlacedPage implements OnInit {
    private subscriptions = new Array<Subscription>();
    //private order: Order;
    private orderPayment: OrderPayment;
    private payumoneyFailAlerted = false;
    private razorpaymoneyFailAlerted = false;
    private order = new Array<Order>();
    public placedOrders: Array<Order>;
    isLoading = false;
    payumoneyDone = false;
    razorpaymoneyDone = false;
    orderIsCod = true;
    orderFailed = false;
    private balance = 0;
    regularDeliverySettings: DeliverySlot;
    deliverySlots = new Array<Date>();
    deliverySlot: Date;
    partialWalletPayment = new PartialWalletPayment();
    currency_icon: string;
    razorpayment: RazorPayment;

    constructor(@Inject(APP_CONFIG) private config: AppConfig, private router: Router,
        private uiElementService: UiElementsService, private apiService: ApiService,
        private navCtrl: NavController, private inAppBrowser: InAppBrowser,
        private translate: TranslateService, private eComService: ExpressECommerceService) {
    }

    options = {
        "key": "",
        "amount": "",
        "name": "Jeevamrut Naturals",
        "description": "Know your farmer, Know your food",
        "image": "https://admin.ityme.in/storage/1/logo.jpg",
        "order_id": "",
        "options": {
            "checkout": {
                "name": "Jeevamrut Naturals"              
            }
        },
        "handler": function (response) {
            var event = new CustomEvent("payment.success",
                {
                    detail: response,
                    bubbles: true,
                    cancelable: true
                }
            );
            window.dispatchEvent(event);
        }
        ,
        "prefill": {
            "name": "",
            "email": "",
            "contact": ""
        },
        "notes": {
            "address": ""
        },
        "config": {
            "display": {
              "hide": [
                {"method": "emi"},
                {"method": "wallet"},
                {"method": "paylater"}
              ],
              "preferences": {
                "show_default_blocks": "true",
              },
            },
        },
        "theme": {
            "color": "#8DC540"
        },
        "modal": {
            "ondismiss": function () {
                this.translate.get('payment_retry').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                this.markPayuFail(); 
                this.navCtrl.navigateForward(['./select-paymet-method']);
            }.bind(this)
        },
    };


    ngOnInit() {
        this.regularDeliverySettings = Helper.getRegularPincode();
        this.deliverySlot = this.regularDeliverySettings.slot1;
        this.currency_icon = Helper.getSetting("currency_icon");
        if (this.router.getCurrentNavigation().extras.state) {
            // Get Wallet Balance
            this.subscriptions.push(this.apiService.getBalance().subscribe(res => {
                this.balance = res.balance;
            }, err => {
                // console.log('getBalance', err);
                this.isLoading = false;
            }));

            this.order = this.router.getCurrentNavigation().extras.state.order;
            this.placedOrders = this.order;
            this.balance = this.router.getCurrentNavigation().extras.state.balance;
           // this.placedOrders[0].delivery_date = this.deliverySlot;
            //this.order[0].delivery_date = this.deliverySlot;
            this.placedOrders[0].express = 1;

            this.orderPayment = this.router.getCurrentNavigation().extras.state.payment;
            if (!this.orderPayment || this.orderPayment == null || this.orderPayment == undefined) {
                this.orderPayment = this.order[0].payment;
            }
            if (!this.orderPayment) this.orderPayment = this.order[0].payment;
            this.orderIsCod = this.orderPayment.payment_method.slug === 'cod';

            if (this.orderIsCod) this.eComService.clearCart();
            if (this.orderPayment.payment_method.slug === 'payu') {
                const keysMeta = JSON.parse(this.orderPayment.payment_method.meta);
                if (keysMeta && keysMeta.public_key && keysMeta.private_key) {
                    // this.initPayUMoney("KnT61oXY", "DTLwfcebBm", "");
                    //this.initPayUMoney(keysMeta.public_key, keysMeta.private_key, "");
                    this.initRazorPayMoney(keysMeta.key_id, keysMeta.key_secret, "");
                }
            }
            else if (this.orderPayment.payment_method.slug === 'razorpay') {
                const keysMeta = JSON.parse(this.orderPayment.payment_method.meta);
                if (keysMeta && keysMeta.key_id && keysMeta.key_secret) {
                    this.initRazorPayMoney(keysMeta.key_id, keysMeta.key_secret, "");
                }
            }
            else if (this.orderPayment.payment_method.slug === 'payuw') {
                const keysMeta = JSON.parse(this.orderPayment.payment_method.meta);
                if (keysMeta && keysMeta.public_key && keysMeta.private_key) {
                    // this.initPayUMoney("KnT61oXY", "DTLwfcebBm", "wallet");
                    this.initRazorPayMoney(keysMeta.public_key, keysMeta.private_key, "wallet");
                }
            }
            else if (this.orderPayment.payment_method.slug === 'wallet') {

                this.initWalletPay();
            }
        }
         fbq('track', 'Order_Placed', { value: this.eComService.getCartTotal(true), currency: 'INR' });

    }

    navHome() {
        this.navCtrl.navigateRoot(['./tabs']);
    }

    navMyOrders() {
        this.navHome();
        setTimeout(() => this.navCtrl.navigateForward(['./orders']), 100);
    }

    private initWalletPay() {
        this.isLoading = true;
        this.translate.get(['just_moment', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values.just_moment);
            this.subscriptions.push(this.apiService.walletPayout(this.orderPayment.id).subscribe(res => {
                this.uiElementService.dismissLoading();
                if (res.success) {
                    this.payumoneyDone = true;
                    this.eComService.clearCart();
                } else {
                    this.uiElementService.presentToast(res.message);
                    this.payumoneyDone = false;
                    this.orderFailed = true;
                }
                this.isLoading = false;
            }, err => {
                console.log("walletPayout", err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values["something_wrong"]);

                this.payumoneyDone = false;
                this.orderFailed = true;
                this.isLoading = false;
            }));
        });
    }

    private initPartialWalletPay() {
        this.isLoading = true;
        this.partialWalletPayment.orderId = this.order[0].id;
        this.partialWalletPayment.amount = this.balance;
        this.subscriptions.push(this.apiService.partialWalletPayout(this.partialWalletPayment).subscribe(res => {
            if (res.success) {
                this.payumoneyDone = true;
                this.eComService.clearCart();
            } else {
                this.uiElementService.presentToast(res.message);
                this.payumoneyDone = false;
                this.orderFailed = true;
            }
            this.isLoading = false;
        }, err => {
            console.log("updateOrder", err);
            this.uiElementService.presentToast("Partial Payment Fail");

            this.payumoneyDone = false;
            this.orderFailed = true;
            this.isLoading = false;
        }));
    }

    private initPayUMoney(key: string, salt: string, payType: string) {
        const name = this.order[0].user.name.replace(/\s/g, '');
        const mobile = this.order[0].user.mobile_number.replace(/\s/g, '');
        const email = this.order[0].user.email.replace(/\s/g, '');
        const bookingId = String(Math.floor(Math.random() * (99 - 10 + 1) + 10)) + String(this.order[0].id);
        const productinfo = this.order[0].vendor.name.replace(/\s/g, '');
        let amt;
        if (payType == 'wallet' && this.balance > 0) {
            amt = this.eComService.getCartTotal(true) - this.balance
        } else {
            // amt = this.orderPayment.amount - this.balance;
            amt = this.eComService.getCartTotal(true);
        }
        const checksum = key + '|' + bookingId + '|' + amt + '|' + productinfo + '|' + name + '|' + email + '|||||||||||' + salt;
        const encrypttext = sha512(checksum);
        const furl = this.config.apiBase + 'api/payment/payu/' + this.orderPayment.id + '?result=failed';
        const surl = this.config.apiBase + 'api/payment/payu/' + this.orderPayment.id + '?result=success';

        let url = this.config.apiBase + "assets/vendor/payment/payumoney/payuBiz.html?amt=" + amt + "&name=" + name + "&mobileNo=" + mobile + "&email=" + email + "&bookingId=" + bookingId + "&productinfo=" + productinfo + "&hash=" + encrypttext + "&salt=" + salt + "&key=" + key + "&furl=" + furl + "&surl=" + surl;

        const options: InAppBrowserOptions = {
            location: 'yes',
            clearcache: 'yes',
            zoom: 'yes',
            toolbar: 'no',
            hideurlbar: 'yes',
            closebuttoncaption: 'back'
        };
        try {
            const browser: any = this.inAppBrowser.create(url, '_blank', options);
            browser.on('loadstop').subscribe(event => {
                if (event.url == surl) {
                    if (payType == 'wallet') {
                        this.initPartialWalletPay();
                    } else {
                        this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 3000));
                    }
                    this.eComService.clearCart();
                    this.payumoneyDone = true;
                    browser.close();
                }
                if (event.url == furl) {
                    this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                    browser.close();
                }
            });
            browser.on('exit').subscribe(event => {
                if (!this.payumoneyDone) {
                    this.markPayuFail();
                    if (!this.payumoneyFailAlerted) {
                        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                    }
                }
            });
            browser.on('loaderror').subscribe(event => {
                this.markPayuFail();
                this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
            });
        } catch (e) {
            this.markPayuFail();
        }
    }

    private markPayuFail() {
        this.orderFailed = true;
        this.apiService.postURL(this.config.apiBase + 'api/payment/payu/' + this.orderPayment.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));

    }

    private markRazorFail() {
        this.orderFailed = true;
        this.apiService.postURL(this.config.apiBase + 'api/payment/razorpay/' + this.orderPayment.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));

    }
private markRazorSuccess(rzr: any) {
        this.razorpayment = new RazorPayment();
        this.orderFailed = false;
        this.payumoneyDone = true;
        this.razorpayment.id=this.orderPayment.id;
        this.razorpayment.razorpay_order_id=rzr.razorpay_order_id;
        this.razorpayment.razorpay_signature=rzr.razorpay_signature;
        console.log("signature"+rzr.razorpay_signature);
        this.razorpayment.razorpay_payment_id=rzr.razorpay_payment_id;
        this.apiService.updateRazorPayment(this.razorpayment).subscribe(res => {
            this.orderFailed = false;
            this.payumoneyDone = true;
        }, err => {
            this.uiElementService.presentToast(err);
        });

    }
    
    private initRazorPayMoney(key: string, salt: string, payType: string) {
        const name = this.order[0].user.name.replace(/\s/g, '');
        const mobile = this.order[0].user.mobile_number.replace(/\s/g, '');
        const email = this.order[0].user.email.replace(/\s/g, '');
       let amt;
        if (payType == 'wallet' && this.balance > 0) {
            amt = this.eComService.getCartTotal(true) - this.balance
        } else {
            // amt = this.orderPayment.amount - this.balance;
            amt = this.eComService.getCartTotal(true);
        }
        this.razorpayment = new RazorPayment();
        this.razorpayment.amount=(amt * 100).toString();
        // this.paymentId = '';
        this.apiService.creatRazorOrder(this.razorpayment).subscribe(
            data => {
                // this.options.key = data.secretKey;
                this.options.order_id = data.razorpayOrderId;
                // this.options.amount = data.applicationFee; //paise
                this.options.key = "rzp_live_IU4OXE829Ye0R2";
                //this.options.order_id = "order_JGNezKOqZ4M1Sh";
                this.options.amount = (amt * 100).toString(); //paise
                this.options.prefill.name = name;
                this.options.prefill.email = email;
                this.options.prefill.contact = mobile;
                var rzp1 = new Razorpay(this.options);
                rzp1.open();

                // if (payType == 'wallet') {
                //     this.initPartialWalletPay();
                // }

                rzp1.on('payment.failed', function (response) {
                    // Todo - store this information in the server
                    console.log(response.error.code);
                    console.log(response.error.description);
                    console.log(response.error.source);
                    console.log(response.error.step);
                    console.log(response.error.reason);
                    console.log(response.error.metadata.order_id);
                    console.log(response.error.metadata.payment_id);
                    this.error = response.error.reason;
                    this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                    this.markPayuFail();
                });
            },
            err => {
                this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                this.markPayuFail();
            }
        );

    }

    @HostListener('window:payment.success', ['$event'])
    onPaymentSuccess(event): void {

        if (this.orderPayment.payment_method.slug === 'payuw') {
            this.initPartialWalletPay();
        }
        else {
            this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 3000));
        }

        this.eComService.clearCart();
        this.payumoneyDone = true;
        this.markRazorSuccess(event.detail);
    }

    @HostListener('window:payment.fail', ['$event'])
    onPaymentFail(event): void {
        // this.orderService.updateOrder(event.detail).subscribe(
        // data => {
        // 	this.paymentId = data.message;
        // }
        // ,
        // err => {
        // //	this.error = err.error.message;
        // this.paymentId = "Test";
        // }
        // );
        // this.markRazorPayFail();
        this.markRazorPayFail();
        console.log("fail");
    }

    private markRazorPayFail() {
        this.orderFailed = true;
        this.apiService.postURL(this.config.apiBase + 'api/payment/payu/' + this.orderPayment.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
    }

}
