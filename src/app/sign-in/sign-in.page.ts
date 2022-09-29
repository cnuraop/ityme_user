import { Component, OnInit, Inject } from '@angular/core';
import { NavController, AlertController, Platform } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { APP_CONFIG, AppConfig } from '../app.config';
import { MyEventsService } from '../services/events/my-events.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { SocialLoginRequest } from 'src/models/sociallogin-request.models';
import { AuthResponse } from 'src/models/auth-response.models';
import { Helper } from 'src/models/helper.models';
import { Constants } from 'src/models/constants.models';
import { appCommonMethods } from '../services/common/appCommonMethods';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { MyAddress } from 'src/models/address.models';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss']
})
export class SignInPage implements OnInit {
  countries: any;
  phoneNumber: string;
  countryCode = "91";
  phoneNumberFull: string;
  phoneNumberHint: string;
  pincode: string;
  deliverySlots: DeliverySlot[];
  location: MyAddress;
  private subscriptions = new Array<Subscription>();
  slideOpts = {
    slidesPerView: 1,
    centeredSlides: true,
    loop: true,
    autoplay: true,
    pagination: false,
    speed: 500,
    direction: 'horizontal'
  }

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private myEvent: MyEventsService,
    private uiElementService: UiElementsService, private apiService: ApiService, private translate: TranslateService,
    private alertCtrl: AlertController, private platform: Platform, 
    public appCommonMethods: appCommonMethods) {

  }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    this.apiService.getCountries().subscribe(res => this.countries = res);
    this.changeHint();
  }

  changeHint() {
    this.phoneNumber = "";
    if (this.countryCode && this.countryCode.length) {
      this.translate.get('enter_phone_number_exluding').subscribe(value => this.phoneNumberHint = (value + " (+" + this.countryCode + ")"));
    } else {
      this.translate.get('enter_phone_number').subscribe(value => this.phoneNumberHint = value);
    }
  }

  alertPhone() {
    if (!this.countryCode || !this.countryCode.length) {
      this.translate.get("select_country").subscribe(value => this.uiElementService.presentToast(value));
      return;
    }
    if (!this.phoneNumber || !this.phoneNumber.length || this.phoneNumber.length > 10) {
      this.uiElementService.presentToast('Enter valid phone number (10 digits) excluding +91');
      return;
    }
    this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
      this.phoneNumberFull = "+" + this.countryCode + Helper.formatPhone(this.phoneNumber);
      this.checkIfExists();
      // this.alertCtrl.create({
      //   header: this.phoneNumberFull,
      //   message: text['alert_phone'],
      //   buttons: [{
      //     text: text['no'],
      //     role: 'cancel',
      //     handler: () => {
      //       console.log('Cancel clicked');
      //     }
      //   }, {
      //     text: text['yes'],
      //     handler: () => {
      //       this.checkIfExists();
      //     }
      //   }]
      // }).then(alert => alert.present());
    });
  }

  checkIfExists() {
    this.translate.get('just_moment').subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.apiService.checkUser({ mobile_number: this.phoneNumberFull, role: Constants.ROLE_USER }).subscribe(res => {
        console.log(res);
        this.uiElementService.dismissLoading();

        // let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: this.phoneNumberFull } };
        // this.navCtrl.navigateForward(['./verification'], navigationExtras);
        this.loginUser(this.phoneNumberFull);
      }, err => {
        console.log(err);
        this.uiElementService.dismissLoading();

        let navigationExtras: NavigationExtras = { queryParams: { code: this.countryCode, phone: this.phoneNumber } };
        this.navCtrl.navigateForward(['./register'], navigationExtras);
      });
    });
  }

  getAddress() {
    this.apiService.getAddresses().subscribe(res => {
      this.uiElementService.dismissLoading();
      if (res.length > 0) {
        let addresses = res;
        let addressSelected = addresses[0];
        Helper.setAddressSelected(addressSelected);
        this.myEvent.setAddressData(addressSelected);
        this.refreshServiceSettings(false);
      } else {
        this.refreshServiceSettings(true);
      //  this.navAddressNew();
      }
    }, err => {
      this.uiElementService.dismissLoading();
     // this.navAddressNew();
    });
  }

  refreshServiceSettings(addressCreate: boolean) {
    if (Helper.getLoggedInUser() != null) {       

        console.log("pincode"+this.pincode);
      

      let expressSetup = false;
      let regularSetup = false;
      this.apiService.getPincodeServiceSettings(this.pincode).subscribe
        (res => {
          if (res.length > 0) {
            Helper.setDeliveryAvailability("true");
            this.deliverySlots = res;

            this.deliverySlots.forEach(deliverySlot => {
              if (deliverySlot.isExpress == true) {
                Helper.setExpressPincode(deliverySlot);
                expressSetup = true;
              }
              else {
                Helper.setRegularPincode(deliverySlot);
                regularSetup = true;
              }
            });
          } else {
            Helper.setDeliveryAvailability("false");
          }
          if (Helper.getDeliveryAvailability() == "true") {
            if(addressCreate)
          this.createAddress();
            else
            {
            //   if(Helper.getExpressPincode()!=null ||Helper.getExpressPincode()!=undefined)
            //     this.navCtrl.navigateRoot(['./tabs/express']);
            // else
            //     this.navCtrl.navigateRoot(['./tabs/regular']);
            // todo: navigate to mango page for summers
            this.navCtrl.navigateRoot(['./tabs/home']);
            }
          } else {
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
      if (!expressSetup) Helper.setExpressPincode(null);
      if (!regularSetup) Helper.setRegularPincode(null);
    }
  }

  createAddress() {
    //Todo: remove this when we move totally to pincode
    this.location=new MyAddress();
          this.location.pincode=this.pincode;
          this.location.title="Home";
          this.location.formatted_address=this.location.title + ": " + this.location.pincode;
    this.location.latitude = "17.4842285";
    this.location.longitude = "78.3541741";
   this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
     this.uiElementService.presentLoading(values["address_creating"]);
     this.subscriptions.push(this.apiService.addressAdd(this.location).subscribe(res => {
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
  this.refreshServiceSettings(false);
}


  loginUser(mobile_number) {
    this.translate.get('just_moment').subscribe(value => {
      this.uiElementService.presentLoading(value);

      this.apiService.loginUser2({token: mobile_number, role: Constants.ROLE_USER}).subscribe(res => {
        this.uiElementService.dismissLoading();
        Helper.setLoggedInUserResponse(res);
        this.apiService.setupHeaders(res.token);
        this.myEvent.setUserMeData(res.user);
        window.localStorage.removeItem(Constants.KEY_ADDRESS);
        window.localStorage.removeItem(Constants.KEY_DELIVERY_AVAILABILITY);
        this.myEvent.setAddressData(null);
        this.getAddress();
        // let navigationExtras: NavigationExtras = { state: { pick_location: true } };
        // this.navCtrl.navigateForward(['./addresses'], navigationExtras);

      }, err => {
        console.log(err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert((err && err.error && err.error.message && String(err.error.message).toLowerCase().includes("role")) ? "User exists with different role" : "Something went wrong");
      });
    });
  }


  private verifyUser(slr: SocialLoginRequest, nameEmail: { name: string, email: string }) {
    this.translate.get('verifying_user').subscribe(value => {
      this.uiElementService.presentToast(value);
      this.apiService.loginSocial(slr).subscribe(res => {
        console.log("asfd");
        this.uiElementService.dismissLoading();
        this.loginSocialSuccess(res);
      }, err => {
        this.uiElementService.dismissLoading();
        console.log(err);
        if (err && err.status && err.status == 404) {
          let navigationExtras: NavigationExtras = { queryParams: nameEmail ? nameEmail : { name: err.error.name, email: err.error.email } };
          this.navCtrl.navigateForward(['./register'], navigationExtras);
        } else {
          this.uiElementService.presentToast(err.error.message);
        }
      });
    });
  }

  private loginSocialSuccess(res: AuthResponse) {
    res.user.mobile_verified=1;
    if (res.user.mobile_verified == 1) {
      Helper.setLoggedInUserResponse(res);
      this.apiService.setupHeaders(res.token);
      this.myEvent.setUserMeData(res.user);
      window.localStorage.removeItem(Constants.KEY_ADDRESS);
      window.localStorage.removeItem(Constants.KEY_DELIVERY_AVAILABILITY);
      this.myEvent.setAddressData(null);
    } else {
      let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: res.user.mobile_number } };
      this.navCtrl.navigateForward(['./verification'], navigationExtras);
    }
  }
  openTerms() {
    this.navCtrl.navigateForward(['./tnc']);
  }

}
