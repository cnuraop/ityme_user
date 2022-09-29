import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Helper } from 'src/models/helper.models';
import { BaseListResponse } from 'src/models/base-list.models';
import { WalletTransaction } from 'src/models/wallet-transaction.models';
import { MyEventsService } from '../services/events/my-events.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  private infiniteScrollEvent;
  private nextUrl: string;
  isLoading = true;
  transactions = new Array<WalletTransaction>();
  currency_icon: string;
  balance = 0;

  constructor(private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService,
    private myEventsService: MyEventsService) { }

  ngOnInit() {
    this.currency_icon = Helper.getSetting("currency_icon");
  }
  ionViewWillEnter() {
    this.subscriptions.push(this.myEventsService.getWalletObservable().subscribe(value => {
      if (value) {
        this.refreshBalance();
      }
    }));
  }

  ionViewDidEnter() {
    // if (!this.once) {
    this.refreshBalance();
    //   this.once = true;
    // }
  }

  ionViewWillLeave() {
    console.log("ionViewWillLeave");
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  refreshBalance() {
    this.subscriptions.push(this.apiService.getBalance().subscribe(res => {
      if (res.balance != this.balance || ((!this.transactions || !this.transactions.length))) {
        this.transactions = [];
        this.isLoading = true;
        this.subscriptions.push(this.apiService.getTransactions().subscribe(res => this.handleTransactionRes(res), err => this.handleTransactionErr(err)));
      } else {
        this.isLoading = false;
      }
      this.balance = res.balance;
    }, err => {
      console.log("getBalance", err);
      this.isLoading = false;
    }));
  }

  handleTransactionRes(res: BaseListResponse) {
    this.transactions = this.transactions.concat(res.data);
    this.nextUrl = res.links.next;
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();
  }

  handleTransactionErr(err) {
    console.log("handleTransactionErr", err);
    this.uiElementService.dismissLoading();
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
  }

  doInfiniteTransactions(event) {
    if (this.nextUrl == null) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
        if (res && res.data && res.data.length) for (let trans of res.data) this.apiService.setupTransaction(trans);
        this.handleTransactionRes(res);
      }, err => this.handleTransactionErr(err)));
    }
  }

  navAddMoney() {
    if (Helper.getLoggedInUser() != null) {
      this.navCtrl.navigateForward(['./add-money']);
    }
    else {
      this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
      this.navCtrl.navigateForward(['./sign-in']);
    }

  }
}
