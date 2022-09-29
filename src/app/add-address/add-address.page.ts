import { Component, OnInit, ViewChild, ElementRef, NgZone, Inject } from '@angular/core';
import { TitlePage } from '../title/title.page';
import { ModalController, AlertController, NavController, Platform } from '@ionic/angular';
import { MyAddress } from 'src/models/address.models';
//import { MyPincode } from 'src/models/pincode.models';
import { Helper } from 'src/models/helper.models';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/network/api.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { GoogleMapsService } from '../services/network/google-maps.service';
import { MyEventsService } from '../services/events/my-events.service';
import { APP_CONFIG, AppConfig } from '../app.config';
import { appCommonMethods } from '../services/common/appCommonMethods';
import { DeliverySlot } from 'src/models/delivery-slot.models';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.page.html',
  styleUrls: ['./add-address.page.scss']
})
export class AddAddressPage implements OnInit {
  @ViewChild("pleaseConnect", { static: true }) pleaseConnect: ElementRef;
  @ViewChild("map", { static: true }) mapElement: ElementRef;
  private autocompleteService: any;
  private placesService: any;
  private initialized: boolean;
  private marker: any;
  private detecting = false;
  private subscriptions = new Array<Subscription>();
  private pick_location: boolean;
  private pick_pincode: boolean;
  query = "";
  places = [];
  location: MyAddress;
  //pincode: MyPincode;
  deliverySlots: DeliverySlot[];

