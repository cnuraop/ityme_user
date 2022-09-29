import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MyAddress } from 'src/models/address.models';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';

@Component({
  selector: 'app-title',
  templateUrl: './title.page.html',
  styleUrls: ['./title.page.scss']
})
export class TitlePage implements OnInit {
  @Input() address: MyAddress;

  constructor(private modalController: ModalController, private uiElementService: UiElementsService, private translate: TranslateService) {
  }

  ngOnInit() {
    if (!this.address) this.address = new MyAddress();
    if (!this.address.title || !this.address.title.length) this.address.title = "home";
  }

  onAddressTypeChange(event) {
    if (event.detail && event.detail.value) {
      this.address.title = event.detail.value;
    }
  }

  dismiss() {
    this.modalController.dismiss(null);
  }

  save() {
    // if (!this.address.address1 || !this.address.address1.length) {
    //   this.translate.get("err_field_address1").subscribe(value => this.uiElementService.presentToast(value));
    // }

    if (this.address.title == "")
      this.address.title = "Home";
    this.address.formatted_address = this.address.pincode;
    if (!this.address.address1 || !this.address.address1.length) {
      this.translate.get("err_field_address1").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.address.address2 || !this.address.address2.length) {
      this.translate.get("err_field_address2").subscribe(value => this.uiElementService.presentToast(value));
    }
    else if (!this.address.city || !this.address.city.length) {
      this.translate.get("err_field_address3").subscribe(value => this.uiElementService.presentToast(value));
    }
    else if (!this.address.pincode || this.address.pincode.length != 6) {
      this.translate.get("err_field_pincode").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.address.formatted_address = this.address.pincode + ": " + this.address.address1 + ", "
        + this.address.address2 + ", " + this.address.city;
      this.modalController.dismiss(this.address);
    }
  }
}
