import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Platform, NavController, IonRouterOutlet, ModalController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from 'src/models/constants.models';
import { APP_CONFIG, AppConfig } from './app.config';
import { MyEventsService } from './services/events/my-events.service';
import { Helper } from 'src/models/helper.models';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { ApiService } from './services/network/api.service';
import { ECommerceService } from './services/common/ecommerce.service';
import { User } from 'src/models/user.models';
import { Device } from '@ionic-native/device/ngx';
import * as firebase from 'firebase';
import { VtPopupPage } from './vt-popup/vt-popup.page';
import { UiElementsService } from './services/common/ui-elements.service';
import { MyAddress } from 'src/models/address.models';
import { MyPincode } from 'src/models/pincode.models';
import { Subscription } from 'rxjs';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DeliverySlot, DeliverySlotListResponse } from 'src/models/delivery-slot.models';
import { EventsService } from './services/eventsService';
import { Router, NavigationEnd, NavigationExtras } from '@angular/router';
declare let fbq: Function;
declare let gtag: Function;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']

})
export class AppComponent {
  @ViewChild(IonRouterOutlet, { static: false }) routerOutlets: IonRouterOutlet;
  rtlSide = "left";
  userMe: User;
  public selectedIndex = 0;
  public appPages = [];
  rtlSideMenu = "start";
  showSideMenu: boolean = true;
  subscriptions: Array<Subscription> = [];
  deliverySlotDetails: DeliverySlotListResponse;
  deliverySlots = new Array<DeliverySlot>();

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private uiElementService: UiElementsService,
    private platform: Platform, public apiService: ApiService,
    private splashScreen: SplashScreen, private modalController: ModalController,
    private statusBar: StatusBar, private oneSignal: OneSignal, private eComService: ECommerceService,
    private translate: TranslateService, private device: Device,
    private navCtrl: NavController, private inAppBrowser: InAppBrowser,
    private myEvent: MyEventsService, private alertCtrl: AlertController,
    public eventService: EventsService,
    private router: Router) {
    // Helper.setAddressSelected(MyAddress.testAddress());
    this.initializeApp();
    // Helper.setAddressSelected(MyAddress.testAddress());
    router.events.subscribe((y: NavigationEnd) => {
      if (y instanceof NavigationEnd) {
        gtag('config', 'UA-{ID}', { 'page_path': y.url });
        fbq('track', 'PageView');
      }
    })
  }
  

  // ngOnInit() {
  //   //setTimeout(() => this.presentModal(), 15000);
  //   if (this.config.demoMode && this.platform.is('cordova')) setTimeout(() => this.presentModal(), 15000);
  //   this.initializeApp();
  //   this.myEvent.getLanguageObservable().subscribe(value => {
  //     this.apiService.setupHeaders();
  //     this.navCtrl.navigateRoot(['./']);
  //     this.globalize(value);
  //   });
  //   this.myEvent.getUserMeObservable().subscribe(user => {
  //     this.refreshSettings();
  //     this.apiService.setUserMe(user);
  //     this.userMe = this.apiService.getUserMe();

  //     if (this.userMe == null) this.apiService.setupHeaders(null);
  //     this.navCtrl.navigateRoot(['./']);
  //   });
  // }

  async presentModal() {
    const modal = await this.modalController.create({
      component: VtPopupPage,
    });
    return await modal.present();
  }

  initializeApp() {
    console.log("this"+this.router.url);
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();

      firebase.initializeApp({
        apiKey: this.config.firebaseConfig.apiKey,
        authDomain: this.config.firebaseConfig.authDomain,
        databaseURL: this.config.firebaseConfig.databaseURL,
        projectId: this.config.firebaseConfig.projectId,
        storageBucket: this.config.firebaseConfig.storageBucket,
        messagingSenderId: this.config.firebaseConfig.messagingSenderId
      });

      if (this.platform.is('cordova')) this.initOneSignal();
      this.globalize(Helper.getLanguageDefault());

      this.apiService.setUuidAndPlatform(this.device.uuid, this.device.platform);
      this.refreshSettings();

      if (Helper.getLoggedInUser() != null) {
        this.apiService.setUserMe(Helper.getLoggedInUser());
        this.userMe = this.apiService.getUserMe();
        if (!this.refreshLocationSettings() && !this.refreshCouponCode()) {
          // if(Helper.getDeliveryAvailability() == undefined || Helper.getDeliveryAvailability() == null)
          // {
          //   this.navCtrl.navigateRoot(['./sign-in']);
          // }
          // else 
          if (Helper.getDeliveryAvailability() == "true") {
            this.refreshServiceSettings();
            // if (Helper.getExpressPincode() != null || Helper.getExpressPincode() != undefined) {
            //  // this.navCtrl.navigateRoot(['./tabs/express']);
            //  this.navCtrl.navigateRoot(['./seasonal-items']);
            // }
            // else if (Helper.getRegularPincode() != null || Helper.getRegularPincode() != undefined) {
            //   this.navCtrl.navigateRoot(['./seasonal-items']);
            // }
            // else
               this.navCtrl.navigateRoot(['./custom-route']);
          } else {
            //let navigationExtras: NavigationExtras = { state: { pick_location: true } };
            //this.navCtrl.navigateForward(['./tabs/home'], navigationExtras);            
            this.navCtrl.navigateRoot(['./check-delivery']);
          }
        }
        else { this.navCtrl.navigateRoot(['./sign-in']); }

      } else {
        this.navCtrl.navigateRoot(['./sign-in']);
      }
      this.splashScreen.hide();

      setTimeout(() => {
        // this.splashScreen.hide();
        if (this.platform.is('cordova') && this.userMe)
          this.globalize(Helper.getLanguageDefault());
      }, 3000);

      this.eventService.getObservable().subscribe((data) => {
        if (data && data.data == "updateUser") {
          this.userMe = this.apiService.getUserMe();
          // this.updateUserData();
        }
      })

      this.platform.backButton.subscribe(() => {
        let currPathName = window.location.pathname;
        if (currPathName && (currPathName.includes("tabs") || currPathName.includes("delivery-unavailable") || currPathName.includes("sign-in"))) {
          navigator['app'].exitApp();
        } else {
          if (this.routerOutlets && this.routerOutlets.canGoBack()) {
            this.routerOutlets.pop();
          } else {
            if (currPathName && (currPathName.includes("tabs") || currPathName.includes("sign-in"))) {
              navigator['app'].exitApp();
            } else {
              this.navCtrl.navigateRoot(['./tabs']);
            }
          }
        }
      });
    });
  }
  refreshLocationSettings() {
    let redirect: boolean;
    redirect = false;
    if (Helper.getLoggedInUser() != null) {

      let addr = Helper.getAddressSelected();

      try {
        let sl = addr.pincode;

        if (sl == null || sl == "" || sl == undefined) {
          // Refresh the token from database
          Helper.setLoggedInUserResponse(null);
          redirect = true;
          //this.navCtrl.navigateRoot(['./sign-in']);
        }
      }
      catch (e) {
        Helper.setLoggedInUserResponse(null);
        redirect = true;
        //this.navCtrl.navigateRoot(['./sign-in']);
      }
      return redirect;
    }
  }

  refreshCouponCode() {
    let redirect: boolean;
    redirect = false;
    if (Helper.getLoggedInUser() != null) {

      let user = Helper.getLoggedInUser();
      try {
        let sl = user.referral_code;
        if (sl == null || sl == "" || sl == undefined) {
          // Refresh the token from database
          Helper.setLoggedInUserResponse(null);
          redirect = true;
        }
      }
      catch (e) {
        Helper.setLoggedInUserResponse(null);
        redirect = true;
        //this.navCtrl.navigateRoot(['./sign-in']);
      }
      return redirect;
    }
  }

  updateUserData() {
    this.eventService.publishSomeData({
      data: 'updateUser'
    })
  }

  globalize(languagePriority) {
    this.translate.setDefaultLang("en");
    let defaultLangCode = this.config.availableLanguages[0].code;
    this.translate.use(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    this.setDirectionAccordingly(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    Helper.setLocale(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
    Helper.setLanguageDefault(languagePriority && languagePriority.length ? languagePriority : defaultLangCode);
  }

  setDirectionAccordingly(lang: string) {
    switch (lang) {
      case 'ar': {
        this.rtlSide = "rtl";
        break;
      }
      default: {
        this.rtlSide = "ltr";
        break;
      }
    }
  }

  initOneSignal() {
    if (this.config.oneSignalAppId && this.config.oneSignalAppId.length && this.config.oneSignalGPSenderId && this.config.oneSignalGPSenderId.length) {
      this.oneSignal.startInit(this.config.oneSignalAppId, this.config.oneSignalGPSenderId);
      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
      this.oneSignal.handleNotificationReceived().subscribe((data) => {
        console.log(data);
        Helper.saveNotification((data.payload.additionalData && data.payload.additionalData.title) ? data.payload.additionalData.title : data.payload.title,
          (data.payload.additionalData && data.payload.additionalData.body) ? data.payload.additionalData.body : data.payload.body,
          String(new Date().getTime()));
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        noti_ids_processed.push(data.payload.notificationID);
        window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
      });
      this.oneSignal.handleNotificationOpened().subscribe((data) => {
        let noti_ids_processed: Array<string> = JSON.parse(window.localStorage.getItem("noti_ids_processed"));
        if (!noti_ids_processed) noti_ids_processed = new Array<string>();
        let index = noti_ids_processed.indexOf(data.notification.payload.notificationID);
        if (index == -1) {
          Helper.saveNotification((data.notification.payload.additionalData && data.notification.payload.additionalData.title) ? data.notification.payload.additionalData.title : data.notification.payload.title,
            (data.notification.payload.additionalData && data.notification.payload.additionalData.body) ? data.notification.payload.additionalData.body : data.notification.payload.body,
            String(new Date().getTime()));
        } else {
          noti_ids_processed.splice(index, 1);
          window.localStorage.setItem("noti_ids_processed", JSON.stringify(noti_ids_processed));
        }
      });
      this.oneSignal.endInit();
    }
  }

  // updatePlayerId() {
  //   //initialize Agora SDK with Agora App ID
  //   if (this.platform.is("cordova") && this.config.agoraVideoConfig.enableAgoraVideo) {
  //     Agora.initAgora(this.config.agoraVideoConfig.agoraAppId, (res) => {
  //       console.log("Agora-initAgora", res);

  //       //login to Agora sdk.
  //       Agora.loginUser(null, this.userMe.id, (res) => {
  //         console.log("Agora-loginUser", res);
  //       }, (err) => {
  //         console.log("Agora-loginUser", err);
  //       });

  //     }, (err) => {
  //       console.log("Agora-initAgora", err);
  //       this.uiElementService.presentToast("Unable to instantiate Agora")
  //     });
  //   }

  //   this.oneSignal.getIds().then((id) => {
  //     if (id && id.userId) {
  //       let defaultLang = Helper.getLanguageDefault();

  //       this.apiService.updateUser({
  //         notification: "{\"" + Constants.ROLE_USER + "\":\"" + id.userId + "\"}",
  //         language: (defaultLang && defaultLang.length) ? defaultLang : this.config.availableLanguages[0].code
  //       }).subscribe(res => console.log('updateUser', res), err => console.log('updateUser', err));

  //       firebase.database().ref(Constants.REF_USERS_FCM_IDS).child((this.userMe.id + Constants.ROLE_USER)).set(id.userId);
  //     }
  //   });
  // }

  refreshSettings() {
    //   this.apiService.getSettings().subscribe(res => { console.log('getSettings', res); Helper.setSettings(res); this.apiService.reloadSetting(); this.eComService.initialize(); }, err => console.log('getSettings', err));
    // }
    if (Helper.getLoggedInUser() != null) {

      this.apiService.refreshSettings().subscribe
        (res => {
          Helper.setSettings(res);
          this.apiService.reloadSetting();
          this.eComService.initialize();

        }, err => {
          console.log('getSettings', err)
          if (err.status == "401") {
            this.navCtrl.navigateRoot(['./sign-in']);
          }
        }
        );

    }
    else {
      this.apiService.getSettings().subscribe(res => { console.log('getSettings', res); Helper.setSettings(res); this.apiService.reloadSetting(); this.eComService.initialize(); }, err => console.log('getSettings', err));
    }
  }

  refreshServiceSettings() {
    let expressSetup = false;
    let regularSetup = false;
    if (Helper.getLoggedInUser() != null) {

      let addr = Helper.getAddressSelected();

      try {
        let sl = addr.pincode;
        if (sl == null || sl == "" || sl == undefined) {
          // Refresh the token from database
          Helper.setLoggedInUserResponse(null);
          this.navCtrl.navigateRoot(['./sign-in']);
        }
        else {
          this.apiService.getPincodeServiceSettings('').subscribe
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

            }, err => console.log('refreshServiceSettings', err));
          if (!expressSetup) Helper.setExpressPincode(null);
          if (!regularSetup) Helper.setRegularPincode(null);

        }
      }
      catch (e) {
        this.navCtrl.navigateRoot(['./sign-in']);
      }


    }
  }

  getSideMenuList() {
    this.appPages = [
      {
        title: 'home',
        url: '/home',
        icon: 'zmdi zmdi-home',
        login: true
      },
      {
        title: 'categories',
        url: '/categories',
        icon: 'zmdi zmdi-layers',
        login: true
      },
      {
        title: 'saved_posts',
        url: '/saved-posts',
        icon: 'zmdi zmdi-bookmark',
        login: this.userMe ? true : false
      },
      {
        title: 'change_language',
        url: '/select-language',
        icon: 'zmdi zmdi-globe',
        login: true
      },
      {
        title: 'about_us',
        url: '/about-us',
        icon: 'zmdi zmdi-assignment',
        login: true
      },

      // {
      //   title: 'connect_us',
      //   url: '/connect-us',
      //   icon: 'zmdi zmdi-email',
      //   login: this.userMe ? true : false
      // },
      {
        title: 'logout',
        url: '/sign-in',
        icon: 'zmdi zmdi-open-in-new',
        login: this.userMe ? true : false
      },
      {
        title: 'signin',
        url: '/sign-in',
        icon: 'zmdi zmdi-sign-in',
        login: this.userMe ? false : true
      }
    ];
  }
  onNavItemClick(navItem: { title: string, url: string, icon: string }) {
    if (navItem.title == "logout") {
      this.logout();
    } else if (navItem.title == "my_profile") {
      this.viewProfile();
    } else {
      let currPathName = window.location.pathname;
      if (!currPathName || !currPathName.includes(navItem.url)) {
        this.navCtrl.navigateForward([navItem.url]);
      }
    }
  }
  viewProfile() {
    if (this.userMe != null) {
      this.navCtrl.navigateForward(['./my-profile']);
    } else {
      this.navCtrl.navigateForward(['./sign-in']);
    }
  }
  orderTracking() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./order-tracking']);
    } else {
      this.alertLogin();
    }
  }
  myAddress() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./manage-addr']);
    } else {
      this.alertLogin();
    }
  }
  pillReminders() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./pill-reminders']);
    } else {
      this.alertLogin();
    }
  }
  orders() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./orders']);
    } else {
      this.alertLogin();
    }
  }

  offers() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./offers']);
    } else {
      this.alertLogin();
    }
  }
  myAppointments() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./my-appointments']);
    } else {
      this.alertLogin();
    }
  }
  contactUs() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./contact-us']);
    } else {
      this.alertLogin();
    }
  }
  shop() {
    this.navCtrl.navigateForward(['./tabs/regular']);
  }

  expressShop() {
    this.navCtrl.navigateForward(['./tabs/express']);
  }

  certificate()
  {
    this.inAppBrowser.create("http://mango.jeevamrut.in/certificates/", "_system");
  }
  savedItems() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./saved-items']);
    } else {
      this.alertLogin();
    }
  }
  termsConditions() {
    this.navCtrl.navigateForward(['./tnc']);
  }
  faqs() {
    this.navCtrl.navigateForward(['./faqs']);
  }
  wallet() {
    this.navCtrl.navigateForward(['./wallet']);
  }
  share() {
    let couponCode = this.apiService.getUserMe().referral_code;
    let couponText = " Use my code *" + couponCode + "* to order from JEEVAMRUT and get *10% off*. ";
    let text = "Hey ! I found an awesome app JEEVAMRUT who partners with farmers to grow food naturally. Their mission is to know the food and know the farmer who is growing it." + " *Jeevamrut* is a one stop for more than 500 natural products and great selection, all available with home delivery." + couponText + " Android- *https://play.google.com/store/apps/details?id=com.ityme.app*, iOS- *https://www.jeevamrut.in*. Let us together become a healthy big family."

    let image = "https://admin.ityme.in/storage/1324/WhatsApp-Image-2021-10-13-at-4.48.29-PM.jpeg";
    let url = "https://jeevamrut.in";
    let whatsappUrl = "https://wa.me/?text=" + text + "&image=" + image + "&url=" + url;

    this.inAppBrowser.create(whatsappUrl, "_system");

  }

  payments() {
    this.navCtrl.navigateForward(['./order-details']);
  }

  logout() {
    this.translate.get(["logout_title", "logout_message", "no", "yes"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["logout_title"],
        message: values["logout_message"],
        buttons: [{
          text: values["no"],
          handler: () => { }
        }, {
          text: values["yes"],
          handler: () => {
            //This is required as user is logged out and cart is user based;
            this.eComService.clearCart();
            Helper.setLoggedInUserResponse(null);
            this.myEvent.setUserMeData(null);
            this.myEvent.setAddressData(null);
            this.updateUserData();
            this.navCtrl.navigateRoot(['./sign-in']);
          }
        }]
      }).then(alert => alert.present());
    });
  }
  changeLanguage() {
    this.navCtrl.navigateForward(['./change-language']);
  }

  alertLogin() {
    this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

  developed_by() {
    this.inAppBrowser.create('https://corporate.jeevamrut.in/', '_system');
  }
}