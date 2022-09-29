import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Faq } from 'src/models/faq.models';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss']
})
export class FaqsPage implements OnInit {
  private subscriptions = new Array<Subscription>();

  faqs = new Array<Faq>();
  curFaqId
  isLoading = true;

  constructor(private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService) {
    this.translate.get("loading").subscribe(value => {
      this.uiElementService.presentLoading(value);
      this.getFaqs();
    });
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  expandFaq(faq: Faq) {
    this.curFaqId = (this.curFaqId == faq.id) ? -1 : faq.id;
  }

  private getFaqs() {
    this.subscriptions.push(this.apiService.getFaqs().subscribe(res => {
      this.faqs = res;
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      console.log('faqs', err);
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }));
  }

}
