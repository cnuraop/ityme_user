import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Product } from 'src/models/product.models';
import { Doctor } from 'src/models/doctor.models';
import { Hospital } from 'src/models/hospital.models';
import { Helper } from 'src/models/helper.models';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Constants } from 'src/models/constants.models';
import { ExpressECommerceService } from '../services/common/ecommerce.service';
import { TitlePage } from '../title/title.page';
import { MyAddress } from 'src/models/address.models';

@Component({
  selector: 'app-saved-items',
  templateUrl: './saved-items.page.html',
  styleUrls: ['./saved-items.page.scss']
})
export class SavedItemsPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  isLoading = true;
  currencyIcon: string;
  products = new Array<Product>();
  doctors = new Array<Doctor>();
  hospitals = new Array<Hospital>();
  toShow = new Array<any>();
  tab: string = "medicine";
  location: MyAddress;

  constructor(private translate: TranslateService, private uiElementService: UiElementsService, private apiService: ApiService,
    private callNumber: CallNumber, private iab: InAppBrowser, private modalController: ModalController, private navCtrl: NavController, public eComService: ExpressECommerceService) {
    this.translate.get("loading").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.loadProductsSaved();
      // this.loadDoctorsSaved();
      // this.loadHospitalsSaved();
    });
  }

  ngOnInit() {
    this.currencyIcon = Helper.getSetting("currency_icon");
    this.location=Helper.getAddressSelected();
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  segmentChanged(event) {
    switch (this.tab) {
      case "medicine":
        this.toShow = this.products;
        break;
      case "doctors":
        this.toShow = this.doctors;
        break;
      case "hospitals":
        this.toShow = this.hospitals;
        break;
    }
  }

  updateAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["address_creating"]);
      this.subscriptions.push(this.apiService.addressUpdate(this.location).subscribe(res => {
        this.uiElementService.dismissLoading();
        this.selectAddress(res);
      }, err => {
        console.log("addressAdd", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentToast(values["something_wrong"]);
      }));
    });
  }

  selectAddress(address: MyAddress) {
    Helper.setAddressSelected(address);
  }

  addProCart(pro: Product) {
    if(this.location.address2 ==null)
    {
    this.modalController.create({ component: TitlePage, componentProps: { address: this.location } }).then((modalElement) => {
      modalElement.onDidDismiss().then(data => {
        if (data && data.data) {
          this.location = data.data;
          this.updateAddress();
        }
      });
      modalElement.present();
    })
  }
    let added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
    if (added == -1) {
      //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
      this.uiElementService.alertCartConflict().then(res => {
        if (res) { this.eComService.clearCart(); this.addProCart(pro); }
      });
    }
  }

  removeProCart(pro: Product) {
    this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromProduct(pro));
  }

  quantityProCart(pro: Product) {
    return this.eComService.quantityCartItem(this.eComService.getCartItemFromProduct(pro));
  }

  private loadProductsSaved() {
    this.subscriptions.push(this.apiService.getFavoriteProducts().subscribe(res => {
      this.products = res;
      this.toShow = this.products;
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }, err => {
      console.log("getFavoriteProducts", err);
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }));
  }

  cart() {
    this.navCtrl.navigateForward(['./my-express-cart']);
    // if (this.selectedLocation && this.selectedLocation.latitude && this.selectedLocation.longitude) {
    //   this.navCtrl.navigateForward(['./my-cart']);
    // } else {
    //   this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
    // }
}

  public addSavedItemsToCart(){
//logic to add all items to cart

this.products.forEach(element => {
  this.addProCart(element);  
});

  }

  private loadDoctorsSaved() {
    this.subscriptions.push(this.apiService.getFavoriteDoctors().subscribe(res => this.doctors = res, err => console.log("getFavoriteDoctors", err)));
  }

  private loadHospitalsSaved() {
    this.subscriptions.push(this.apiService.getFavoriteHospitals().subscribe(res => this.hospitals = res, err => console.log("getFavoriteHospitals", err)));
  }

  navProDetail(pro) {
    let navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
  }

  navDocProfile(doc) {
    window.localStorage.setItem(Constants.TEMP_DOCTOR, JSON.stringify(doc));
    this.navCtrl.navigateForward(['./doctor-profile']);
  }

  dialHospital(hospital: Hospital) {
    if (hospital.meta && hospital.meta.phone) {
      this.callNumber.callNumber(hospital.meta.phone, false).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
    } else {
      this.translate.get("phone_unavailable").subscribe(value => this.uiElementService.presentToast(value));
    }
  }

  navHospital(hospital: Hospital) {
    this.iab.create((("http://maps.google.com/maps?daddr=" + hospital.latitude + "," + hospital.longitude)), "_system");
  }

  navHospitalInfo(hos) {
    window.localStorage.setItem(Constants.TEMP_HOSPITAL, JSON.stringify(hos));
    this.navCtrl.navigateForward(['./hospital-info']);
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
