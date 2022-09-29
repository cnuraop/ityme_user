import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Doctor } from 'src/models/doctor.models';
import { NavController } from '@ionic/angular';
import { UiElementsService } from '../services/common/ui-elements.service';
import { Subscription } from 'rxjs';
import { Helper } from 'src/models/helper.models';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/network/api.service';
import { BaseListResponse } from 'src/models/base-list.models';
import { Review } from 'src/models/review.models';
import { APP_CONFIG, AppConfig } from '../app.config';
import { Constants } from 'src/models/constants.models';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.page.html',
  styleUrls: ['./doctor-profile.page.scss']
})
export class DoctorProfilePage implements OnInit {
  private subscriptions = new Array<Subscription>();
  private infiniteScrollEvent;
  private nextUrl: string;
  isLoading = true;
  private initialized = false;
  favorite_icon = false;
  tabDprofile: string = "about";
  doctor: Doctor;
  currencyIcon: string;
  availabilityToday: string;
  reviews = new Array<Review>();
  doc_map: string;

  constructor(private navCtrl: NavController, private uiElementService: UiElementsService,
    @Inject(APP_CONFIG) private config: AppConfig, private translate: TranslateService, private apiService: ApiService) { }

  ngOnInit() {
    this.doctor = JSON.parse(window.localStorage.getItem(Constants.TEMP_DOCTOR));
    let parameters = new URLSearchParams();
    parameters.append("size", "400x200");
    parameters.append("markers", "color:red|" + this.doctor.latitude + "," + this.doctor.longitude);
    parameters.append("zoom", "13");
    parameters.append("key", this.config.googleApiKey);
    this.doc_map = "https://maps.googleapis.com/maps/api/staticmap?" + parameters.toString();

    this.currencyIcon = Helper.getSetting("currency_icon");
    for (let avail of this.doctor.availability) {
      if (avail.days == String(new Date().toLocaleString('en-us', { weekday: 'short' })).toLocaleLowerCase()) {
        this.translate.get((avail.selected ? "to" : "closed_today")).subscribe(value => (this.availabilityToday = avail.selected ? (avail.from + " " + value + " " + avail.to) : value));
        break;
      }
    }

    // this.translate.get("loading").subscribe(value => {
    //   this.uiElementService.presentLoading(value);
    //   this.subscriptions.push(this.apiService.getReviewsDoctor(this.doctor.id, 1).subscribe(res => this.reviewsRes(res), err => this.reviewsErr(err)));
    // });

    window.localStorage.removeItem(Constants.TEMP_DOCTOR);
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    // if (!this.initialized) {
    //   let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement, null).then(() => {
    //     this.initialized = true;
    //     this.plotMarkers();
    //   }).catch(err => { console.log("maps.init", err); });
    //   mapLoaded.catch(err => { console.log("mapLoaded", err); });
    // }
  }

  toggleFavorite() {
    if (Helper.getLoggedInUser() != null) {
      this.translate.get("just_moment").subscribe(value => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(this.apiService.toggleFavoriteDoctor(this.doctor.id).subscribe(res => {
          this.doctor.is_favourite = !this.doctor.is_favourite;
          this.uiElementService.dismissLoading();
        }, err => {
          console.log("toggleProductFavorite", err);
          this.uiElementService.dismissLoading();
        }));
      });
    } else {
      this.alertLogin();
    }
  }

  navBookNow() {
    if (Helper.getLoggedInUser() != null) {
      let doctor = new Doctor();
      doctor.id = this.doctor.id;
      doctor.name = this.doctor.name;
      doctor.availability = this.doctor.availability;
      doctor.image = this.doctor.image;
      doctor.user = this.doctor.user;
      doctor.user_id = this.doctor.user_id;
      doctor.specializations_text = this.doctor.specializations_text;
      doctor.consultancy_fee = this.doctor.consultancy_fee;
      doctor.hospitalClosest = this.doctor.hospitalClosest;

      let navigationExtras: NavigationExtras = { state: { doctor: doctor } };
      this.navCtrl.navigateForward(['./appointment-book'], navigationExtras);
    } else {
      this.alertLogin();
    }
  }

  // navFeedback() {
  //   let doctor = new Doctor();
  //   doctor.id = this.doctor.id;
  //   doctor.name = this.doctor.name;
  //   doctor.image = this.doctor.image;
  //   doctor.user = this.doctor.user;
  //   doctor.user_id = this.doctor.user_id;
  //   doctor.specializations_text = this.doctor.specializations_text;

  //   let navigationExtras: NavigationExtras = { state: { doctor: doctor } };
  //   this.navCtrl.navigateForward(['./add-feedback'], navigationExtras);
  // }

  // doInfiniteReviews(event) {
  //   if (this.nextUrl == null) {
  //     event.target.complete();
  //   } else {
  //     this.infiniteScrollEvent = event;
  //     this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
  //       let locale = Helper.getLocale();
  //       for (let review of res.data) review.created_at = Helper.formatTimestampDate(review.created_at, locale);
  //       this.reviewsRes(res);
  //     }, err => this.reviewsErr(err)));
  //   }
  // }

  // private reviewsRes(res: BaseListResponse) {
  //   this.reviews = this.reviews.concat(res.data);
  //   this.nextUrl = res.links.next;
  //   if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  //   this.isLoading = false;
  //   this.uiElementService.dismissLoading();
  // }

  // private reviewsErr(err) {
  //   console.log("productsErr", err);
  //   this.uiElementService.dismissLoading();
  //   if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  //   this.isLoading = false;
  // }

  private alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }
    
  navDocrorReviews() {
    let navigationExtras: NavigationExtras = { state: { doctor: this.doctor } };
    this.navCtrl.navigateForward(['./doctor-reviews'], navigationExtras);
  }

  navHospitalInfo(hos) {
    window.localStorage.setItem(Constants.TEMP_HOSPITAL, JSON.stringify(hos));
    this.navCtrl.navigateForward(['./hospital-info']);
  }

}
