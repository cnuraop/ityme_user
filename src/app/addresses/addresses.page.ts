import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/models/address.models';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { NavigationExtras, Router } from '@angular/router';
import { Helper } from 'src/models/helper.models';
import { MyEventsService } from '../services/events/my-events.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { appCommonMethods } from '../services/common/appCommonMethods';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { TitlePage } from '../title/title.page';

@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.page.html',
  styleUrls: ['./addresses.page.scss']
})
export class AddressesPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  addresses = new Array<MyAddress>();
  isLoading = true;
  fabAction = true;
  addressIdSelected = -1;
  private pick_location: boolean;
  deliverySlots: DeliverySlot[];
  selectedLocation:MyAddress;

  constructor(private navCtrl: NavController, private translate: TranslateService, private router: Router, private myEventService: MyEventsService,
    private uiElementService: UiElementsService, private apiService: ApiService, private eComService: ECommerceService,
    public appCommonMethods: appCommonMethods,
    private modalController: ModalController) { }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    //this.uiElementService.presentLoading(this.translate.instant("loading"));
    if (this.router.getCurrentNavigation().extras.state) this.pick_location = this.router.getCurrentNavigation().extras.state.pick_location;
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    // if (!this.once) {
    //   this.loadAddresses();
    // }
    // this.once = true;
    this.loadAddresses();
  }

  loadAddresses() {
    if (!this.addresses || !this.addresses.length)
      this.uiElementService.presentLoading(this.translate.instant("loading"));
    this.isLoading = true;
    this.subscriptions.push(this.apiService.getAddresses().subscribe(res => {
      this.addresses = res.reverse();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      this.uiElementService.dismissLoading();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }));
  }

  onAddressSelected(event) {
    if (event.detail && event.detail.value) {
      this.addressIdSelected = event.detail.value;
    }
  }

  onClickSelectAddrs() {
    if (this.addressIdSelected != -1) {
      let addressSelected = this.getSelectedAddress();
      if (addressSelected != null) {
        if (this.pick_location) {
          //Based on Address change cart needs to be clear, We have to comment this as we are poping location select after login
          //This resolves the cart empty after login
          //this.eComService.clearCart();
          this.selectAddress(addressSelected);
          this.myEventService.setAddressData(addressSelected);
        } else {
          let navigationExtras: NavigationExtras = { state: { address: addressSelected, pick_location: false } };
          this.navCtrl.navigateForward(['./add-address'], navigationExtras);
        }
      }
    }
  }

  createAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
        this.uiElementService.presentLoading(values["address_creating"]);
        this.subscriptions.push(this.apiService.addressAdd(this.selectedLocation).subscribe(res => {
            this.uiElementService.dismissLoading();
            this.selectAddress(res);
        }, err => {
            console.log("addressAdd", err);
            this.uiElementService.dismissLoading();
            this.uiElementService.presentToast(values["something_wrong"]);
        }));
    });
}

saveMe(updateRequestIn?: any) {
  this.translate.get(["saving", "something_wrong"]).subscribe(values => {
    this.uiElementService.presentLoading(values["saving"]);

    this.apiService.updateUser(updateRequestIn).subscribe(res => {
      this.uiElementService.dismissLoading();
      Helper.setLoggedInUser(res);
      this.myEventService.setUserMeData(res);
    }, err => {
      console.log("updateUser", err);
      this.uiElementService.dismissLoading();
      this.uiElementService.presentErrorAlert(values["something_wrong"]);
    });
  });
}


  navAddressNew() {
    // let navigationExtras: NavigationExtras = { state: { pick_location: false } };
    // this.navCtrl.navigateForward(['./add-address'], navigationExtras);

      this.modalController.create({ component: TitlePage, componentProps: { address: this.selectedLocation } }).then((modalElement) => {
          modalElement.onDidDismiss().then(data => {
              if (data && data.data) {
                  this.selectedLocation = data.data;
                  //this.createAddress();
                  this.checkDeliveryAvailability(this.selectedLocation);
              }
          });
          modalElement.present();
      })
  
  }

  checkDeliveryAvailability(location) {
    this.selectedLocation = location;

    if (Helper.getLoggedInUser() != null) {
      this.apiService.checkDeliveryAvailability(this.selectedLocation.pincode).subscribe
        (res => {
          if (res.length > 0) {
            this.createAddress();
            this.saveMe({ pincode: this.selectedLocation.pincode });
          } else {
            Helper.setDeliveryAvailability("false");
            this.saveMe({ pincode: this.selectedLocation.pincode });
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
    }
  }

  getSelectedAddress(): MyAddress {
    let toReturn = null;
    for (let ad of this.addresses) if (ad.id == this.addressIdSelected) { toReturn = ad; break; }
    return toReturn;
  }

  selectAddress(address: MyAddress) {
    Helper.setAddressSelected(address);
    // this.eComService.setupOrderRequestAddress(address);
    //this.navCtrl.pop();
    this.refreshServiceSettings();
  }

  getAddressToShow(address) {
    return MyAddress.getDetailedAddressToShow(address);
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
        //     if(Helper.getExpressPincode()!=null ||Helper.getExpressPincode()!=undefined ){
        //       this.navCtrl.navigateRoot(['./tabs/express']);
        
        // }
        //   else
        //       this.navCtrl.navigateRoot(['./tabs/regular']);
           } 
        else {
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
      if (!expressSetup) Helper.setExpressPincode(null);
      if (!regularSetup) Helper.setRegularPincode(null);
    }
  }
}
