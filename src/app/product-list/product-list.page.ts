import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Category } from 'src/models/category.models';
import { ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Subscription } from 'rxjs';
import { Product } from 'src/models/product.models';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Constants } from 'src/models/constants.models';
import { TitlePage } from '../title/title.page';
import { MyAddress } from 'src/models/address.models';
import { Helper } from 'src/models/helper.models';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss']
})
export class ProductListPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  private doneAll = false;
  private infiniteScrollEvent;
  private pageNo = 1;
  category: Category;
  products = new Array<Product>();
  isLoading = true;
  location: MyAddress;
  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService, public eComService: ECommerceService,private modalController: ModalController) {
   // console.log('getCurrentNavigation', this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.category = this.router.getCurrentNavigation().extras.state.category;
    }
    // if (this.category != null) {
    this.translate.get('loading').subscribe(value => {      
      this.isLoading = true;    
      this.uiElementService.presentLoading(value);
      this.loadProducts();
    });
    // }
  }

  ngOnInit() {
    this.location = Helper.getAddressSelected();
  }
  

  ionViewWillLeave() {
    //console.log("There it is");
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  loadProducts() {

    this.subscriptions.push(this.apiService.getProductsWithHealthCategoryId(Constants.SCOPE_ECOMMERCE, this.category ? this.category.id : null, this.pageNo).subscribe(res => {
      this.products = this.products.concat(res.data);
      //console.log(this.products);
      this.uiElementService.dismissLoading();
      this.doneAll = (!res.data || !res.data.length);
      if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
      this.isLoading = false;
      this.uiElementService.dismissLoading();
    }, err => {
      console.log('getProductsWithCategoryId', err);
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
      this.loadProducts();
    }
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
    const added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
    if (added === -1) {
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

  navProDetail(pro) {
    const navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
    this.navCtrl.navigateForward(['./product-info'], navigationExtras);
  }

}
