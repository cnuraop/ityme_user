import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationExtras, ActivatedRoute } from '@angular/router';
import { Product } from 'src/models/product.models';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService, ExpressECommerceService } from '../services/common/ecommerce.service';
import { Subscription } from 'rxjs';
import { Category } from 'src/models/category.models';
import { Constants } from 'src/models/constants.models';
import { Helper } from 'src/models/helper.models';
import { Review } from 'src/models/review.models';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { TitlePage } from '../title/title.page';
import { MyAddress } from 'src/models/address.models';

@Component({
  selector: 'app-product-info',
  templateUrl: './product-info.page.html',
  styleUrls: ['./product-info.page.scss']
})
export class ProductInfoPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  tabPinfo: string = "about";
  gaming: string = "1";
  location: MyAddress;
  similarProducts = new Array<Product>();
  product = new Product();
  category = new Category();
  reviews = new Array<Review>();
  private infiniteScrollEvent;
  private nextUrl: string;
  isLoading = true;

  constructor(
    //    private route: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private translate: TranslateService,
    private photoViewer: PhotoViewer,
    private uiElementService: UiElementsService,
    private apiService: ApiService,
    public eComService: ECommerceService,
    public expressEComService: ExpressECommerceService,
    private modalController: ModalController) { }

  ngOnInit() {
    this.location = Helper.getAddressSelected();
  }

  ionViewDidEnter() {
    this.subscriptions.push(this.route.queryParams.subscribe(params => {
      if (!this.once) {
        let product_id = params["product_id"];
        this.translate.get(["loading", "something_wrong"]).subscribe(values => {
          this.uiElementService.presentLoading(values["loading"]);
          this.subscriptions.push(this.apiService.getProductsWithId(product_id).subscribe(res => {
            this.product = res;
           // console.log(res);
            this.category = this.product.categories[0];
            this.loadProductsSimilar();
            // this.subscriptions.push(this.apiService.getReviewsProduct(this.product.id, 1).subscribe(res => this.reviewsRes(res), err => this.reviewsErr(err)));
          }, err => {
           // console.log("getProductsWithId", err);
            this.uiElementService.dismissLoading();
            this.uiElementService.presentErrorAlert(values["something_wrong"]);
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

  // private reviewsRes(res: BaseListResponse) {
  //   this.reviews = this.reviews.concat(res.data);
  //   this.nextUrl = res.links.next;
  //   if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  //   this.isLoading = false;
  //   this.uiElementService.dismissLoading();
  // }

  // private reviewsErr(err) {
  //   console.log("productsErr", err);
  //   this.uiElementService.dismissLoading();
  //   if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
  //   this.isLoading = false;
  // }

  // doInfiniteReviews(event) {
  //   if (this.nextUrl == null) {
  //     event.target.complete();
  //   } else {
  //     this.infiniteScrollEvent = event;
  //     this.subscriptions.push(this.apiService.getURL(this.nextUrl).subscribe(res => {
  //       let locale = Helper.getLocale();
  //       for (let review of res.data) review.created_at = Helper.formatTimestampDate(review.created_at, locale);
  //       this.reviewsRes(res);
  //     }, err => this.reviewsErr(err)));
  //   }
  // }

  toggleFavorite() {
    if (Helper.getLoggedInUser() != null) {
      this.translate.get("just_moment").subscribe(value => {
        this.uiElementService.presentLoading(value);
        this.subscriptions.push(this.apiService.toggleFavoriteProduct(this.product.id).subscribe(res => {
          this.product.is_favourite = !this.product.is_favourite;
          this.uiElementService.dismissLoading();
        }, err => {
          console.log("toggleProductFavorite", err);
          this.uiElementService.dismissLoading();
        }));
      });
    } else {
      this.alertLogin();
    }
  }

  loadProductsSimilar() {
    this.subscriptions.push(this.apiService.getProductsWithCategoryId(Constants.SCOPE_ECOMMERCE, this.category.id, 1).subscribe(res => {
      let index = -1;
      for (let i = 0; i < res.data.length; i++) {
        if (res.data[i].id == this.product.id) {
          index = i;
          break;
        }
      }
      if (index != -1) res.data.splice(index, 1);
      // this.similarProducts = this.similarProducts.concat(res.data);
      this.similarProducts = res.data;
      // this.doneAll = (!res.data || !res.data.length);
      // if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      // this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      console.log("getProductsWithCategoryId", err);
      this.uiElementService.dismissLoading();
      // if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      // this.isLoading = false;
    }));
  }

  updateAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["address_creating"]);
      this.subscriptions.push(this.apiService.addressUpdate(this.location).subscribe(res => {
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
  }

  addProCart(pro: Product) {
    if(this.location.address2 ==null)
    {
    this.modalController.create({ component: TitlePage, componentProps: { address: this.location } }).then((modalElement) => {
      modalElement.onDidDismiss().then(data => {
        if (data && data.data) {
          this.location = data.data;
          this.updateAddress();
        }
      });
      modalElement.present();
    })
  }
    // if(pro.sale_price != null && pro.sale_price>0)
    //   pro.price=pro.sale_price;
    let added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro == null ? this.product : pro));
    if (added == -1) {
      //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
      this.uiElementService.alertCartConflict().then(res => {
        if (res) { this.eComService.clearCart(); this.addProCart(pro); }
      });
    }
  }

  removeProCart(pro: Product) {
    this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromProduct(pro == null ? this.product : pro));
  }

  quantityProCart(pro: Product) {
    return this.eComService.quantityCartItem(this.eComService.getCartItemFromProduct(pro == null ? this.product : pro));
  }

  navCart() {
    this.navCtrl.navigateForward(['./my-cart']);
  }

  home()
  {
    this.navCtrl.navigateForward(['./tabs/home']);
  }

  navVendorProfile(vendorProfileId) {
    let navigationExtras: NavigationExtras = { queryParams: { vendor_id: vendorProfileId } };
    this.navCtrl.navigateForward(['./seller-profile'], navigationExtras);
  }

  navProDetail(pro) {
    console.log("pro"+ pro.id);
    let navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
    
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
  }

  private alertLogin() {
    this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }

  bigImage(myImage) {
    this.photoViewer.show(myImage);
  }

  //  product_review() {
  //   this.navCtrl.navigateForward(['./product-reviews']);
  //  }    
  navReviews() {
    let navigationExtras: NavigationExtras = { state: { product: this.product } };
    this.navCtrl.navigateForward(['./product-reviews'], navigationExtras);
  }

  //Express Cart Methods
  addExpressProCart(pro: Product) {
    if (this.location.address2 == null) {
      this.modalController.create({ component: TitlePage, componentProps: { address: this.location } }).then((modalElement) => {
        modalElement.onDidDismiss().then(data => {
          if (data && data.data) {
            this.location = data.data;
            this.updateAddress();
          }
        });
        modalElement.present();
      })
    }
    const added = this.expressEComService.addOrIncrementCartItem(this.expressEComService.getCartItemFromProduct(pro));
    if (added === -1) {
      //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
      this.uiElementService.alertCartConflict().then(res => {
        if (res) { this.expressEComService.clearCart(); this.addProCart(pro); }
      });
    }
  }

  removeExpressProCart(pro: Product) {
    this.expressEComService.removeOrDecrementCartItem(this.expressEComService.getCartItemFromProduct(pro));
  }

  quantityExpressProCart(pro: Product) {
    return this.expressEComService.quantityCartItem(this.expressEComService.getCartItemFromProduct(pro));
  }

  navExpressCart() {
    this.navCtrl.navigateForward(['./my-express-cart']);
  }
}
