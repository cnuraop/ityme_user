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
  selector: 'app-manage-addresses',
  templateUrl: './manage-addresses.page.html',
  styleUrls: ['./manage-addresses.page.scss']
})
export class ManageAddressesPage implements OnInit {
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

  navAddressNew() {
    // let navigationExtras: NavigationExtras = { state: { pick_location: false } };
    // this.navCtrl.navigateForward(['./add-address'], navigationExtras);

    this.modalController.create({ component: TitlePage, componentProps: { address: this.selectedLocation } }).then((modalElement) => {
      modalElement.onDidDismiss().then(data => {
          if (data && data.data) {
              this.selectedLocation = data.data;
              //this.createAddress();
              this.checkDeliveryAvailability(this.selectedLocation,1);
          }
      });
      modalElement.present();
  })
  }

  navAddressEdit(selectedAddress: MyAddress, index: number) {
    // let navigationExtras: NavigationExtras = { state: { pick_location: false } };
    // this.navCtrl.navigateForward(['./add-address'], navigationExtras);

    this.modalController.create({ component: TitlePage, componentProps: { address: selectedAddress } }).then((modalElement) => {
      modalElement.onDidDismiss().then(data => {
          if (data && data.data) {
              this.selectedLocation = data.data;
              //this.createAddress();
              // flag 0 for edit
              this.checkDeliveryAvailability(this.selectedLocation,0);
          }
      });
      modalElement.present();
  })
  }

  checkDeliveryAvailability(location, createNew) {
    this.selectedLocation = location;

    if (Helper.getLoggedInUser() != null) {
      this.apiService.checkDeliveryAvailability(this.selectedLocation.pincode).subscribe
        (res => {
          if (res.length > 0) {
            if(createNew)
            this.createAddress();
            else
            this.editAddress();
            
          } else {
            Helper.setDeliveryAvailability("false");
            
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
    }
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

  createAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(["saving", "something_wrong"]).subscribe(values => {
        this.uiElementService.presentLoading(values["saving"]);
        this.subscriptions.push(this.apiService.addressAdd(this.selectedLocation).subscribe(res => {
            this.uiElementService.dismissLoading();
            this.selectAddress(res);
            this.saveMe({ pincode: this.selectedLocation.pincode });
            this.loadAddresses();
        }, err => {
            console.log("addressAdd", err);
            this.uiElementService.dismissLoading();
            this.uiElementService.presentToast(values["something_wrong"]);
        }));
    });
}

editAddress() {
  // this.location.latitude = "17.4842285";
  // this.location.longitude = "78.3541741";
  this.translate.get(["saving", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["saving"]);
      this.subscriptions.push(this.apiService.addressUpdate(this.selectedLocation).subscribe(res => {
          this.uiElementService.dismissLoading();
          this.selectAddress(res);
          this.saveMe({ pincode: this.selectedLocation.pincode });
          this.loadAddresses();
          
      }, err => {
          console.log("addressAdd", err);
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values["something_wrong"]);
      }));
  });
}


  getSelectedAddress(): MyAddress {
    let toReturn = null;
    for (let ad of this.addresses) if (ad.id == this.addressIdSelected) { toReturn = ad; break; }
    return toReturn;
  }

  selectAddress(address: MyAddress) {
    Helper.setAddressSelected(address);
  }

  getAddress() {
    return Helper.getAddressSelected();
  }

  getAddressToShow(address) {
    return MyAddress.getDetailedAddressToShow(address);
  }

  DeleteAddress(address: MyAddress, index: number) {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    let currentAddress = this.getAddress();
    console.log("current"+currentAddress.id + "selected"+address.id)
    if(currentAddress.id!=address.id && this.addresses.length>1){

    this.translate.get(["address_updating", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["address_updating"]);
      this.subscriptions.push(this.apiService.addressDelete(address).subscribe(res => {
        this.uiElementService.dismissLoading();
        this.addresses.splice(index,1);
      }, err => {
        console.log("addressUpdate", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentToast(values["something_wrong"]);
      }));
    });
  }
  else
  this.uiElementService.presentToast("You cannot delete your current address");
  }
}
