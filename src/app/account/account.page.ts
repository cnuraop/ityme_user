import { Component, OnInit, Inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { APP_CONFIG, AppConfig } from '../app.config';
import { User } from 'src/models/user.models';
import { Helper } from 'src/models/helper.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { TranslateService } from '@ngx-translate/core';
import { MyEventsService } from '../services/events/my-events.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { ApiService } from '../services/network/api.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss']
})
export class AccountPage implements OnInit {

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private myEvent: MyEventsService, public apiService: ApiService,
    private uiElementService: UiElementsService, private translate: TranslateService, private alertCtrl: AlertController, private eComService: ECommerceService,
    private inAppBrowser: InAppBrowser) { }

  ngOnInit() {
  }

  viewProfile() {
    if (this.apiService.getUserMe() != null) {
      this.navCtrl.navigateForward(['./my-profile']);
    } else {
      this.alertLogin();
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
      this.navCtrl.navigateForward(['./addresses']);
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
  share(){
    this.inAppBrowser.create("https://api.whatsapp.com/send?text=Sharing joy is double joy, hence sharing this site with you. Jeevamrut is a one stop for more than 500 Natural products and great selection, all available with home delivery. Android- https://play.google.com/store/apps/details?id=com.ityme.app, iOS-https://www.jeevamrut.in. Let us together become a healthy big family.", "_system");
    
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
            //This is required as user is logged out and cart is user based
            this.eComService.clearCart();
            Helper.setLoggedInUserResponse(null);
            this.myEvent.setUserMeData(null);
            this.myEvent.setAddressData(null);
          }
        }]
      }).then(alert => alert.present());
    });
  }
  changeLanguage() {
    this.navCtrl.navigateForward(['./change-language']);
  }
 
  alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

  developed_by() {
    this.inAppBrowser.create("https://corporate.jeevamrut.in/", "_system");
  }
}
