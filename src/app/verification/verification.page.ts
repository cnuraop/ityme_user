import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular'
import { ActivatedRoute, NavigationExtras,Router  } from '@angular/router';
import { UiElementsService } from '../services/common/ui-elements.service';
import { MyEventsService } from '../services/events/my-events.service';
import { ApiService } from '../services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/models/helper.models';
import * as firebase from 'firebase/app';
import { Constants } from 'src/models/constants.models';
import { appCommonMethods } from '../services/common/appCommonMethods';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { Subscription } from 'rxjs/internal/Subscription';
import { MyAddress } from 'src/models/address.models';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.page.html',
  styleUrls: ['./verification.page.scss']
})
export class VerificationPage implements OnInit {
  private recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  private captchanotvarified: boolean = true;
  private result: any;
  private buttonDisabled: any = true;
  private component: any;
  private captchaVerified: boolean = false;
  private verfificationId: any;
  private timer: any;
  private minutes_old: number = 0;
  private seconds_old: number = 0;
  private totalSeconds: number = 0;
  private intervalCalled: boolean = false;
  private dialCode: string;
  private resendCode: boolean = false;
  private otpNotSent: boolean = true;
  private credential: any;
  otpError: any = "";
  otp1: any = '';
  otp2: any = '';
  otp3: any = '';
  otp4: any = '';
  otp5: any = '';
  otp6: any = '';

  minutes: number = 1;
  seconds: number = 60;
  interval;
  countFlag: boolean;
  stringMinutes: any = "";
  stringSeconds: any = 60;
  interval2: any;
  isOtpSent = false;

  phoneNumberFull: string;
  pincode: string;
  otp = "";
  deliverySlots: DeliverySlot[];
  location: MyAddress;
  private subscriptions = new Array<Subscription>();

  constructor(private route: ActivatedRoute, private router: Router,  private navCtrl: NavController, private uiElementService: UiElementsService, private myEvent: MyEventsService,
    private platform: Platform, private apiService: ApiService, private translate: TranslateService,
    public appCommonMethods: appCommonMethods,private myEventService: MyEventsService) { }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    this.route.queryParams.subscribe(params => this.phoneNumberFull = params["phoneNumberFull"]);

    if (this.router.getCurrentNavigation().extras.state !=undefined) {
      this.pincode = this.router.getCurrentNavigation().extras.state.pincode;
    }

