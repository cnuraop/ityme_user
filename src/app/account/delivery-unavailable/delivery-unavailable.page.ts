import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { UiElementsService } from 'src/app/services/common/ui-elements.service';
import { EventsService } from 'src/app/services/eventsService';
import { ApiService } from 'src/app/services/network/api.service';
import { MyAddress } from 'src/models/address.models';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { Helper } from 'src/models/helper.models';
import { appCommonMethods } from '../../services/common/appCommonMethods';

@Component({
  selector: 'app-delivery-unavailable',
  templateUrl: './delivery-unavailable.page.html',
  styleUrls: ['./delivery-unavailable.page.scss'],
})
export class DeliveryUnavailablePage implements OnInit {

  deliverySlots: DeliverySlot[];
  location: MyAddress;
  userpincode: string;
  messageToShow: string;
  
  private subscriptions = new Array<Subscription>();

  constructor(public appCommonMethods: appCommonMethods, private navCtrl: NavController,
    private apiService: ApiService, private translate: TranslateService, public eventService: EventsService, private uiElementService: UiElementsService) { }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    
  }

  ionViewWillEnter() {
    // let user = Helper.getLoggedInUser();
    // if (user != null) {
    //   this.messageToShow = user.pincode;    
    // }
    // else {
    //   this.messageToShow = user.pincode;
    // }
  }

  ionViewDidLeave() {
    // this.appCommonMethods.enableMenuSwiper();    
  }
  changeLocation() {
    let navigationExtras: NavigationExtras = { state: { pick_location: true } };
    this.navCtrl.navigateForward(['./check-delivery'], navigationExtras);
  }

}
