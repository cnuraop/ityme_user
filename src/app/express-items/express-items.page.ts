// tslint:disable:variable-name
import {Component, OnInit} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {MyAddress} from 'src/models/address.models';
import {Category} from 'src/models/category.models';
import {Constants} from 'src/models/constants.models';
import {DeliverySlot} from 'src/models/delivery-slot.models';
import {Helper} from 'src/models/helper.models';
import {Product} from 'src/models/product.models';
import {ExpressECommerceService} from '../services/common/ecommerce.service';
import {UiElementsService} from '../services/common/ui-elements.service';
import {ApiService} from '../services/network/api.service';
import {TitlePage} from '../title/title.page';

@Component({
    selector: 'app-express-items',
    templateUrl: './express-items.page.html',
    styleUrls: ['./express-items.page.scss'],
})
export class ExpressItemsPage implements OnInit {
    private once = false;
    private subscriptions = new Array<Subscription>();
    categories: Array<Category>;
    categoriesSub = new Array<Category>();
    category_id: number;
    parentcategory_id: number;
    subcategory_id: number;
    isLoading = true;
    private doneAll = false;
    private infiniteScrollEvent;
    private pageNo = 1;
    category: Category;
    currency_icon: string;
    selectedCategory: Category;
    products = new Array<Product>();
    expressDeliverySettings: DeliverySlot;
    location: MyAddress;
    currentDay = new Date().getDay();

    constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
                private uiElementService: UiElementsService, private apiService: ApiService,
                public eComService: ExpressECommerceService, private modalController: ModalController) {
        console.log('getCurrentNavigation', this.router.getCurrentNavigation().extras.state);
        this.category_id = this.router.getCurrentNavigation().extras.state.category_id;
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.expressDeliverySettings = Helper.getExpressPincode();
        this.location = Helper.getAddressSelected();
        if (!this.once) {
            if (this.router.getCurrentNavigation().extras.state) {
                this.categories = this.router.getCurrentNavigation().extras.state.categories;
                this.category_id = this.router.getCurrentNavigation().extras.state.category_id;
                this.parentcategory_id = this.router.getCurrentNavigation().extras.state.category_id;
                this.translate.get('loading').subscribe(value => {
                    this.uiElementService.presentLoading(value);
                    const promise = this.loadSubCategories(this.category_id);
                    promise.then(() => {
                        this.selectedCategory = this.categoriesSub[0];
                        this.subcategory_id = this.selectedCategory.id;
                        this.category_id = this.selectedCategory.id;
                        this.loadProducts(this.categoriesSub[0].id, this.pageNo); // OUTPUT Task will be done in 1 second
                    }, (error) => {
                        console.log(error);
                    });
                });
            }
        }
        this.once = true;
    }

    private RefreshCategories(category_id: number) {
        this.translate.get('loading').subscribe(value => {
            this.uiElementService.presentLoading(value);
            const promise = this.loadSubCategories(category_id);
            promise.then(() => {
                // console.log(value);
                this.selectedCategory = this.categoriesSub[0];
                this.subcategory_id = this.selectedCategory.id;
                this.loadProducts(this.categoriesSub[0].id, this.pageNo); // OUTPUT Task will be done in 1 second
            }, (error) => {
                console.log(error);
            });
        });
    }

    ionViewWillLeave() {
        for (const sub of this.subscriptions) sub.unsubscribe();
        this.uiElementService.dismissLoading();
    }

    segmentChanged(event) {
        this.products = [];
        this.category_id = event.detail.value;
        this.pageNo = 1;
        // this.translate.get("loading").subscribe(value => { console.log("value: "+ value);
        // this.uiElementService.presentLoading(value); this.loadProducts(this.category_id); });
    }

    getNextDayOfWeek(date, dayOfWeek) {
        // Code to check that date and dayOfWeek are valid left as an exercise ;)
        const resultDate = new Date(date.getTime());
        resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
        return resultDate;
    }

    loadSubCategories(category_id: number) {
        return new Promise((resolve, reject) => {
            this.subscriptions.push(this.apiService.getExpressCategoriesSub(category_id).subscribe(res => {
                console.log('load sub categories loading', category_id);
                this.categoriesSub = res;
                resolve(res);
                this.uiElementService.dismissLoading();
                this.isLoading = false;

            }, err => {
                console.log('getCategoriesSub', err);
                reject(err);
                this.uiElementService.dismissLoading();
                this.isLoading = false;
            }));
        });
    }

    loadProducts(category_id: number, pageNo: number) {

        this.subscriptions.push(this.apiService.getExpressProductsWithCategoryId(Constants.SCOPE_ECOMMERCE, category_id, pageNo).subscribe(res => {
            if (pageNo == 1) this.products = res.data;
            else
                this.products = this.products.concat(res.data);
            this.uiElementService.dismissLoading();
            this.doneAll = (!res.data || !res.data.length);
            if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
            this.isLoading = false;
            this.uiElementService.dismissLoading();
        }, err => {
            console.log('getExpressProductsWithCategoryId', err);
            this.uiElementService.dismissLoading();
            if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
            this.isLoading = false;
        }));
    }

    OnCategoryChange(event) {
        console.log(event.detail.value)
        this.category_id = event.detail.value;
        this.parentcategory_id = event.detail.value;
        this.pageNo = 1;
        this.RefreshCategories(event.detail.value);

    }

    doInfiniteProducts(event) {
        if (this.doneAll) {
            event.target.complete();
        } else {
            this.infiniteScrollEvent = event;
            this.pageNo = this.pageNo + 1;
            this.loadProducts(this.category_id, this.pageNo);
        }
    }

    updateAddress() {
        // this.location.latitude = "17.4842285";
        // this.location.longitude = "78.3541741";
        this.translate.get(['address_creating', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values.address_creating);
            this.subscriptions.push(this.apiService.addressUpdate(this.location).subscribe(res => {
                this.uiElementService.dismissLoading();
                this.selectAddress(res);
            }, err => {
                console.log('addressAdd', err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values.something_wrong);
            }));
        });
    }

    selectAddress(address: MyAddress) {
        Helper.setAddressSelected(address);
    }

    addProCart(pro: Product) {
        if (this.location.address2 == null) {
            this.modalController.create({component: TitlePage, componentProps: {address: this.location}}).then((modalElement) => {
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
            // Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
            this.uiElementService.alertCartConflict().then(res => {
                if (res) {
                    this.eComService.clearCart();
                    this.addProCart(pro);
                }
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
        this.navCtrl.navigateForward(['./my-express-cart']);
    }

    navProDetail(pro) {
        const navigationExtras: NavigationExtras = {queryParams: {product_id: pro.id}};
        this.navCtrl.navigateForward(['./product-info'], navigationExtras);
    }

    toggleFavorite(product) {
        if (Helper.getLoggedInUser() != null) {
            this.translate.get('just_moment').subscribe(value => {
                this.uiElementService.presentLoading(value);
                this.subscriptions.push(this.apiService.toggleFavoriteProduct(product.id).subscribe(res => {
                    product.is_favourite = !product.is_favourite;
                    this.uiElementService.dismissLoading();
                }, err => {
                    console.log('toggleProductFavorite', err);
                    this.uiElementService.dismissLoading();
                }));
            });
        } else {
            this.alertLogin();
        }
    }

    alertLogin() {
        this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
        this.navCtrl.navigateForward(['./sign-in']);
    }

}
