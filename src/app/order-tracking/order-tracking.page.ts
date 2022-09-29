import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
//import { Chat2Page } from '../chat2/chat2.page';
import { NavigationExtras, Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { OrderDeliveryProfile } from 'src/models/order.models';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { GoogleMapsService } from '../services/network/google-maps.service';
import { MyAddress } from 'src/models/address.models';
import { Constants } from 'src/models/constants.models';
import { Chat } from 'src/models/chat.models';
import createHTMLMapMarker from '../../assets/scripts/html-map-marker.js';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.page.html',
  styleUrls: ['./order-tracking.page.scss']
})
export class OrderTrackingPage implements OnInit {
  @ViewChild("pleaseConnect", { static: true }) pleaseConnect: ElementRef;
  @ViewChild("map", { static: true }) mapElement: ElementRef;
  delivery: OrderDeliveryProfile;
  private address: MyAddress;
  private vendor: { name: string; image: string; location: { latitude: string; longitude: string } };
  private initialized = false;
  private markerDeliveryGuy;
  private posDeliveryGuy;

  private numDeltas = 100;
  private delay = 10; //milliseconds
  private i = 0;
  private deltaLat;
  private deltaLng;
  private lastToPos = [0, 0];

  constructor(private router: Router, private navCtrl: NavController, private modalController: ModalController, private maps: GoogleMapsService,
    private translate: TranslateService, private uiElementService: UiElementsService, private callNumber: CallNumber) { }

  ngOnInit() {
    console.log("getCurrentNavigation", this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.delivery = this.router.getCurrentNavigation().extras.state.delivery;
      // this.delivery.delivery.latitude = "28.6883748";
      // this.delivery.delivery.longitude = "77.2979777";
      this.address = this.router.getCurrentNavigation().extras.state.address;
      this.vendor = this.router.getCurrentNavigation().extras.state.vendor;
    }
  }

  ionViewDidEnter() {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement, this.address).then(() => {
        this.initialized = true;
        this.plotMarkers();
        this.registerUpdates();
      }).catch(err => { console.log("maps.init", err); this.close() });
      mapLoaded.catch(err => { console.log("mapLoaded", err); this.close() });
    }
  }

  private plotMarkers() {
    let posMe = new google.maps.LatLng(Number(this.address.latitude), Number(this.address.longitude));
    let markerMe = new google.maps.Marker({
      position: posMe, map: this.maps.map
      //, icon: 'assets/images/marker_map_me.png'
    });
    markerMe.addListener('click', (event) => this.uiElementService.presentToast(MyAddress.getAddressToShow(this.address)));

    let posVendor = new google.maps.LatLng(Number(this.vendor.location.latitude), Number(this.vendor.location.longitude));
    let markerVendor = createHTMLMapMarker({
      latlng: posVendor,
      map: this.maps.map,
      html: '<div id="doctor_map"><img src="' + this.vendor.image + '"></div>'
    });
    markerVendor.addListener('click', (event) => this.uiElementService.presentToast(this.vendor.name));

    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer({
      map: this.maps.map,
      polylineOptions: {
        strokeColor: '#279411',
        strokeOpacity: 1.0,
        strokeWeight: 5
      },
      markerOptions: {
        opacity: 0,
        clickable: false,
        position: markerVendor
      }
    });
    let dirReq: any = {
      origin: posVendor,
      destination: posMe,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(dirReq, function (result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(result);
      }
    });

    if (this.delivery.delivery.latitude && this.delivery.delivery.longitude) {
      this.posDeliveryGuy = new google.maps.LatLng(Number(this.delivery.delivery.latitude), Number(this.delivery.delivery.longitude));
      this.markerDeliveryGuy = createHTMLMapMarker({
        latlng: this.posDeliveryGuy,
        map: this.maps.map,
        html: '<div id="doctor_map"><img src="' + this.delivery.delivery.user.image_url + '"></div>'
      });
      this.markerDeliveryGuy.addListener('click', (event) => this.uiElementService.presentToast(this.delivery.delivery.user.name));
    }
  }

  private onNewLocation(newPos: google.maps.LatLng) {
    if (!this.posDeliveryGuy || !newPos.equals(this.posDeliveryGuy)) {

      if (this.posDeliveryGuy != null) {
        this.i = 0;
        this.lastToPos[0] = this.posDeliveryGuy.lat();
        this.lastToPos[1] = this.posDeliveryGuy.lng();
        this.deltaLat = (newPos.lat() - this.lastToPos[0]) / this.numDeltas;
        this.deltaLng = (newPos.lng() - this.lastToPos[1]) / this.numDeltas;
      }

      if (this.markerDeliveryGuy == null) {
        this.markerDeliveryGuy = createHTMLMapMarker({
          latlng: this.posDeliveryGuy,
          map: this.maps.map,
          html: '<div id="doctor_map"><img src="' + this.delivery.delivery.user.image_url + '"></div>'
        });
      } else {
        //this.markerDeliveryGuy.setPosition(this.posDeliveryGuy);
        this.moveMarker();
      }
      this.maps.map.panTo(this.posDeliveryGuy);

    }
  }

  private moveMarker() {
    this.lastToPos[0] = this.lastToPos[0] + this.deltaLat;
    this.lastToPos[1] = this.lastToPos[1] + this.deltaLng;
    let newToPos = new google.maps.LatLng(Number(this.lastToPos[0]), Number(this.lastToPos[1]));
    this.markerDeliveryGuy.setPosition(newToPos);
    this.posDeliveryGuy = newToPos;
    if (this.i != this.numDeltas) {
      this.i++;
      setTimeout(() => {
        this.moveMarker();
      }, this.delay);
    }
    //  else {
    //   this.requestDirection(this.lastTo);
    // }
  }

  private registerUpdates() {
    const component = this;
    firebase.database().ref("deliveries").child(String(this.delivery.delivery.id)).child("location").on('child_changed', function (data) {
      var fireLocation = data.val() as { latitude: string, longitude: string };
      console.log(fireLocation);
      if (fireLocation.latitude != null && fireLocation.longitude != null) component.onNewLocation(new google.maps.LatLng(Number(fireLocation.latitude), Number(fireLocation.longitude)));
    });
  }

  private close() {
    this.navCtrl.pop();
  }

  doCall() {
    this.callNumber.callNumber(this.delivery.delivery.user.mobile_number, false).then(res => console.log('Launched dialer!', res)).catch(err => console.log('Error launching dialer', err));
  }

  navChat() {
    let chat = new Chat();
    chat.chatId = this.delivery.delivery.user.id + Constants.ROLE_DELIVERY;
    chat.chatImage = this.delivery.delivery.user.image_url;
    chat.chatName = this.delivery.delivery.user.name;
    chat.chatStatus = this.translate.instant("delivery_partner");
    chat.myId = this.delivery.delivery.user.id + Constants.ROLE_USER;
    let navigationExtras: NavigationExtras = { state: { chat: chat, delivery_user: this.delivery.delivery.user } };
    this.navCtrl.navigateForward(['./chat2'], navigationExtras);
  }

}