    if (!(this.platform.is('cordova'))) {
      this.makeCaptcha();
    }
    this.sendOTP();
  }

  loginUser(token) {
    this.translate.get('just_moment').subscribe(value => {
      this.uiElementService.presentLoading(value);

      this.apiService.loginUser({ token: token, role: Constants.ROLE_USER }).subscribe(res => {
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
        this.myEventService.setAddressData(addressSelected);
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

  navAddressNew() {
    let navigationExtras: NavigationExtras = { state: { pick_location: false } };
    this.navCtrl.navigateForward(['./add-address'], navigationExtras);
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

  getUserToken(user) {
    user.getIdToken(false).then(res => {
      console.log('user_token_success', res);
      this.loginUser(res);
    }).catch(err => {
      console.log('user_token_failure', err);
    });
  }

  sendOTP() {
    this.resendCode = false;
    this.otpNotSent = true;
    this.isOtpSent = false;
    if (this.phoneNumberFull == undefined) {
      if (this.router.getCurrentNavigation().extras.state) {
        this.phoneNumberFull = this.router.getCurrentNavigation().extras.state.phoneState;
      }
    }
    if (this.platform.is('cordova')) {
      this.sendOtpPhone(this.phoneNumberFull);
    } else {
      this.sendOtpBrowser(this.phoneNumberFull);
    }
    if (this.intervalCalled) {
      clearInterval(this.timer);
    }
  }

  createTimer() {
    this.intervalCalled = true;
    this.totalSeconds--;
    if (this.totalSeconds == 0) {
      this.otpNotSent = true;
      this.resendCode = true;
      clearInterval(this.timer);
    } else {
      this.seconds_old = (this.totalSeconds % 60);
      if (this.totalSeconds >= this.seconds_old) {
        this.minutes_old = (this.totalSeconds - this.seconds_old) / 60
      } else {
        this.minutes_old = 0;
      }
    }
  }

  createInterval() {
    this.totalSeconds = 120;
    this.createTimer();
    this.timer = setInterval(() => {
      this.createTimer();
    }, 1000);
  }

  sendOtpPhone(phone) {
    const component = this;
    this.translate.get('sending_otp').subscribe(value => {
      this.uiElementService.presentLoading(value);

      (<any>window).FirebasePlugin.verifyPhoneNumber(function (credential) {
        component.uiElementService.dismissLoading();
        console.log("verifyPhoneNumber", JSON.stringify(credential));
        //component.verfificationId = credential.instantVerification ? credential.id : credential.verificationId;
        component.credential = credential;
        if (credential.instantVerification) {
          component.translate.get("verifying_otp_auto").subscribe(value => component.uiElementService.presentToast(value));
          component.verifyOtpPhone();
        } else {
          component.translate.get("sending_otp_success").subscribe(value => component.uiElementService.presentToast(value));
          component.otpNotSent = false;
          component.isOtpSent = true;
          component.createInterval();
          clearInterval(component.interval2);
          setTimeout(() => {
            component.newTimer();
          }, 200);

        }
        // component.translate.get("otp_sent").subscribe(value => {
        //   component.global.showToast(value);
        // });
        // component.otpNotSent = false;
        // component.createInterval(); 
      }, function (error) {
        console.log("otp_send_fail", error);
        component.otpNotSent = true;
        component.resendCode = true;
        component.uiElementService.dismissLoading();
        component.translate.get('sending_otp_fail').subscribe(text => component.uiElementService.presentToast(text));
      }, phone, 60);
    });
  }

  sendOtpBrowser(phone) {
    const component = this;
    this.uiElementService.dismissLoading();
    this.uiElementService.presentLoading("Sending otp");
    firebase.auth().signInWithPhoneNumber(phone, this.recaptchaVerifier).then((confirmationResult) => {
      console.log("otp_send_success", confirmationResult);
      component.otpNotSent = false;
      component.result = confirmationResult;
      component.uiElementService.dismissLoading();
      component.uiElementService.presentToast("OTP Sent");
      if (component.intervalCalled) {
        clearInterval(component.timer);

      }
      component.createInterval();
      component.isOtpSent = true;
      clearInterval(component.interval2);
      setTimeout(() => {
        component.newTimer();
      }, 200);
    }).catch(function (error) {
      console.log("otp_send_fail", error);
      component.resendCode = true;
      component.uiElementService.dismissLoading();
      if (error.message) {
        component.uiElementService.presentToast(error.message);
      } else {
        component.uiElementService.presentToast("OTP Sending failed");
      }
    });
  }

  moveFocus(event, next, prev) {
    this.otpError = "";
    console.log(prev)
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    }
    else if (next && event.target.value.length > 0) {
      next.setFocus();
    }
    else if (!next) { // if its the last number, auto submit it
      // this.appcom.showLoader();
      setTimeout(() => {
        this.otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;

        if (this.otp.toString().length == 6 && this.otp1 != '0' && parseInt(this.otp) && parseInt(this.otp).toString().length == 6) {
          this.verify();
        } else {
          this.otpError = "verify_otp_invalid";
          this.translate.get('verify_otp_invalid').subscribe(text => this.uiElementService.presentToast(text));

        }
      }, 500);
    }
    else {
      return 0;
    }
  }

  verify() {
    this.otpError = '';
    this.otp = this.otp1 + this.otp2 + this.otp3 + this.otp4 + this.otp5 + this.otp6;
    if (this.otp.toString().length == 6 && this.otp1 != '0' && parseInt(this.otp) && parseInt(this.otp).toString().length == 6) {

      this.otpNotSent = true;
      if (this.platform.is('cordova')) {
        this.credential.code = String(this.otp);
        this.verifyOtpPhone();
      } else {
        this.verifyOtpBrowser();
      }
    } else {
      this.otpError = "verify_otp_invalid";
      this.translate.get('verify_otp_invalid').subscribe(text => this.uiElementService.presentToast(text));
    }
  }

  // retryOld(credential) {
  //   //const credential = firebase.auth.PhoneAuthProvider.credential(this.verfificationId, this.otp);
  //   this.translate.get('verifying_otp').subscribe(value => {
  //     this.uiElementService.presentLoading(value);

  //     firebase.auth().signInAndRetrieveDataWithCredential(credential).then((info) => {
  //       console.log('otp_verify_success', info);
  //       this.uiElementService.dismissLoading();
  //       this.translate.get('verifying_otp_success').subscribe(value => this.uiElementService.presentToast(value));
  //       this.getUserToken(info.user);
  //     }, (error) => {
  //       console.log('otp_verify_fail', error);
  //       this.translate.get('verifying_otp_fail').subscribe(value => this.uiElementService.presentToast(value));
  //       this.uiElementService.dismissLoading();
  //     })
  //   });
  // }

  verifyOtpPhone() {
    const component = this;
    this.translate.get('verifying_otp').subscribe(text => {
      this.uiElementService.presentLoading(text);
      console.log("credential", component.credential);
      (<any>window).FirebasePlugin.signInWithCredential(component.credential, function () {
        (<any>window).FirebasePlugin.getCurrentUser(function (user) {
          component.uiElementService.dismissLoading();
          console.log("getCurrentUser", JSON.stringify(user));
          component.translate.get('otp_verified').subscribe(text => component.uiElementService.presentToast(text));
          component.loginUser(user.idToken);
        }, function (error) {
          component.uiElementService.dismissLoading();
          console.log("getCurrentUser", JSON.stringify(error));
          component.translate.get('verify_otp_err').subscribe(text => component.uiElementService.presentToast(text));
        });
      }, function (error) {
        console.error("signInWithCredential", JSON.stringify(error));
        component.uiElementService.dismissLoading();
        //component.retryOld(firebase.auth.PhoneAuthProvider.credential(component.credential.id, component.otp));
        component.translate.get((error == "Invalid verification code" ? "verify_otp_invalid" : "verify_otp_err")).subscribe(text => component.uiElementService.presentToast(text));
      });
    });
  }

  verifyOtpBrowser() {
    const component = this;
    this.uiElementService.presentLoading("Verifying otp");
    this.result.confirm(this.otp).then(function (response) {
      console.log('otp_verify_success', response);
      component.uiElementService.dismissLoading();
      component.uiElementService.presentToast("OTP Verified");
      component.getUserToken(response.user);
    }).catch(function (error) {
      console.log('otp_verify_fail', error);
      if (error.message) {
        component.uiElementService.presentToast(error.message);
      } else {
        component.uiElementService.presentToast("OTP Verification failed");
      }
      component.uiElementService.dismissLoading();
    });
  }

  makeCaptcha() {
    const component = this;
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      // 'size': 'normal',
      'size': 'invisible',
      'callback': function (response) {
        component.captchanotvarified = true;
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    this.recaptchaVerifier.render();
  }

  resendOtp(isResend?) {
    if (this.countFlag) {
      this.sendOTP();
    }
  }
  newTimer() {
    this.countFlag = false
    this.minutes = 1;
    this.seconds = 0;
    this.stringSeconds = "00";

    this.interval2 = setInterval(() => {
      if (this.minutes > 0 && this.seconds == 0) {
        if (this.seconds == 0) {
          this.minutes = this.minutes - 1;
          this.seconds = 59;
          this.stringSeconds = this.seconds;
        } else {
          this.seconds = this.seconds - 1;
          if (this.seconds <= 9) {
            this.stringSeconds = "0" + this.seconds;
          } else {
            this.stringSeconds = this.seconds;
          }
        }
      } else {
        if (this.seconds > 0) {
          this.seconds = this.seconds - 1;
          if (this.seconds <= 9) {
            this.stringSeconds = "0" + this.seconds;
          } else {
            this.stringSeconds = this.seconds;
          }
        } else if (this.minutes == 0 && this.seconds == 0) {
          clearInterval(this.interval2);
          this.countFlag = true;
        }
      }

    }, 1000)
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

}