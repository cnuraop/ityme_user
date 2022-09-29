import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Helper } from 'src/models/helper.models';
import { BaseListResponse } from 'src/models/base-list.models';
import { Subscription } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../app.config';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Doctor } from 'src/models/doctor.models';
import { MyAddress } from 'src/models/address.models';
import { NavigationExtras } from '@angular/router';
import { Constants } from 'src/models/constants.models';

@Component({
  selector: 'app-specilities',
  templateUrl: './specilities.page.html',
  styleUrls: ['./specilities.page.scss']
})
export class SpecilitiesPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  private infiniteScrollEvent;
  private selectedLocationNew: MyAddress;
  private nextUrl: string;
  currency_icon: string;
  lastSearchString: string;
  searchHistory = new Array<string>();
  doctors = new Array<Doctor>();
  isLoading = true;

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService, private eComService: ECommerceService) { }

  ngOnInit() {
    this.searchHistory = Helper.getSearchHistory("doc");
    this.currency_icon = Helper.getSetting("currency_icon");
    this.selectedLocationNew = Helper.getAddressSelected();
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
    Helper.setSearchHistory(this.searchHistory, "doc");
  }

  onSearchbarChange(event) {
    let query = "";
    if (event && event.detail && event.detail.value) query = event.detail.value.toLowerCase().trim();
    if (query.length) this.doSearch(query);
  }

  doSearch(queryIn) {
    this.isLoading = true;
    this.lastSearchString = queryIn;
    this.doctors = [];
    this.nextUrl = null;
    this.translate.get("loading").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.subscriptions.push(this.apiService.getDoctorsWithQuery(queryIn, 1, this.selectedLocationNew).subscribe(res => this.handleRes(res), err => this.handleErr(err)));
    });
  }

  handleRes(res: BaseListResponse) {
    this.doctors = this.doctors.concat(res.data);
    this.nextUrl = res.links.next;
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();

    if (res.data && res.data.length) if (!this.searchHistory.includes(this.lastSearchString)) this.searchHistory.unshift(this.lastSearchString);
    if (this.searchHistory.length > 3) this.searchHistory.splice(3, 1);
    Helper.setSearchHistory(this.searchHistory, "doc");
  }

  handleErr(err) {
    console.log("handleErr", err);
    this.uiElementService.dismissLoading();
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
  }

  doInfiniteDoctors(event) {
    if (this.nextUrl == null) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
        if (res && res.data && res.data.length) for (let pro of res.data) this.apiService.setupDoctor(pro);
        this.handleRes(res);
      }, err => this.handleErr(err)));
    }
  }

  navDocProfile(doc) {
    window.localStorage.setItem(Constants.TEMP_DOCTOR, JSON.stringify(doc));
    this.navCtrl.navigateForward(['./doctor-profile']);
  }

  bookDoc(doc) {
    if (Helper.getLoggedInUser() != null) {
      let doctor = new Doctor();
      doctor.id = doc.id;
      doctor.name = doc.name;
      doctor.availability = doc.availability;
      doctor.image = doc.image;
      doctor.user = doc.user;
      doctor.user_id = doc.user_id;
      doctor.specializations_text = doc.specializations_text;
      doctor.consultancy_fee = doc.consultancy_fee;
      doctor.hospitalClosest = doc.hospitalClosest;

      let navigationExtras: NavigationExtras = { state: { doctor: doctor } };
      this.navCtrl.navigateForward(['./appointment-book'], navigationExtras);
    } else {
      this.alertLogin();
    }
  }

  private alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }
}
