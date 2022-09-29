import {Component, HostListener, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NavController} from '@ionic/angular';
import {InAppBrowser, InAppBrowserOptions} from '@ionic-native/in-app-browser/ngx';
import {AppConfig, APP_CONFIG} from '../app.config';
import {sha512} from 'js-sha512';
import {TranslateService} from '@ngx-translate/core';
import {UiElementsService} from '../services/common/ui-elements.service';
import {ECommerceService} from '../services/common/ecommerce.service';
import {ApiService} from '../services/network/api.service';
import {Subscription} from 'rxjs';
import { MembershipModel, MembershipObject } from 'src/models/membership-plan.models';
import { PaymentMethod, RazorPayment } from 'src/models/payment-method.models';
import { OrderPayment } from 'src/models/order-payment.models';
import { Helper } from 'src/models/helper.models';

declare var Razorpay: any;
@Component({
    selector: 'app-pay-subscription',
    templateUrl: './pay-subscription.page.html',
    styleUrls: ['./pay-subscription.page.scss']
})
export class PaySubscriptionPage implements OnInit {
    private subscriptions = new Array<Subscription>();
    private subscription: MembershipModel;
    private payumoneyFailAlerted = false;
    private razorpaymoneyFailAlerted = false;
    private once = false;
    private paymentMethod: PaymentMethod;
    isLoading = false;
    payumoneyDone = false;
    razorpaymoneyDone = false;
    orderIsCod = true;
    orderFailed = false;
    private balance = 0;
    razorpayment: RazorPayment;

    constructor(@Inject(APP_CONFIG) private config: AppConfig, private router: Router,
                private uiElementService: UiElementsService, private apiService: ApiService,
                private navCtrl: NavController, private inAppBrowser: InAppBrowser,
                private translate: TranslateService, private eComService: ECommerceService) {
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
              this.navCtrl.navigateForward(['./offers']);
          }.bind(this)
      },
  };

      ngOnInit() {
        this.paymentMethod = this.router.getCurrentNavigation().extras.state.payment;
        this.subscription = this.router.getCurrentNavigation().extras.state.membership;
          this.translate.get(["just_moment", "something_wrong", "payment_method_not_setup"]).subscribe(values => {
            this.uiElementService.presentLoading(values["just_moment"]);
              this.uiElementService.dismissLoading();
              if ( this.paymentMethod.slug === 'payu') {
                const keysMeta = JSON.parse(this.paymentMethod.meta);
                if (keysMeta && keysMeta.public_key && keysMeta.private_key) {
                    //this.initPayUMoney(keysMeta.public_key, keysMeta.private_key);
                    this.initRazorPayMoney(keysMeta.public_key, keysMeta.private_key);
                    //this.initWalletPay();
                }
            }
              else {
                this.uiElementService.presentToast(values["payment_method_not_setup"]);
              }
          });
      }

    navHome() {        
this.refreshSettings();
        this.navCtrl.navigateRoot(['./tabs']);
    }

    navMyOrders() {
        this.navHome();
        setTimeout(() => this.navCtrl.navigateForward(['./orders']), 100);
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

    private initWalletPay() {
        this.isLoading = true;
        this.translate.get(['just_moment', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values.just_moment);
            this.subscriptions.push(this.apiService.walletPayout(this.subscription.id).subscribe(res => {
                this.uiElementService.dismissLoading();
                if (res.success) {
                    this.payumoneyDone = true;
                } else {
                    this.uiElementService.presentToast(res.message);
                    this.payumoneyDone = false;
                    this.orderFailed = true;
                }
                this.isLoading = false;
            }, err => {
               // console.log("walletPayout", err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values["something_wrong"]);
                this.payumoneyDone = false;
                this.orderFailed = true;
                this.isLoading = false;
            }));
        });
    }

    private initPayUMoney(key: string, salt: string) {
        
       // console.log("here"+this.subscription.user.name);
        const name = this.subscription.user.name.replace(/\s/g, '');
        const mobile = this.subscription.user.mobile_number.replace(/\s/g, '');
        const email = this.subscription.user.email.replace(/\s/g, '');
        const bookingId = String(Math.floor(Math.random() * (99 - 10 + 1) + 10)) + String(this.subscription.id);
        //const productinfo = this.subscription.title.replace(/\s/g, '');
        const productinfo='subscription';
         const amt = this.subscription.membershipPlan.price;
         console.log("Amt"+amt);
         //const amt=1;
        const checksum = key + '|' + bookingId + '|' + amt + '|' + productinfo + '|' + name + '|' + email + '|||||||||||' + salt;
       const encrypttext = sha512(checksum);
        const furl = this.config.apiBase + 'api/payment/payu/' + this.subscription.payment.id + '?result=failed';
        const surl = this.config.apiBase + 'api/payment/payu/' + this.subscription.payment.id + '?result=success';

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
                console.log(event.url);
                if (event.url == surl) {
                    this.payumoneyDone = true;
                    this.refreshSettings();
                    this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 3000));
                    browser.close();
                }
                if (event.url == furl) {
                    this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
                    browser.close();
                }
            });
            // browser.on('exit').subscribe(event => {
            //     if (!this.payumoneyDone) {
            //         this.markPayuFail();
            //         if (!this.payumoneyFailAlerted) {
            //             this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
            //         }
            //     }
            // });
            // browser.on('loaderror').subscribe(event => {
            //     this.markPayuFail();
            //     this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
            // });
        } catch (e) {
            //this.markPayuFail();
        }
    }

    refreshSettings() {
          this.apiService.refreshSettings().subscribe(res => { console.log('getSettings', res); Helper.setSettings(res); this.apiService.reloadSetting(); this.eComService.initialize(); }, err => console.log('getSettings', err));
        
      }

    private markPayuFail() {
        this.orderFailed = true;
        this.apiService.postURL(this.config.apiBase + 'api/payment/payu/' + this.subscription.payment.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
    }
private markRazorSuccess(rzr: any) {

  
      this.razorpayment = new RazorPayment();
      this.orderFailed = false;
      this.payumoneyDone = true;
      this.razorpayment.id=this.subscription.payment.id;
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
  
  private initRazorPayMoney(key: string, salt: string) {
    const name = this.subscription.user.name.replace(/\s/g, '');
    const mobile = this.subscription.user.mobile_number.replace(/\s/g, '');
    const email = this.subscription.user.email.replace(/\s/g, '');
    const bookingId = String(Math.floor(Math.random() * (99 - 10 + 1) + 10)) + String(this.subscription.id);
    //const productinfo = this.subscription.title.replace(/\s/g, '');
    const productinfo='subscription';
     const amt = this.subscription.membershipPlan.price;
     
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
      this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 3000));
     
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
      this.apiService.postURL(this.config.apiBase + 'api/payment/payu/' + this.subscription.payment.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
  }

}
