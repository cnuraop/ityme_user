import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UiElementsService } from '../services/common/ui-elements.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/network/api.service';
import { Doctor } from 'src/models/doctor.models';
import { RateRequest } from 'src/models/rate-request.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-feedback',
  templateUrl: './add-feedback.page.html',
  styleUrls: ['./add-feedback.page.scss']
})
export class AddFeedbackPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  doctor: Doctor;
  rateReason: string;
  rateRequest = new RateRequest();
  rateReasonExists = false;

  constructor(private router: Router, private navCtrl: NavController, private uiElementService: UiElementsService,
    private translate: TranslateService, private apiService: ApiService) {
    console.log("getCurrentNavigation", this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.doctor = this.router.getCurrentNavigation().extras.state.doctor;
      this.rateReason = this.router.getCurrentNavigation().extras.state.rateReason;
      this.rateRequest.rating = 3;
      this.rateReasonExists = (this.rateReason != null && this.rateReason.length > 0);
    }
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  setRating(rating) {
    this.rateRequest.rating = rating;
  }

  submitRating() {
    if (!this.rateRequest.review || !this.rateRequest.review.length) {
      this.translate.get("err_review").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.translate.get("just_moment").subscribe(value => {
        this.uiElementService.presentToast(value);
        this.subscriptions.push(this.apiService.postReviewDoctor(this.doctor.id, this.rateRequest).subscribe(res => {
          console.log("postReviewProduct", res);
          // Helper.addReviewedProductId(String(this.order_id + String(this.product.id)));
          this.uiElementService.dismissLoading();
          this.translate.get("review_done").subscribe(value => this.uiElementService.presentToast(value));
          this.navCtrl.navigateRoot(['./tabs']);
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
