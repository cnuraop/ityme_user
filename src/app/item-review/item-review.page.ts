import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { RateRequest } from 'src/models/rate-request.models';
import { Helper } from 'src/models/helper.models';
import { Order } from 'src/models/order.models';
import { Product } from 'src/models/product.models';

@Component({
  selector: 'app-item-review',
  templateUrl: './item-review.page.html',
  styleUrls: ['./item-review.page.scss'],
})
export class ItemReviewPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  order: Order;
  rateRequest = new Array<RateRequest>();
  products = new Array<Product>();

  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService) {
    console.log("getCurrentNavigation", this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.order = this.router.getCurrentNavigation().extras.state.order;
      this.order.products.map((element) => { if (!element.vendor_product.product.reviewed) { this.rateRequest.push({rating : 5,review : ''}); this.products.push(element.vendor_product.product) } })
      // this.rateRequest.rating = 3;
    }
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  setRating(rating, index) {
    this.rateRequest[index].rating = rating;
  }

  submitRating(index) {
    if (!this.rateRequest[index].review || !this.rateRequest[index].review.length) {
      this.translate.get("err_review").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.translate.get("just_moment").subscribe(value => {
        this.uiElementService.presentToast(value);
        this.subscriptions.push(this.apiService.postReviewProduct(this.products[index].id, this.rateRequest[index]).subscribe(res => {
          console.log("postReviewProduct", res);
          Helper.addReviewedProductId(String(this.order.id + String(this.products[index].id)));
          this.uiElementService.dismissLoading();
          this.translate.get("review_done").subscribe(value => this.uiElementService.presentToast(value));
          // this.navCtrl.navigateRoot(['./home']);
          this.navCtrl.pop();
        }, err => {
          this.uiElementService.dismissLoading();
          console.log("postReviewProduct", err);
          let found = false;
          if (err && err.error && err.error.errors) {
            if (err.error.errors.review) {
              found = true;
              this.translate.get("err_review_length").subscribe(value => this.uiElementService.presentErrorAlert(value));
            }
          }
          if (!found) this.translate.get("something_went_wrong").subscribe(value => this.uiElementService.presentErrorAlert(value));
          this.navCtrl.pop();

        }));
      });
    }
  }

}