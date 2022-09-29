import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { OrderPayment } from 'src/models/order-payment.models';
import { PaymentMethod, RazorPayment } from 'src/models/payment-method.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { AppConfig, APP_CONFIG } from '../app.config';
import { sha512 } from 'js-sha512';
import { MyEventsService } from '../services/events/my-events.service';
import { Helper } from 'src/models/helper.models';
declare var Razorpay: any;
@Component({
  selector: 'app-add-money',
  templateUrl: './add-money.page.html',
  styleUrls: ['./add-money.page.scss'],
})
export class AddMoneyPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  private payumoneyDone = false;
  private payumoneyFailAlerted = false;
  paymentMethods = new Array<PaymentMethod>();
  paymentMethoIdSelected = -1;
  amount = 500;
  razorpayment: RazorPayment;

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
    "theme": {
      "color": "#8DC540"
    },
    "modal": {
      "ondismiss": function () {
        this.translate.get('payment_retry').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
        // this.markPayuFail(); 
        this.navCtrl.navigateForward(['./wallet']);
      }.bind(this)
    },
  };

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private apiService: ApiService, private translate: TranslateService,
    private inAppBrowser: InAppBrowser, private uiElementService: UiElementsService, private navCtrl: NavController,
    private myEventsService: MyEventsService) { }


  ngOnInit() {
    // Default selection of money
    this.paymentMethoIdSelected = 2;
  }

  ionViewDidEnter() {
    if (!this.once) {
      this.translate.get("loading").subscribe(value => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(this.apiService.getPaymentMethods().subscribe(res => {
          this.paymentMethods = this.spliceFor(res, ["cod", "wallet"]);
          this.uiElementService.dismissLoading();

        }, err => {
          console.log("getPaymentMethods", err);
          this.uiElementService.dismissLoading();
        }));
      });
    }
    this.once = true;
  }

  initAdd() {
    let selectedPaymentMethod = this.getSelectedPaymentMethod();
    if (this.amount && this.amount > 0 && selectedPaymentMethod != null) {
      this.translate.get(["just_moment", "something_wrong", "payment_method_not_setup"]).subscribe(values => {
        this.uiElementService.presentLoading(values["just_moment"]);
        this.subscriptions.push(this.apiService.walletDeposit({ amount: String(this.amount), payment_method_slug: selectedPaymentMethod.slug }).subscribe(res => {
          this.uiElementService.dismissLoading();
          let keysMeta = JSON.parse(selectedPaymentMethod.meta);
          if (selectedPaymentMethod.slug == "payu" && keysMeta && keysMeta.public_key && keysMeta.private_key) {
            //this.initPayUMoney(keysMeta.public_key, keysMeta.private_key, res);
            this.initRazorPayMoney(keysMeta.key_id, keysMeta.key_secret, res);
          }
          else if (selectedPaymentMethod.slug == "razorpay" && keysMeta && keysMeta.key_id && keysMeta.key_secret) {
            this.initRazorPayMoney(keysMeta.key_id, keysMeta.key_secret, res);
          }
          else {
            this.uiElementService.presentToast(values["payment_method_not_setup"]);
          }
        }, err => {
          console.log("walletDeposit", err);
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values["something_wrong"]);
        }));
      });
    }
  }

  private initPayUMoney(key: string, salt: string, payment: OrderPayment) {
    let name = this.apiService.getUserMe().name.replace(/\s/g, '');
    let mobile = this.apiService.getUserMe().mobile_number.replace(/\s/g, '');
    let email = this.apiService.getUserMe().email.replace(/\s/g, '');
    let bookingId = String(Math.floor(Math.random() * (99 - 10 + 1) + 10)) + String(payment.id);
    let productinfo = "Wallet Recharge";
    let amt = payment.amount;
    let checksum = key + "|" + bookingId + "|" + amt + "|" + productinfo + "|" + name + "|" + email + '|||||||||||' + salt;
    let encrypttext = sha512(checksum);
    let furl = this.config.apiBase + "api/payment/payu/" + payment.id + "?result=failed";
    let surl = this.config.apiBase + "api/payment/payu/" + payment.id + "?result=success";

    let url = this.config.apiBase + "assets/vendor/payment/payumoney/payuBiz.html?amt=" + amt + "&name=" + name + "&mobileNo=" + mobile + "&email=" + email + "&bookingId=" + bookingId + "&productinfo=" + productinfo + "&hash=" + encrypttext + "&salt=" + salt + "&key=" + key + "&furl=" + furl + "&surl=" + surl;

    console.log("payuurl", url);
    let options: InAppBrowserOptions = {
      location: 'yes',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'no',
      hideurlbar: 'yes',
      closebuttoncaption: 'back'
    };
    const browser: any = this.inAppBrowser.create(url, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      console.log("loadstop", String(event.url));
      if (event.url == surl) {
        this.payumoneyDone = true;
        this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, "bottom", 3000));
        browser.close();
        this.myEventsService.setWalletData("true");
        this.navCtrl.pop();
      }
      if (event.url == furl) {
        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, "bottom", 2000));
        browser.close();
      }
    });
    browser.on('exit').subscribe(event => {
      if (!this.payumoneyDone && !this.payumoneyFailAlerted) {
        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, "bottom", 2000));
      }
    });
    browser.on('loaderror').subscribe(event => {
      this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, "bottom", 2000));
    });
  }



  onPaymentMethodSelected(event) {
    if (event.detail && event.detail.value) {
      this.paymentMethoIdSelected = event.detail.value;
    }
    console.log(this.paymentMethoIdSelected)
  }

  private getSelectedPaymentMethod(): PaymentMethod {
    let toReturn = null;
    for (let pm of this.paymentMethods) if (this.paymentMethoIdSelected == pm.id) { toReturn = pm; break; }
    return toReturn;
  }

  private initRazorPayMoney(key: string, salt: string, payment: OrderPayment) {
    const name = Helper.getLoggedInUser().name;
    const mobile = Helper.getLoggedInUser().mobile_number.replace(/\s/g, '');
    const email = Helper.getLoggedInUser().email.replace(/\s/g, '');

    this.razorpayment = new RazorPayment();
    this.razorpayment.amount = (payment.amount * 100).toString();
    this.razorpayment.id=payment.id;
    // this.paymentId = '';
    this.apiService.creatRazorOrder(this.razorpayment).subscribe(
      data => {
        // this.options.key = data.secretKey;
        this.options.order_id = data.razorpayOrderId;
        // this.options.amount = data.applicationFee; //paise
        this.options.key = "rzp_live_IU4OXE829Ye0R2";
        //this.options.order_id = "order_JGNezKOqZ4M1Sh";
        this.options.amount = (payment.amount * 100).toString(); //paise
        this.options.prefill.name = name;
        this.options.prefill.email = email;
        this.options.prefill.contact = mobile;
        var rzp1 = new Razorpay(this.options);
        rzp1.open();

        rzp1.on('payment.failed', function (response) {
          this.error = response.error.reason;
          this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));

        }
        );
      }
      ,
      err => {
        this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));

      }
    );

  }

  @HostListener('window:payment.success', ['$event'])
  onPaymentSuccess(event): void {

    this.payumoneyDone = true;
    this.translate.get('payment_success').subscribe(text => this.uiElementService.presentToast(text, "bottom", 3000));

    this.myEventsService.setWalletData("true");
    this.razorpayment.razorpay_payment_id=event.detail.razorpay_payment_id;
    this.markRazorSuccess(this.razorpayment);
  }

  @HostListener('window:payment.fail', ['$event'])
  onPaymentFail(event): void {
    this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, "bottom", 2000));

  }

  private markRazorFail(rzr: any) {
    this.apiService.postURL(this.config.apiBase + 'api/payment/razorpay/' + rzr.id + '?result=failed').subscribe(res => console.log(res), err => console.log(err));
    this.translate.get('payment_fail').subscribe(text => this.uiElementService.presentToast(text, 'bottom', 2000));
}

private markRazorSuccess(rzr: any) {
    this.apiService.updateRazorPayment(rzr).subscribe(res => {
        this.payumoneyDone = true;
    this.navCtrl.pop();
    }, err => {
    });

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

}
