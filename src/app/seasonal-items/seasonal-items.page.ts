import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/models/address.models';
import { Category } from 'src/models/category.models';
import { Constants } from 'src/models/constants.models';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { Helper } from 'src/models/helper.models';
import { Product } from 'src/models/product.models';
import { SeasonalProduct } from 'src/models/seasonal-product.models';
import {ECommerceService, ExpressECommerceService} from '../services/common/ecommerce.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { MyEventsService } from '../services/events/my-events.service';
import { ApiService } from '../services/network/api.service';
import { TitlePage } from '../title/title.page';

@Component({
  selector: 'app-seasonal-items',
  templateUrl: './seasonal-items.page.html',
  styleUrls: ['./seasonal-items.page.scss'],
})
export class SeasonalItemsPage implements OnInit {
  private once = false;
  private subscriptions = new Array<Subscription>();
  categories: Array<Category>;
  categoriesSub = new Array<Category>();
  category_id: number;
  parentcategory_id: number;
  subcategory_id: number;
  isLoading = true;
  category: Category;
  currency_icon: string;
  selectedCategory: Category;
  seasonalProducts = new Array<SeasonalProduct>();
  regularDeliverySettings: DeliverySlot;
  dispatch_week: string;
  selectedLocation: MyAddress;

  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService,
    private myEventsService: MyEventsService, private modalController: ModalController, public expressComService: ExpressECommerceService) {

  }

  ngOnInit() {
    this.currency_icon = Helper.getSetting("currency_icon");
    this.regularDeliverySettings = Helper.getRegularPincode();
    this.loadProducts();
    if (!this.once) {
      if (this.router.getCurrentNavigation().extras.state) {

        this.translate.get("loading").subscribe(value => {
          this.uiElementService.presentLoading(value);

        });
      }
    }
    this.once = true;
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  loadProducts() {
    this.subscriptions.push(this.apiService.getSeasonalProducts().subscribe(res => {
      let selectedIndex=0;
      if (res.length > 0) {
        res.forEach(element => {
          element['selected_week'] = "";
          if (element.meta.length > 0) {
            element['selected_week'] = element.meta[0].id;
            for (var i = 0, len = element.meta.length; i < len; i++) {
              if (element.meta[i].stock_quantity > 0) {
                selectedIndex=i;
                element['selected_week'] = element.meta[i].id;
                element['price'] = element.meta[i].price;
                element['week'] = element.meta[i].week;
                element['stock_quantity'] = element.meta[i].stock_quantity;
                break;
              }
            }
          }
          element.price=element.meta[selectedIndex].price;
          element.sale_price=element.meta[selectedIndex].sale_price;

          this.seasonalProducts.push(element);
        });
      }
    }, err => {

    }));
  }

  OnCategoryChange(event, pro: SeasonalProduct) {
    let id = event.detail.value;
    for (let meta of pro.meta) {
      if (meta.id == id) {
        pro.price = meta.price;
        pro.sale_price=meta.sale_price;
        pro.week = meta.week;
        pro.stock_quantity = meta.stock_quantity;
      }
    }
  }

  updateAddress() {
    // this.location.latitude = "17.4842285";
    // this.location.longitude = "78.3541741";
    this.translate.get(['address_creating', 'something_wrong']).subscribe(values => {
      this.uiElementService.presentLoading(values["address_creating"]);
      this.subscriptions.push(this.apiService.addressUpdate(this.selectedLocation).subscribe(res => {
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

  addProCart(seasonpro: SeasonalProduct, event) {
    if(this.selectedLocation.address2 ==null)
    {
    this.modalController.create({ component: TitlePage, componentProps: { address: this.selectedLocation } }).then((modalElement) => {
      modalElement.onDidDismiss().then(data => {
        if (data && data.data) {
          this.selectedLocation = data.data;
          this.updateAddress();
        }
      });
      modalElement.present();
    })
  }
    let pro: Product;
    pro = SetupProduct(seasonpro);

    const added = this.expressComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
    if (added === -1) {
      // Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
      // this.uiElementService.alertCartConflict().then(res => {
      //   if (res) { this.eComService.clearCart(); this.addProCart(seasonpro); }
      // });
    }
    event.stopPropagation();
  }

  removeProCart(seasonpro: SeasonalProduct, event) {
    let pro: Product;
    pro = SetupProduct(seasonpro);
    this.expressComService.removeOrDecrementCartItem(this.eComService.getCartItemFromProduct(pro));
    event.stopPropagation();
  }

  quantityProCart(seasonpro: SeasonalProduct) {
    let pro: Product;
    pro = SetupProduct(seasonpro);
    return this.expressComService.quantityCartItem(this.eComService.getCartItemFromProduct(pro));
  }

  navCart() {
    this.navCtrl.navigateForward(['./my-cart']);
  }

  navProDetail(pro, event) {
    const navigationExtras: NavigationExtras = { queryParams: { product_id: pro.selected_week } };
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
    event.stopPropagation();
  }
  openSelect(select, event) {
    // select.open();
    event.stopPropagation();
  }

  navReviews(pro, event) {
    const navigationExtras: NavigationExtras = { state: { product: pro } };
    this.navCtrl.navigateForward(['./product-reviews'], navigationExtras);
    event.stopPropagation();
  }

  alertLogin() {
    this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.navigateForward(['./sign-in']);
  }
  getAddressToShow() {
    if (Helper.getLoggedInUser() == null)
      return 'Click here to set your address!'
    else
      this.selectedLocation = Helper.getAddressSelected();

    return MyAddress.getAddressToShow(this.selectedLocation);
  }
  pickLocation() {
    this.selectedLocation = undefined;
    this.myEventsService.setCustomEventData('nav:pick_location');
  }

  cart() {
    this.navCtrl.navigateForward(['./my-express-cart']);
  }

  navExpressCart() {
    this.navCtrl.navigateForward(['./my-express-cart']);
  }
}

function SetupProduct(seasonpro: SeasonalProduct): Product {
  let pro: Product;
  pro = new Product();

  pro.id = seasonpro.id;
  pro.title = seasonpro.title;
  pro.detail = seasonpro.detail;
  if (seasonpro.sale_price != null && seasonpro.sale_price>0)
      pro.price = seasonpro.sale_price;
  else
  pro.price = seasonpro.price;
  pro.categories = seasonpro.categories;
  pro.week = seasonpro.week;
  pro.images = seasonpro.imageUrl;
  return pro;
}
