import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SupportRequest } from 'src/models/support-request.models';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss']
})
export class ContactUsPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  reportCategory = '';
  supportRequest: SupportRequest;

  constructor(private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService) {
    const userMe = apiService.getUserMe();
    this.supportRequest = new SupportRequest(userMe.name, userMe.email, userMe.id, userMe.mobile_number, '');
  }

  ngOnInit() { }

  ionViewWillLeave() {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  ionViewDidEnter() {
    this.supportRequest.message='';
  }
  setCategory(event) {
    this.reportCategory = event.detail.value;
    this.supportRequest.report_category = this.reportCategory;
    event.stopPropagation();
  }
  submit() {
    if (this.supportRequest && this.supportRequest.message) {
      this.translate.get(['supporting', 'supporting_success', 'something_wrong']).subscribe(values => {
        this.uiElementService.presentLoading(values["supporting"]);
        this.subscriptions.push(this.apiService.submitSupport(this.supportRequest).subscribe(res => {
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values["supporting_success"]);
          this.navCtrl.navigateRoot(['./custom-route']);
        }, err => {
          console.log('submitSupport', err);
          this.uiElementService.dismissLoading();
          this.uiElementService.presentToast(values.something_wrong);
        }));
      });
    } else {
      this.translate.get('err_valid_support_msg').subscribe(value => this.uiElementService.presentToast(value));
    }
  }

}
