import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SignUpRequest } from 'src/models/auth-signup-request.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/models/helper.models';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { MyAddress } from 'src/models/address.models';
import { Subscription } from 'rxjs/internal/Subscription';
import { MyEventsService } from '../services/events/my-events.service';
import { Constants } from 'src/models/constants.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  countries: any;
  phoneNumber: string;
  pincode: string;
  countryCode = "91";
  countryCodeCountryText: string;
  phoneNumberFull: string;
  phoneNumberHint: string;
  signUpRequest = new SignUpRequest();
  deliverySlots: DeliverySlot[];
  location: MyAddress;
  private subscriptions = new Array<Subscription>();

  constructor(private navCtrl: NavController, private uiElementService: UiElementsService,
    private apiService: ApiService, private route: ActivatedRoute,
    private translate: TranslateService, private alertCtrl: AlertController
    ,private myEvent: MyEventsService) { }

  ngOnInit() {
    //this.changeHint();
    
    this.route.queryParams.subscribe(params => {
      let code = params["code"];
      let phone = params["phone"];
      let name = params["name"];
      let email = params["email"];
      let pincode=params["pincode"];
      console.log(pincode);
      if (code && code.length) this.countryCode = code;
      if (phone && phone.length) 
        this.phoneNumber = phone;
      if (pincode && pincode.length) 
      this.signUpRequest.name = name;
      if (email && email.length) this.signUpRequest.email = email;
if(pincode&& pincode.length) this.signUpRequest.pincode=pincode;
      //this.apiService.getCountries().subscribe(res => { this.countries = res; this.countryCode = this.countryCode; this.changeHint(true); });
    });
   // this.apiService.getCountries().subscribe(res => { this.countries = res; this.changeHint(true); });
  }

  changeHint(clearPhoneSkip?: boolean) {
    this.phoneNumber = clearPhoneSkip ? this.phoneNumber : "";
    if (this.countryCode && this.countryCode.length) {
      for (let country of this.countries) if (country.callingCodes[0] && country.callingCodes[0] == this.countryCode) this.countryCodeCountryText = country.name;
      this.translate.get('enter_phone_number_exluding').subscribe(value => this.phoneNumberHint = (value + " (+" + this.countryCode + ")"));
    } else {
      this.translate.get('enter_phone_number').subscribe(value => this.phoneNumberHint = value);
    }
  }

  requestSignUp() {
    console.log("pincode"+this.signUpRequest.pincode);
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.signUpRequest.name.length < 6) {
      this.translate.get("err_valid_name").subscribe(value => this.uiElementService.presentToast(value));
     }
    // else if (this.signUpRequest.email.length <= 5 || !reg.test(this.signUpRequest.email)) {
    //   this.translate.get("err_valid_email").subscribe(value => this.uiElementService.presentToast(value));
    // } else if (!this.countryCode || !this.countryCode.length || !this.phoneNumber || !this.phoneNumber.length) {
    //   this.translate.get("err_valid_phone").subscribe(value => this.uiElementService.presentToast(value));
    // } else {
    //   this.alertPhone();
    // }
    else if(this.signUpRequest.pincode.length!=6)
    this.translate.get("err_valid_pincode").subscribe(value => this.uiElementService.presentToast(value));
    else {
         this.alertPhone();
       }
  }

  alertPhone() {
    this.translate.get(['alert_phone', 'no', 'yes']).subscribe(text => {
      this.phoneNumberFull = "+" + this.countryCode + Helper.formatPhone(this.phoneNumber);
    //   this.alertCtrl.create({
    //     header: this.phoneNumberFull,
    //     //message: text['alert_phone'],
    //     buttons: [{
    //       text: text['no'],
    //       role: 'cancel',
    //       handler: () => {
    //         console.log('Cancel clicked');
    //       }
    //     }, {
    //       text: text['yes'],
    //       handler: () => {
    //         this.signUpRequest.password = String(Math.floor(100000 + Math.random() * 900000));
    //         this.signUpRequest.mobile_number = this.phoneNumberFull;
    //         this.signUp();
    //       }
    //     }]
    //   }).then(alert => alert.present());
    this.signUpRequest.password = String(Math.floor(100000 + Math.random() * 900000));
   // this.signUpRequest.name="Jeevamrut Customer";
    this.signUpRequest.email="newuser@jeevamrut.in"
    this.signUpRequest.mobile_number = this.phoneNumberFull;
    this.signUp();

     });
  }

  refreshServiceSettings(addressCreate: boolean) {
    if (Helper.getLoggedInUser() != null) {       

        console.log("pincode"+this.signUpRequest.pincode);
      

      let expressSetup = false;
      let regularSetup = false;
      this.apiService.getPincodeServiceSettings(this.signUpRequest.pincode).subscribe
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
    console.log("Address"+this.signUpRequest.pincode);
          this.location.pincode=this.signUpRequest.pincode;
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

  // selectAddress(address: MyAddress) {
  //   Helper.setAddressSelected(address);
  //   this.refreshServiceSettings(false);
  // }
  

  signUp() {
    this.translate.get('signing_up').subscribe(value => {
      this.uiElementService.presentLoading(value);

      this.apiService.createUser(this.signUpRequest).subscribe(res => {
        console.log(res);
        this.uiElementService.dismissLoading();

       // let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: res.user.mobile_number, pincode: this.signUpRequest.pincode } };
      //  let navigationExtras: NavigationExtras = { queryParams: { phoneNumberFull: res.user.mobile_number },state: { phoneState: res.user.mobile_number, pincode: this.signUpRequest.pincode } }; 
      //  this.navCtrl.navigateForward(['./verification'], navigationExtras);

      this.loginUser(this.phoneNumberFull);

      }, err => {
        console.log(err);
        this.uiElementService.dismissLoading();
        let errMsg;
        this.translate.get(['invalid_credentials', 'invalid_credential_email', 'invalid_credential_phone', 'invalid_credential_password']).subscribe(value => {
          errMsg = value['invalid_credentials'];
          if (err && err.error && err.error.errors) {
            if (err.error.errors.email) {
              errMsg = value['invalid_credential_email'];
            } else if (err.error.errors.mobile_number) {
              errMsg = value['invalid_credential_phone'];
            } else if (err.error.errors.password) {
              errMsg = value['invalid_credential_password'];
            }
          }
          this.uiElementService.presentErrorAlert(errMsg);
        });
      });
    });
  }
  

  goBack() {
    this.navCtrl.pop();
  }

  // pickImage() {
  //   this.translate.get(["image_pic_header", "image_pic_subheader", "image_pic_camera", "image_pic_gallery"]).subscribe(values => {
  //     this.alertCtrl.create({
  //       header: values["image_pic_header"],
  //       message: values["image_pic_subheader"],
  //       buttons: [{
  //         text: values["image_pic_camera"],
  //         handler: () => {
  //           this.getImageCamera();
  //         }
  //       }, {
  //         text: values["image_pic_gallery"],
  //         handler: () => {
  //           this.getImageGallery();
  //         }
  //       }]
  //     }).then(alert => alert.present());
  //   });
  // }

  // getImageGallery() {
  //   this.platform.ready().then(() => {
  //     if (this.platform.is("cordova")) {
  //       this.imagePicker.getPictures({
  //         maximumImagesCount: 1,
  //       }).then((results) => {
  //         if (results && results[0]) {
  //           this.reduceImages(results).then(() => {
  //             console.log('cropped_images');
  //           });
  //         }
  //       }, (err) => {
  //         console.log("getPictures", JSON.stringify(err));
  //       });
  //     }
  //   });
  // }

  // reduceImages(selected_pictures: any): any {
  //   return selected_pictures.reduce((promise: any, item: any) => {
  //     return promise.then((result) => {
  //       return this.cropService.crop(item, { quality: 100 }).then(cropped_image => this.uploadImage(cropped_image));
  //     });
  //   }, Promise.resolve());
  // }

  // getImageCamera() {
  //   const options: CameraOptions = {
  //     quality: 75,
  //     destinationType: this.platform.is("android") ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE
  //   }
  //   this.camera.getPicture(options).then((imageData) => this.uploadImage(imageData), (err) => {
  //     this.translate.get('camera_err').subscribe(value => this.uiElementService.presentToast(value));
  //     console.log("getPicture", JSON.stringify(err));
  //   });
  // }

  // uploadImage(imageUri) {
  //   this.translate.get(["uploading_image", "uploading_fail"]).subscribe(values => {
  //     this.uiElementService.presentLoading(values["uploading_image"]);
  //     this.fireUpService.resolveUriAndUpload(imageUri).then(res => {
  //       console.log("resolveUriAndUpload", res);
  //       this.uiElementService.dismissLoading();
  //       this.signUpRequest.image_url = String(res);
  //     }, err => {
  //       console.log("resolveUriAndUpload", err);
  //       this.uiElementService.dismissLoading();
  //       this.uiElementService.presentErrorAlert(values["uploading_fail"]);
  //     });
  //   });
  // }

}
