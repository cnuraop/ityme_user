import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrescriptionPage } from '../prescription/prescription.page';
import { ModalController, NavController } from '@ionic/angular';
import { ECommerceService } from '../services/common/ecommerce.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { Helper } from 'src/models/helper.models';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/network/api.service';
import { Coupon } from 'src/models/coupon.models';
import { Constants } from 'src/models/constants.models';
import { Router } from '@angular/router';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import * as moment from 'moment';
declare let fbq: Function;
@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss']
})
export class MyCartPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  fabAction = true;
  couponCode: string;
  currency_icon: string;
  couponRes: Coupon;
  showPrescription: boolean;

  public isSubscribed = false;
  constructor(private route: Router, private navCtrl: NavController, private modalController: ModalController, private translate: TranslateService,
    public eComService: ECommerceService, private uiElementService: UiElementsService, private apiService: ApiService, private photoViewer: PhotoViewer) { }

  ngOnInit() {
    this.currency_icon = Helper.getSetting("currency_icon");
    this.eComService.removeCoupon();
    this.showPrescription = this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL) != null;

    //this.verifySubscription();
    //console.log("subsc"+this.isSubscribed);
  }


  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    // if (!this.once) {
    let tempCouponCode = window.localStorage.getItem(Constants.TEMP_COUPON);
    if (tempCouponCode != null && tempCouponCode.length) {
      this.couponCode = tempCouponCode;
      this.verifyCoupon();
    }
    fbq('track', 'Cart');
    window.localStorage.removeItem(Constants.TEMP_COUPON);
    this.verifySubscription();
    // }
    // this.once = true;
  }

  removeOrDecrementCartItemAndCheck(ci) {
    let removed = this.eComService.removeOrDecrementCartItem(ci);
    if (removed) {
      let needsPrescription = false;
      for (let ci of this.eComService.getCartItems()) {
        if (ci.product.prescription_required) {
          needsPrescription = true;
          break;
        }
      }
      if (!needsPrescription) this.removePrescription();
      if (!this.eComService.getCartItems().length) {
        this.couponCode = "";
        this.couponRes = null;
        this.applyCoupon();
      }
    }
  }

  verifyCoupon() {
    if (Helper.getLoggedInUser() != null) {
      if (this.couponCode && this.couponCode.length) {
        this.translate.get(["verifying", "invalid_coupon"]).subscribe(values => {
          this.uiElementService.presentLoading(values["verifying"]);
          this.subscriptions.push(this.apiService.checkCoupon(this.couponCode).subscribe(res => {
            this.uiElementService.dismissLoading();
            if (moment(res.expires_at).diff(moment()) > 0) {
              this.couponRes = res;
              this.applyCoupon();
              this.uiElementService.presentToast("Hurray, coupon applied successfully!");
            } else {
              this.couponRes = null;
              this.uiElementService.presentToast(values["invalid_coupon"]);
            }
          }, err => {
            this.couponCode = "";
            this.couponRes = null;
            this.uiElementService.presentToast(values["invalid_coupon"]);
            // console.log("checkCoupon", err);
            this.uiElementService.dismissLoading();
          }));
        });
      } else {
        this.translate.get("err_field_coupon").subscribe(value => this.uiElementService.presentToast(value));
      }
    } else {
      this.alertLogin();
    }
  }

  removeCoupon() {
    this.couponCode = "";
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
      if (res.message == 1) {
        this.isSubscribed = true;   //console.log(res.message);
      }
    }, err => {
      this.isSubscribed = false;
    });
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
        this.modalController.create({ component: PrescriptionPage }).then((modalElement) => {
          modalElement.onDidDismiss().then(data => {
            console.log(data);
            if (data && data.data) {
              this.translate.get('uploaded_prescription').subscribe(value => this.uiElementService.presentToast(value));
              this.eComService.setupOrderRequestMeta(Constants.KEY_PRESCRIPTION_URL, data.data);
              this.showPrescription = true;
            }
          });
          modalElement.present();
        })
      } else {
        this.navCtrl.navigateForward(['./confirm-order']);
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
    let isPrescriptionUploaded = this.eComService.getOrderRequestMetaKey(Constants.KEY_PRESCRIPTION_URL) != null;
    this.eComService.removeOrderRequestMeta(Constants.KEY_PRESCRIPTION_URL);
    this.showPrescription = false;
    if (isPrescriptionUploaded) this.translate.get('removed_prescription').subscribe(value => this.uiElementService.presentToast(value));
  }
}
