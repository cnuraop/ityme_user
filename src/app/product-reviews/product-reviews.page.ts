import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from 'src/models/product.models';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Rating } from 'src/models/rating.models';
import { Review } from 'src/models/review.models';
import { BaseListResponse } from 'src/models/base-list.models';
import { Helper } from 'src/models/helper.models';
import { Vendor } from 'src/models/vendor.models';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.page.html',
  styleUrls: ['./product-reviews.page.scss'],
})
export class ProductReviewsPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  private infiniteScrollEvent;
  private nextUrl: string;
  isLoading = true;
  product = new Product();
  rating: Rating;
  reviews = new Array<Review>();

  constructor(private router: Router, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService) { }

  ngOnInit() {
    // this.rating = Rating.getDefault();
    if (this.router.getCurrentNavigation().extras.state) {
      this.product = this.router.getCurrentNavigation().extras.state.product;
    }
  }

  ionViewDidEnter() {
    if (!this.once) {
      this.translate.get("loading").subscribe(value => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(this.apiService.getReviewsProduct(this.product.id, 1).subscribe(res => this.reviewsRes(res), err => this.reviewsErr(err)));
      });
    }
    this.once = true;
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  private reviewsRes(res: BaseListResponse) {
    this.reviews = this.reviews.concat(res.data);
    console.log('review', this.reviews);
    this.nextUrl = res.links.next;
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();
  }

  private reviewsErr(err) {
    console.log("productsErr", err);
    this.uiElementService.dismissLoading();
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
  }

  doInfiniteReviews(event) {
    if (this.nextUrl == null) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
        let locale = Helper.getLocale();
        for (let review of res.data) review.created_at = Helper.formatTimestampDate(review.created_at, locale);
        this.reviewsRes(res);
      }, err => this.reviewsErr(err)));
    }
  }

}
