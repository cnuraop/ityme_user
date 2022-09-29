import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Doctor } from 'src/models/doctor.models';
import { NavController } from '@ionic/angular';
import { GoogleMapsService } from '../services/network/google-maps.service';
import createHTMLMapMarker from '../../assets/scripts/html-map-marker.js';
import { Helper } from 'src/models/helper.models';
import { Constants } from 'src/models/constants.models';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.page.html',
  styleUrls: ['./map-view.page.scss']
})
export class MapViewPage implements OnInit {
  @ViewChild("pleaseConnect", { static: true }) pleaseConnect: ElementRef;
  @ViewChild("map", { static: true }) mapElement: ElementRef;
  doctors = new Array<Doctor>();
  currency_icon: string;
  private initialized = false;

  constructor(private router: Router, private navCtrl: NavController, private maps: GoogleMapsService) {
    console.log("getCurrentNavigation", this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.doctors = this.router.getCurrentNavigation().extras.state.doctors;
    }
  }

  ngOnInit() {
    this.currency_icon = Helper.getSetting("currency_icon");
  }

  ionViewDidEnter() {
    if (!this.initialized) {
      let mapLoaded = this.maps.init(this.mapElement.nativeElement, this.pleaseConnect.nativeElement, null).then(() => {
        this.initialized = true;
        this.plotMarkers();
      }).catch(err => { console.log("maps.init", err); this.close() });
      mapLoaded.catch(err => { console.log("mapLoaded", err); this.close() });
    }
  }

  private close() {
    this.navCtrl.pop();
  }

  private plotMarkers() {
    let posBonds = new google.maps.LatLngBounds();
    for (let doc of this.doctors) {
      let posDoc = new google.maps.LatLng(Number(doc.hospitalClosest.latitude), Number(doc.hospitalClosest.longitude));
      let markerDoc = createHTMLMapMarker({
        latlng: posDoc,
        map: this.maps.map,
        html: '<div id="doctor_map"><img src="' + doc.user.image_url + '"></div>'
      });
      posBonds.extend(posDoc);
    }
    setTimeout(() => this.maps.map.fitBounds(posBonds), 1000);
  }

  navDocProfile(doc) {
    window.localStorage.setItem(Constants.TEMP_DOCTOR, JSON.stringify(doc));
    this.navCtrl.navigateForward(['./doctor-profile']);
  }

}
