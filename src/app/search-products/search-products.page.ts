import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/models/address.models';
import { APP_CONFIG, AppConfig } from '../app.config';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Helper } from 'src/models/helper.models';
import { BaseListResponse } from 'src/models/base-list.models';
import { Product } from 'src/models/product.models';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-search-products',
  templateUrl: './search-products.page.html',
  styleUrls: ['./search-products.page.scss']
})
export class SearchProductsPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  private infiniteScrollEvent;
  private selectedLocationNew: MyAddress;
  private nextUrl: string;
  lastSearchString: string;
  searchHistory = new Array<string>();
  products = new Array<Product>();
  isLoading = true;
  express=false;

  constructor(@Inject(APP_CONFIG) public config: AppConfig, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService,  private router: Router, private eComService: ECommerceService) {
    this.searchHistory = Helper.getSearchHistory("pro");
  }

  ngOnInit() {
    this.selectedLocationNew = Helper.getAddressSelected();
    if (this.router.getCurrentNavigation().extras.state) {
      this.express = this.router.getCurrentNavigation().extras.state.express;
    }
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
    Helper.setSearchHistory(this.searchHistory, "pro");
  }

  onSearchbarChange(event) {
    let query = "";
    if (event && event.detail && event.detail.value) query = event.detail.value.toLowerCase().trim();
    if (query.length) this.doSearch(query);
  }

  doSearch(queryIn) {
    this.isLoading = true;
    this.lastSearchString = queryIn;
    this.products = [];
    this.nextUrl = null;
    if(!this.express)
    this.subscriptions.push(this.apiService.getProductsWithQuery(queryIn, 1, this.selectedLocationNew).subscribe(res => this.productsRes(res), err => this.productsErr(err)));
    else
    this.subscriptions.push(this.apiService.getExpressProductsWithQuery(queryIn, 1, this.selectedLocationNew).subscribe(res => this.productsRes(res), err => this.productsErr(err)));
    
    // if (!this.searchHistory.includes(this.lastSearchString)) this.searchHistory.unshift(this.lastSearchString);
    // if (this.searchHistory.length > 3) this.searchHistory.splice(3, 1);
    // Helper.setSearchHistory(this.searchHistory);
  }

  productsRes(res: BaseListResponse) {
    this.products = this.products.concat(res.data);
    this.nextUrl = res.links.next;
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
    this.uiElementService.dismissLoading();

    if (res.data && res.data.length) if (!this.searchHistory.includes(this.lastSearchString)) this.searchHistory.unshift(this.lastSearchString);
    if (this.searchHistory.length > 3) this.searchHistory.splice(3, 1);
    Helper.setSearchHistory(this.searchHistory, "pro");
  }

  productsErr(err) {
    console.log("productsErr", err);
    this.uiElementService.dismissLoading();
    if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
    this.isLoading = false;
  }

  doInfiniteProducts(event) {
    if (this.nextUrl == null) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
        if (res && res.data && res.data.length) for (let pro of res.data) this.apiService.setupProduct(pro);
        this.productsRes(res);
      }, err => this.productsErr(err)));
    }
  }

  navProDetail(pro) {
    let navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
  }
}
