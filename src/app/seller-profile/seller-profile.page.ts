import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Product } from 'src/models/product.models';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Vendor } from 'src/models/vendor.models';
import { Helper } from 'src/models/helper.models';

@Component({
  selector: 'app-seller-profile',
  templateUrl: './seller-profile.page.html',
  styleUrls: ['./seller-profile.page.scss']
})
export class SellerProfilePage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  private doneAll = false;
  private infiniteScrollEvent;
  private pageNo = 1;
  vendorProfile = new Vendor();
  products = new Array<Product>();
  isLoading = true;
  currency_icon: string;

  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService, private route: ActivatedRoute,
    private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService) { }

  ngOnInit() {this.currency_icon = Helper.getSetting("currency_icon"); }

  ionViewDidEnter() {
    
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if (!this.once) {
        let vendor_id = params["vendor_id"];
        this.translate.get("loading").subscribe(value => {
          this.uiElementService.presentLoading(value);
          this.subscriptions.push(this.apiService.getVendorById(vendor_id).subscribe(res => {
            this.vendorProfile = res;
            this.loadProductsVendor();
          }, err => {
            this.uiElementService.dismissLoading();
            this.navCtrl.pop();
          }));
        });
      }
      this.once = true;
    }));
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  loadProductsVendor() {
    this.subscriptions.push(this.apiService.getProductsWithVendorId(this.vendorProfile.id, this.pageNo).subscribe(res => {
      this.products = this.products.concat(res.data);
      this.doneAll = (!res.data || !res.data.length);
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      console.log("getProductsWithCategoryId", err);
      this.uiElementService.dismissLoading();
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      this.isLoading = false;
    }));
  }

  doInfiniteProducts(event) {
    if (this.doneAll) {
      event.target.complete();
    } else {
      this.infiniteScrollEvent = event;
      this.pageNo = this.pageNo + 1;
      this.loadProductsVendor();
    }
  }

  navProDetail(pro: Product) {
    let navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
  }

  addProCart(pro: Product) {
    // if (pro.sale_price != null && pro.sale_price>0)
    //   pro.price = pro.sale_price;
    let added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
    if (added == -1) {
      //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
      this.uiElementService.alertCartConflict().then(res => {
        if (res) { this.eComService.clearCart(); this.addProCart(pro); }
      });
    }
  }

  removeProCart(pro: Product) {
    this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromProduct(pro));
  }

  quantityProCart(pro: Product) {
    return this.eComService.quantityCartItem(this.eComService.getCartItemFromProduct(pro));
  }

  navCart() {
    this.navCtrl.navigateForward(['./my-cart']);
  }

}
