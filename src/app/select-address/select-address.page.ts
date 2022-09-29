import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/models/address.models';
import { Helper } from 'src/models/helper.models';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-select-address',
  templateUrl: './select-address.page.html',
  styleUrls: ['./select-address.page.scss']
})
export class SelectAddressPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  currency_icon: string;
  addresses = new Array<MyAddress>();
  isLoading = true;
  fabAction = true;
  addressIdSelected = -1;

  constructor(private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService) { }

  ngOnInit() {
    this.currency_icon = Helper.getSetting("currency_icon");
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    // if (!this.once) {
    this.loadAddresses();
    // }
    // this.once = true;
  }

  loadAddresses() {
    if (!this.addresses || !this.addresses.length) this.uiElementService.presentLoading(this.translate.instant("loading"));
    this.isLoading = true;
    this.subscriptions.push(this.apiService.getAddresses().subscribe(res => {
      this.uiElementService.dismissLoading();
      this.addresses = res;
      this.isLoading = false;
    }, err => {
      console.log("getAddresses", err);
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }));
  }

  onAddressSelected(event) {
    if (event.detail && event.detail.value) {
      this.addressIdSelected = event.detail.value;
    }
  }

  navAddressNew() {
    let navigationExtras: NavigationExtras = { state: { pick_location: false } };
    this.navCtrl.navigateForward(['./add-address'], navigationExtras);
  }

  navPaymentSelection() {
    let selectedAddress = this.getSelectedAddress();
    if (selectedAddress != null) {
      this.eComService.setupOrderRequestAddress(selectedAddress);
      this.navCtrl.navigateForward(['./select-paymet-method']);
    } else {
      this.translate.get("select_address").subscribe(value => this.uiElementService.presentToast(value));
    }
  }

  getSelectedAddress(): MyAddress {
    let toReturn = null;
    for (let ad of this.addresses) if (ad.id == this.addressIdSelected) { toReturn = ad; break; }
    return toReturn;
  }

  toggleFab() {
    this.fabAction = !this.fabAction;
  }

  getAddressToShow(address) {
    return MyAddress.getAddressToShow(address);
  }
}
