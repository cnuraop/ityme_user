import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SignUpRequest } from 'src/models/auth-signup-request.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from 'src/models/helper.models';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { MyAddress } from 'src/models/address.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-check-delivery',
  templateUrl: './check-delivery.page.html',
  styleUrls: ['./check-delivery.page.scss']
})
export class CheckDeliveryPage implements OnInit {
  
  pincode: string;  
  deliverySlots: DeliverySlot[];
  location: MyAddress;
  private subscriptions = new Array<Subscription>();

  constructor(private navCtrl: NavController, private uiElementService: UiElementsService,
    private apiService: ApiService, 
    private translate: TranslateService, private alertCtrl: AlertController) { }

  ngOnInit() {

    }

  

  checkPincodeDelivery() {
    console.log("pincode"+this.pincode);
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if(this.pincode.length!=6)
    this.translate.get("err_valid_pincode").subscribe(value => this.uiElementService.presentToast(value));
   else
   this.refreshServiceSettings(true);
  }

  refreshServiceSettings(addressCreate: boolean) {
    if (Helper.getLoggedInUser() != null) {       

        console.log("pincode"+this.pincode);
      let expressSetup = false;
      let regularSetup = false;
      this.apiService.getPincodeServiceSettings(this.pincode).subscribe
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
            if(addressCreate)
          this.createAddress();
            else
            //this.navCtrl.navigateRoot(['./tabs/home']);
            if(Helper.getExpressPincode()!=null ||Helper.getExpressPincode()!=undefined ){
              //this.navCtrl.navigateRoot(['./tabs/express']);
              // todo: navigate to mango page for summers
              this.navCtrl.navigateRoot(['./tabs/home']);
        }
          else
          //    this.navCtrl.navigateRoot(['./tabs/regular']);
          // todo: navigate to mango page for summers
          this.navCtrl.navigateRoot(['./tabs/home']);
          } else {
            this.navCtrl.navigateRoot(['./delivery-unavailable']);
          }
        }, err => console.log('getSettings', err));
      if (!expressSetup) Helper.setExpressPincode(null);
      if (!regularSetup) Helper.setRegularPincode(null);
    }
  }

  createAddress() {
    //Todo: remove this when we move totally to pincode
    this.location=new MyAddress();
          this.location.pincode=this.pincode;
          this.location.title="Home";
          this.location.formatted_address=this.location.title + ": " + this.location.pincode;
    this.location.latitude = "17.4842285";
    this.location.longitude = "78.3541741";
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

 selectAddress(address: MyAddress) {
  Helper.setAddressSelected(address);
  this.refreshServiceSettings(false);
}
  

  goBack() {
    this.navCtrl.pop();
  }

  

}