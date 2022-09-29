import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Coupon } from 'src/models/coupon.models';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Constants } from 'src/models/constants.models';
import { MembershipModel } from 'src/models/membership-plan.models';
import * as moment from 'moment';
import { Helper } from 'src/models/helper.models';
import { NavigationExtras } from '@angular/router';
import { ECommerceService } from '../services/common/ecommerce.service';
import { PaymentMethod } from 'src/models/payment-method.models';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  membershipPlans = new Array<MembershipModel>();
  model: MembershipModel;
  isLoading = true;
  text = "Subscribe";
  subscribed = false;
  paymentMethods = new Array<PaymentMethod>();
  paymentMethoIdSelected = -1;
  offers = new Array<Coupon>();

  constructor(private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService) {

    this.translate.get("loading").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.getOffers();
    });
  }
  ionViewDidEnter() {
    this.translate.get("loading").subscribe(value => {
      this.verifySubscription();
    }, err => {
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    });
  }

  ngOnInit() {
    this.getMembershipPlans();
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  getMembershipPlans() {

    if (this.model == undefined) {
      this.apiService.getMembershipPlans().subscribe(res => {
        //this.isLoading = true;
        this.membershipPlans = this.membershipPlans.concat(res);
        this.uiElementService.dismissLoading();
      }, err => {
        this.isLoading = false;
        this.uiElementService.dismissLoading();
      });
    }
  }

  verifySubscription() {
    if (Helper.getLoggedInUser() != null) {
      this.translate.get('loading').subscribe(value => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(this.apiService.checkSubscription().subscribe(res => {
          this.model = res;
          this.subscribed = true;
          this.membershipPlans = [];
          this.membershipPlans.push(this.model);
          this.text = "Subscribed";
          this.uiElementService.dismissLoading();
        }, err => {
          this.model = null;
          this.uiElementService.dismissLoading();

        }));
      });
    } else {
      this.alertLogin();
    }
  }

  getOffers() {
    this.apiService.getCoupons().subscribe(res => {
      this.isLoading = false;
      this.offers = this.offers.concat(res.filter(coupon => coupon.meta.type != "private"));
      this.uiElementService.dismissLoading();
    }, err => {
      console.log("getCoupons", err);
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    });
  }

  copyOffer(offer: Coupon) {
    // this.clipboard.copy(offer.code).then(res => {
    //   console.log("clipboard", res);
    //   this.translate.get("code_copied").subscribe(value => this.uiElementService.presentToast(value));
    // }).catch(err => console.log("clipboard", err));
    // window.localStorage.setItem(Constants.TEMP_COUPON, offer.code);
    // this.navCtrl.pop();
  }


  placeOrder(subscriptionRequest) {
    if (!this.subscribed) {
      let paymentMethod = new PaymentMethod();
      paymentMethod.id = 1;
      paymentMethod.slug = "payu";
      paymentMethod.title = "Pay U";
      paymentMethod.meta = "{ \"public_key\": \"qpnIV3\", \"private_key\": \"QPC4wdgn\" }";
      subscriptionRequest = this.eComService.setupSubscriptionRequestPaymentMethod(subscriptionRequest, paymentMethod);
      //console.log("3" + subscriptionRequest.price);
      this.translate.get(['subscription_placing', 'subscription_placed', 'subscription_place_err']).subscribe(values => {
        this.apiService.AddMembershipPlanUser(subscriptionRequest).subscribe(res => {
          // console.log("result" + res.membership.user.name);
          this.uiElementService.dismissLoading();
          const navigationExtras: NavigationExtras = { state: { membership: res.membership, payment: paymentMethod } };
          this.navCtrl.navigateRoot(['./pay-subscription'], navigationExtras);
        }, err => {
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values.order_place_err);
        });
      });
    }
  }

  onPaymentMethodSelected(event) {
    if (event.detail && event.detail.value) {
      this.paymentMethoIdSelected = event.detail.value;
    }
    // console.log(this.paymentMethoIdSelected)
  }

  private getSelectedPaymentMethod(): PaymentMethod {
    let toReturn = null;
    for (let pm of this.paymentMethods) if (this.paymentMethoIdSelected == pm.id) { toReturn = pm; break; }
    return toReturn;
  }
  alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

  navHome() {
    this.navCtrl.navigateRoot(['./tabs']);
  }

}
