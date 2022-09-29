import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Helper } from 'src/models/helper.models';
import { User } from 'src/models/user.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { MyEventsService } from '../services/events/my-events.service';
import { ApiService } from '../services/network/api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vt-popup',
  templateUrl: './vt-popup.page.html',
  styleUrls: ['./vt-popup.page.scss']
})
export class VtPopupPage implements OnInit {
  loading: any;
  loadingShown: boolean;
  email_Id: string = '';
  userMe: User;

  constructor(public navCtrl: NavController, private translate: TranslateService, public modalCtrl: ModalController, private modalController: ModalController,
    private http: HttpClient,private uiElementService: UiElementsService, private apiService: ApiService, private myEvent: MyEventsService) {

  }

  ngOnInit() {
    this.userMe = this.apiService.getUserMe();
  }

  dismiss() {
    this.modalController.dismiss();
  }
  
  onSubscribe() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.userMe.email.length <= 5 || !reg.test(this.userMe.email)) {
      return this.uiElementService.presentToast('Please provide your valid email.')
    }
    this.uiElementService.presentLoading('Saving...')
    this.saveMe();
  }

  saveMe(updateRequestIn?: any) {
    let uur = updateRequestIn != null ? updateRequestIn : { name: this.userMe.name, email: this.userMe.email };
    this.translate.get(["saving", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["saving"]);

      this.apiService.updateUser(uur).subscribe(res => {
        this.uiElementService.dismissLoading();
        Helper.setLoggedInUser(res);
        this.myEvent.setUserMeData(res);
        this.modalController.dismiss();
        this.uiElementService.presentToast("Saved successfully");
      }, err => {
        console.log("updateUser", err);
        this.uiElementService.presentToast('Sorry, please try later, or reach out to us using contact-us page.')
      this.modalController.dismiss();
      this.uiElementService.dismissLoading();
      });
    });
  }

}
