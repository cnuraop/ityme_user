import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { MyEventsService } from '../services/events/my-events.service';
import { TranslateService } from '@ngx-translate/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Helper } from 'src/models/helper.models';
import { Subscription } from 'rxjs';
import { UiElementsService } from '../services/common/ui-elements.service';
import { AppComponent } from '../app.component';
import { ApiService } from '../services/network/api.service';
import { appCommonMethods } from '../services/common/appCommonMethods';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  private subscriptions = new Array<Subscription>();

  constructor(private navCtrl: NavController, private diagnostic: Diagnostic, private translate: TranslateService, private uiElementService: UiElementsService,
    private myEventsService: MyEventsService, private alertCtrl: AlertController, private locationAccuracy: LocationAccuracy, private platform: Platform,
    private appcom:AppComponent, public apiService: ApiService,public appCommonMethods: appCommonMethods) { }

  ngOnInit() {
      this.subscriptions.push(this.myEventsService.getCustomEventObservable().subscribe(data => {

        if (data == "nav:pick_location") {
          this.alertLocation();
        }
        // else if (data == "nav:pick_pincode") {
        //   this.alertLocation();
        // }
      }));
  }
  ionViewWillEnter() {
    this.appCommonMethods.enableMenuSwiper();
    if (Helper.getLoggedInUser() != null) {
      this.apiService.setUserMe(Helper.getLoggedInUser());    
      this.appcom.updateUserData();
    } else {
      let navigationExtras: NavigationExtras = { state: { pick_location: true } };
      this.navCtrl.navigateForward(['./sign-in'], navigationExtras);
    }
  }

  ngOnDestroy() {
    for (let sub of this.subscriptions) sub.unsubscribe();
  }

  ionViewWillLeave() {
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    let selectedLocation = Helper.getAddressSelected();
    if (selectedLocation == null) this.alertLocation();
  }

  alertLocation() {//console.log("in tabs");
    this.uiElementService.dismissLoading();
    if (Helper.getLoggedInUser() != null) {
      let navigationExtras: NavigationExtras = { state: { pick_location: true } };
      this.navCtrl.navigateForward(['./addresses'], navigationExtras);
    } else {
      if (this.platform.is("cordova")) {
        this.diagnostic.isLocationEnabled().then((isAvailable) => {
          if (isAvailable) {
            this.alertLocationPage();
          } else {
            this.alertLocationServices();
          }
        }).catch((e) => {
          console.error(e);
          this.alertLocationServices();
        });
      } else {
        this.alertLocationServices();
      }
    }
  }

  alertLocationServices() {
    if (this.platform.is("cordova")) {
      this.platform.ready().then(() => {
        this.translate.get(["location_services_title", "location_services_message", "okay", "search_anyway"]).subscribe(values => {
          this.alertCtrl.create({
            header: values["location_services_title"],
            message: values["location_services_message"],
            buttons: [{
              text: values["okay"],
              handler: () => {
                this.locationAccuracy.canRequest().then((canRequest: boolean) => {
                  if (canRequest) {
                    // the accuracy option will be ignored by iOS
                    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                      () => console.log('Request successful'),
                      error => console.log('Error requesting location permissions', error)
                    );
                  }
                });
              }
            }, {
              text: values["search_anyway"],
              handler: () => this.alertLocationPage()
            }]
          }).then(alert => alert.present());
        });
      });
    } else {
      this.alertLocationPage();
    }

  }

  private alertLocationPage() {

    if (Helper.getLoggedInUser() != null) {
      let navigationExtras: NavigationExtras = { state: { pick_location: true } };
      this.navCtrl.navigateForward(['./addresses'], navigationExtras);
    } else {
      // if (Helper.getAddressSelected() == null) {
      //   // let navigationExtras: NavigationExtras = { state: { pick_location: true } };
      //   // this.navCtrl.navigateForward(['./addresses'], navigationExtras);
      //   //this.getAddress();
      // } else {
        let navigationExtras: NavigationExtras = { state: { pick_location: true } };
        this.navCtrl.navigateForward(['./sign-in'], navigationExtras);
      }
    }
  

  // getAddress() {
  //   this.apiService.getAddresses().subscribe(res => {
  //     this.uiElementService.dismissLoading();
  //     if (res.length > 0) {
  //       let addresses = res;
  //       let addressSelected = addresses[0];
  //       Helper.setAddressSelected(addressSelected);
  //       this.myEventService.setAddressData(addressSelected);
  //       this.refreshServiceSettings(false);
  //     } else {
  //       this.refreshServiceSettings(true);
  //     //  this.navAddressNew();
  //     }
  //   }, err => {
  //     this.uiElementService.dismissLoading();
  //    // this.navAddressNew();
  //   });
  // }


  alertPincode() {
    this.uiElementService.dismissLoading();
    if (Helper.getLoggedInUser() != null) {
      let navigationExtras: NavigationExtras = { state: { pick_pincode: true } };
      this.navCtrl.navigateForward(['./pincodes'], navigationExtras);
    } else {
      this.alertPincodePage();
    }
  }


  private alertPincodePage() {
    if (Helper.getLoggedInUser() != null) {
      let navigationExtras: NavigationExtras = { state: { pick_pincode: true } };
      this.navCtrl.navigateForward(['./pincodes'], navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = { state: { pick_pincode: true } };
      this.navCtrl.navigateForward(['./add-pincode'], navigationExtras);
    }
  }
}