  constructor(@Inject(APP_CONFIG) private config: AppConfig, private geolocation: Geolocation, private zone: NgZone, private translate: TranslateService, private modalController: ModalController, private router: Router,
    private diagnostic: Diagnostic, private alertCtrl: AlertController, private navCtrl: NavController, private apiService: ApiService, private paltform: Platform,
    private maps: GoogleMapsService, private uiElementService: UiElementsService, private locationAccuracy: LocationAccuracy, private myEventService: MyEventsService,
    public appCommonMethods: appCommonMethods) { }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    if (this.router.getCurrentNavigation().extras.state) {
      this.location = this.router.getCurrentNavigation().extras.state.address;
      this.pick_location = this.router.getCurrentNavigation().extras.state.pick_location;
    }
    if (this.config.defaultLocation && this.config.defaultLocation.use) {
      if (!this.location) { this.location = new MyAddress(); this.location.id = -1; }
      this.location.latitude = this.config.defaultLocation.location.latitude;
      this.location.longitude = this.config.defaultLocation.location.longitude;
      this.location.formatted_address = this.config.defaultLocation.location.title;
      this.location.pincode = this.config.defaultLocation.location.pincode;
    }
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement, this.location).then(() => {
        this.autocompleteService = new google.maps.places.AutocompleteService();
        this.placesService = new google.maps.places.PlacesService(this.maps.map);
        this.maps.map.addListener('click', (event) => {
          if (event && event.latLng) {
            let pos = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
            this.geocode(pos);
          }
        });
        this.initialized = true;
        if (this.location) {
          if (Helper.getLoggedInUser() == null) {
            this.myEventService.setAddressData(this.location);
            this.selectAddress(this.location);
          }
          else {
            let pos = new google.maps.LatLng(Number(this.location.latitude), Number(this.location.longitude));
            this.plotMarker(pos);
          }
        } else {
          this.detect();
        }
      }).catch(err => { console.log("maps.init", err); this.close() });
      mapLoaded.catch(err => { console.log("mapLoaded", err); this.close() });
    }
  }

  searchPlace() {
    if (this.autocompleteService && this.query.length > 0) {
      let config = {
        input: this.query,
        componentRestrictions: {
          country: 'in'
        }
      }
      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.places = [];
          predictions.forEach((prediction) => this.places.push(prediction));
        }
      });
    } else {

      this.places = [];
    }
  }

  selectPlace(place) {
    this.query = place.description;
    this.places = [];
    let myLocation = new MyAddress();
    myLocation.id = -1;
    if (this.location) {
      myLocation.id = this.location.id;
      myLocation.title = this.location.title;
    }
    myLocation.formatted_address = place.name;

    this.placesService.getDetails({ placeId: place.place_id }, (details) => {
      console.log(details);
      this.zone.run(() => {
        myLocation.formatted_address = (details.formatted_address && details.formatted_address.length) ? details.formatted_address : details.name;
        myLocation.latitude = String(details.geometry.location.lat());
        myLocation.longitude = String(details.geometry.location.lng());

        for (var i = 0; i < details.address_components.length; i++) {
          for (var j = 0; j < details.address_components[i].types.length; j++) {
            if (details.address_components[i].types[j] == "postal_code") {
              myLocation.pincode = details.address_components[i].long_name;
            }
          }
        }
        let lc = { lat: details.geometry.location.lat(), lng: details.geometry.location.lng() };
        this.maps.map.setCenter(lc);
        this.location = myLocation;
        let pos = new google.maps.LatLng(Number(lc.lat), Number(lc.lng));
        this.plotMarker(pos);
      });
    });
  }

  save() {

    if (this.location != null) {

      if (this.query == "") {
        this.translate.get("select_apartment_loc").subscribe(value => this.uiElementService.presentToast(value, "middle"));
      }
      else {
        if (this.pick_location) {
          this.selectAddress(this.location);
          this.myEventService.setAddressData(this.location);
        } else if (Helper.getLoggedInUser() != null) {
          //this.location.address1=this.location.pincode;
          this.modalController.create({ component: TitlePage, componentProps: { address: this.location } }).then((modalElement) => {
            modalElement.onDidDismiss().then(data => {
              if (data && data.data) {
                this.location = data.data;
                this.checkDeliveryAvailability(this.location);
              }
            });
            modalElement.present();
          })
        }
        else {
          this.translate.get("select_apartment_loc").subscribe(value => this.uiElementService.presentToast(value, "middle"));
        }
      }
    } else {
      this.translate.get("select_search_loc").subscribe(value => this.uiElementService.presentToast(value));
    }
  }

  checkDeliveryAvailability(location) {
    this.location = location;

    if (Helper.getLoggedInUser() != null) {
      this.apiService.checkDeliveryAvailability(this.location.pincode).subscribe
        (res => {
          if (res.length > 0) {
            if (this.location.id == -1) {
              this.createAddress();
            } else {
              this.updateAddress();
            }
          } else {
            Helper.setDeliveryAvailability("false");
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
    }
  }

  selectAddress(address: MyAddress) {
    Helper.setAddressSelected(address);
    this.refreshServiceSettings();

    // this.close();
  }
  refreshServiceSettings() {
    if (Helper.getLoggedInUser() != null) {
      let expressSetup = false;
      let regularSetup = false;
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
          if (Helper.getDeliveryAvailability() == "true") {
            this.navCtrl.navigateRoot(['./tabs/home']);
          } else {
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
      if (!expressSetup) Helper.setExpressPincode(null);
      if (!regularSetup) Helper.setRegularPincode(null);
    }
  }

  close() {
    // this.navCtrl.pop();
    this.navCtrl.navigateForward(['./tabs/home']);
  }

  detect() {
    this.diagnostic.isLocationEnabled().then((isAvailable) => {
      if (!isAvailable) if (this.paltform.is("cordova")) this.alertLocationServices();
    }).catch((e) => {
      console.error(e);
      if (this.paltform.is("cordova")) this.alertLocationServices();
    });

    if (!this.detecting) {
      this.detecting = true;
      this.geolocation.getCurrentPosition().then((position) => {
        let pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if (this.config.defaultLocation && this.config.defaultLocation.use) {
          if (!this.location) { this.location = new MyAddress(); this.location.id = -1; }
          this.location.latitude = String(pos.lat());
          this.location.longitude = String(pos.lng());

          this.location.formatted_address = "Location #" + this.location.latitude + "," + this.location.longitude;

          this.uiElementService.presentErrorAlert("Using current location, click Continue to save", "Current Location");
        } else {
          this.geocode(pos);
        }
        this.detecting = false;
      }).catch((err) => {
        console.log("getCurrentPosition", err);
        this.translate.get("curr_pos_fail").subscribe(value => this.uiElementService.presentToast(value));
        this.detecting = false;
      });
    }
  }

  geocode(pos: google.maps.LatLng) {
    let geocoder = new google.maps.Geocoder();
    let request = { location: pos };
    geocoder.geocode(request, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
        let myLocation = new MyAddress();
        myLocation.id = -1;
        if (this.location) {
          myLocation.id = this.location.id;
          myLocation.title = this.location.title;
        }
        myLocation.formatted_address = results[0].formatted_address;
        myLocation.latitude = String(pos.lat());
        myLocation.longitude = String(pos.lng());
        this.location = myLocation;
        this.plotMarker(pos);
        this.uiElementService.presentToast(this.location.formatted_address);
      }
    });
  }

  plotMarker(pos: google.maps.LatLng) {
    if (!this.marker) {
      // this.marker = createHTMLMapMarker({
      //   latlng: pos,
      //   map: this.maps.map,
      //   html: '<div id="doctor_map"><img src="assets/images/empty_dp.png"></div>'
      // });
      this.marker = new google.maps.Marker({
        position: pos,
        map: this.maps.map
        //, icon: 'assets/images/marker_map_me.png'
      });
      this.marker.setClickable(true);
      this.marker.addListener('click', (event) => {
        console.log("markerevent", event);
        this.uiElementService.presentToast(this.location.formatted_address);
      });
    }
    else {
      this.marker.setPosition(pos);
    }
    this.maps.map.panTo(pos);
  }

  alertLocationServices() {
    this.translate.get(['location_services_title', 'location_services_message', 'okay']).subscribe(text => {
      this.alertCtrl.create({
        header: text['location_services_title'],
        message: text['location_services_message'],
        buttons: [{
          text: text['okay'],
          role: 'cancel',
          handler: () => {
            this.locationAccuracy.canRequest().then((canRequest: boolean) => {
              if (canRequest) {
                // the accuracy option will be ignored by iOS
                this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(res => console.log('Request successful', res), error => console.log('Error requesting location permissions', error));
              }
            });
          }
        }]
      }).then(alert => alert.present());
    })
  }

  createAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
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

  updateAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(["address_updating", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["address_updating"]);
      this.subscriptions.push(this.apiService.addressUpdate(this.location).subscribe(res => {
        this.uiElementService.dismissLoading();
        this.selectAddress(res);
      }, err => {
        console.log("addressUpdate", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentToast(values["something_wrong"]);
      }));
    });
  }

}
