import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, IonSlides, ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { MyEventsService } from '../services/events/my-events.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { Subscription } from 'rxjs';
import { MyAddress } from 'src/models/address.models';
import { Helper } from 'src/models/helper.models';
import { Constants } from 'src/models/constants.models';
import { Category } from 'src/models/category.models';
import { Vendor } from 'src/models/vendor.models';
import { Product } from 'src/models/product.models';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { TitlePage } from '../title/title.page';

@Component({
    selector: 'app-regular-shop',
    templateUrl: './regular-shop.page.html',
    styleUrls: ['./regular-shop.page.scss']
})
export class RegularShopPage implements OnInit {
    location = 'home';
    private subscriptions = new Array<Subscription>();
    private once = false;
    featured = new Array<Product>();
    selectedLocation: MyAddress;
    vendorsArray = new Array<{ vendors: Array<Vendor>; }>();
    categories: Array<Category>;
    healthcategories:Array<Category>;
    banners: Array<Category>;
    custfeedbacks: Array<Category>;
    cartCount: number;
    pageNo: number;
    private isLoading = false;
    private loadedCount = 0;
    currency_icon: string;
    regularDeliverySettings: DeliverySlot;
    orderCutOffMessage: string;
    immediateCall: boolean;
    showTimer = false;
    slideOpts = {
        slidesPerView: 1,
        initialSlide: 0,
        centeredSlides: true,
        autoplay:true,
        speed:400,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    };

    constructor(private navCtrl: NavController, private translate: TranslateService, private myEventsService: MyEventsService,
        private uiElementService: UiElementsService, public apiService: ApiService, private alertCtrl: AlertController,
        public eComService: ECommerceService,
        private inAppBrowser: InAppBrowser,
        private modalController: ModalController) { }

    getAddressToShow() {

        if (Helper.getLoggedInUser() == null)
            return "Click here to set your address!"
        else
          this.selectedLocation = Helper.getAddressSelected();

        return MyAddress.getAddressToShow(this.selectedLocation);
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting("currency_icon");
        this.selectedLocation = Helper.getAddressSelected();
        this.regularDeliverySettings = Helper.getRegularPincode();

        this.subscriptions.push(this.myEventsService.getAddressObservable().subscribe(selectedLocationNew => {
            const changed: boolean = !this.selectedLocation || !selectedLocationNew ||
                (this.selectedLocation.latitude != selectedLocationNew.latitude ||
                    this.selectedLocation.longitude != selectedLocationNew.longitude);
            this.selectedLocation = selectedLocationNew;
            if (changed) {
                this.doRefresh();
            }
        }));
    }

    ionViewDidEnter() {
        this.doRefresh();        
        this.initializeClock('clockdiv', this.regularDeliverySettings.order_end_date, this.regularDeliverySettings.order_end_time);
        this.getLatestNews();
    }
    CalculateHours() {
        console.log(this.regularDeliverySettings.order_end_date);
        let dt = new Date(this.regularDeliverySettings.order_end_date);
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setHours(this.regularDeliverySettings.order_end_time);
        let currentDate = new Date();
        //let diff =  Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) ) /(1000 * 60 * 60 * 24));
        let differenceInTime = dt.getTime() - currentDate.getTime();
        let differenceInHours = Math.floor(differenceInTime / (1000 * 3600));
        // To calculate the no. of days between two dates
        let differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        if (differenceInDays <= 1) {
            this.orderCutOffMessage = differenceInHours + " hours";
            this.immediateCall = true;
        }
        else {
            this.orderCutOffMessage = differenceInHours + " hours";
            this.immediateCall = false;
        }
    }

    initializeClock(id, endDate, endTime) {
        this.showTimer = true;
        let timeinterval;
        let clock = document.getElementById(id);
        let daysSpan = clock.querySelector('.days');
        let hoursSpan = clock.querySelector('.hours');
        let minutesSpan = clock.querySelector('.minutes');
        let secondsSpan = clock.querySelector('.seconds');

        function updateClock() {
            let t = getTimeRemaining(endDate, endTime);

            daysSpan.innerHTML = "" + t.days;
            hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
            minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
            secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

            if (t.total <= 0) {
                clearInterval(timeinterval);
                document.getElementById(id).style.display = "none";
            }
        }
        function getTimeRemaining(endDate, endTime) {
            let dt = new Date(endDate);
            dt.setHours(0);
            dt.setMinutes(0);
            dt.setHours(endTime);
            let currentDate = new Date();
            let t = dt.getTime() - currentDate.getTime();

            // var t = Date.parse(endtime) - Date.parse(new Date());
            let seconds = Math.floor((t / 1000) % 60);
            let minutes = Math.floor((t / 1000 / 60) % 60);
            let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            let days = Math.floor(t / (1000 * 60 * 60 * 24));
            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        updateClock();
        timeinterval = setInterval(updateClock, 1000);
    }

    slidesDidLoad(slides: IonSlides): void {
        slides.startAutoplay();
      }

    ionViewWillLeave() {
        this.uiElementService.dismissLoading();
        for (const sub of this.subscriptions) sub.unsubscribe();
    }

    
    private doRefresh() {
        this.pageNo = 1;
        this.vendorsArray = [];
        this.banners = [];
        this.custfeedbacks = [];
        this.loadedCount = 0;
        this.selectedLocation = Helper.getAddressSelected();
        this.translate.get('loading').subscribe(value => {
            // this.uiElementService.presentToast(value);
            this.loadCategories();
            this.loadHealthCategories();
        });

    }


    pickLocation() {
        this.selectedLocation = undefined;
        this.myEventsService.setCustomEventData('nav:pick_location');
    }

    pickPincode() {
        this.myEventsService.setCustomEventData('nav:pick_pincode');
    }

    loadCategories() {
        this.subscriptions.push(this.apiService.getCategoriesParents(Constants.SCOPE_ECOMMERCE).subscribe(res => {
            this.categories = res;
        }, err => {
            //console.log('getCategoriesParents', err);
            this.isLoading = false;
            this.uiElementService.dismissLoading();
        }));
    }
    loadHealthCategories()
    {
        this.subscriptions.push(this.apiService.getHealthCategoriesParents(Constants.SCOPE_ECOMMERCE).subscribe(res => {
            this.healthcategories = res;
            
            if (this.selectedLocation && this.selectedLocation.pincode) {
                this.loadProductsByCatId();
            } else {
                this.isLoading = false;
                this.uiElementService.dismissLoading();
            }
        }, err => {
            //console.log('getCategoriesParents', err);
            this.isLoading = false;
            this.uiElementService.dismissLoading();
        }));
    }

    loadProductsByCatId() {
        this.isLoading = true;
        this.subscriptions.push(this.apiService.getCategoriesVendors(this.selectedLocation).subscribe((res: any) => {
            if (res.data && res.data.length) this.vendorsArray.push({ vendors: res.data });
            //console.log(this.vendorsArray)
            this.isLoading = false;
            this.uiElementService.dismissLoading();
            this.checkAndLoadBanners();
            this.getfeatured();
        }, err => {
            //console.log('getProductsWithCategoryId', err);
            this.isLoading = false;
            this.uiElementService.dismissLoading();
            this.checkAndLoadBanners();
            this.getfeatured();
        }));
    }


    private checkAndLoadBanners() {
        // this.loadedCount += 1;
        if (!this.haveNothingToShow())
            this.subscriptions.push(this.apiService.getBanners(Constants.SCOPE_ECOMMERCE)
                .subscribe(res => this.banners = res, err => console.log('getBanners', err)));
    }

    private checkAndLoadCustomerFeedbacks() {
        if (!this.haveNothingToShow())
            this.subscriptions.push(this.apiService.getBanners(Constants.SCOPE_CUSTOMERFEEDBACKS)
                .subscribe(res => this.custfeedbacks = res, err => console.log('getBanners', err)));
    }

    haveNothingToShow(): boolean {
        let toReturn = true;
        if (this.vendorsArray) {
            for (const catPros of this.vendorsArray) {
                if (catPros && catPros.vendors.length) {
                    toReturn = false;
                    break;
                }
            }
        }
        return this.isLoading ? false : toReturn;
    }


    subCategories(cat: Category) {
        if (this.selectedLocation) {
            let navigationExtras: NavigationExtras = { state: { categories: this.categories, category_id: cat.id } };
            this.navCtrl.navigateForward(['./categories'], navigationExtras);
        } else {
            this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    expressSubCategories(cat: Category) {
        if (this.selectedLocation) {
            let navigationExtras: NavigationExtras = { state: { categories: this.categories, category_id: cat.id } };
            this.navCtrl.navigateForward(['./items'], navigationExtras);
        } else {
            this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    viewAllSubCategories() {
        if (this.selectedLocation && this.selectedLocation.pincode) {
            let navigationExtras: NavigationExtras = { state: { categories: this.categories, category_id: this.categories[0].id } };
            this.navCtrl.navigateForward(['./items'], navigationExtras);
        } else {
            this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    navVenDetail(vendor: Vendor) {
        if (this.selectedLocation && this.selectedLocation.pincode) {
            const navigationExtras: NavigationExtras = { queryParams: { vendor_id: vendor.id } };
            this.navCtrl.navigateForward(['./seller-profile'], navigationExtras);
        } else {
            this.translate.get('select_location').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    FindHealthProducts(cat: Category)
    {
        const navigationExtras: NavigationExtras = { state: { category: cat } };
        this.navCtrl.navigateForward(['./product-list'], navigationExtras);
    }

    offers(banner: Category) {
        if (banner != null && banner.reference) {
            if (banner.reference.startsWith("http"))
                this.inAppBrowser.create(banner.reference, "_system");
            else
                this.navCtrl.navigateForward(banner.reference);
        }
    }

    cart() {
        this.navCtrl.navigateForward(['./my-cart']);
        // if (this.selectedLocation && this.selectedLocation.pincode) {
        //   this.navCtrl.navigateForward(['./my-cart']);
        // } else {
        //   this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        // }
    }

    navSearch() {
        if (this.selectedLocation && this.selectedLocation.pincode) {
            let navigationExtras: NavigationExtras = { state: { express: false } };
          this.navCtrl.navigateForward(['./search-products'], navigationExtras);
        } else {
            this.translate.get('select_location').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    getfeatured() {
        this.subscriptions.push(this.apiService.getFeaturedProducts().subscribe((res: any) =>
            this.featured = res.data)
        );
    }

    navProDetail(pro,event) {
        const navigationExtras: NavigationExtras = { queryParams: { product_id: pro.id } };
        this.navCtrl.navigateForward(['./product-info'], navigationExtras);
        event.stopPropagation();
    }

    updateAddress() {
        // this.location.latitude = "17.4842285";
        // this.location.longitude = "78.3541741";
        this.translate.get(["address_creating", "something_wrong"]).subscribe(values => {
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
    
      addProCart(pro: Product,event) {
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
        // if (pro.sale_price != null && pro.sale_price>0)
        //     pro.price = pro.sale_price;
        const added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
        if (added === -1) {
            //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
            this.uiElementService.alertCartConflict().then(res => {
                if (res) { this.eComService.clearCart(); this.addProCart(pro,event); }
            });
        }
        event.stopPropagation();
    }

    removeProCart(pro: Product,event) {
        this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
        event.stopPropagation();
    }

    quantityProCart(pro: Product) {
        //console.log("Prodcut");
        //console.log(this.eComService.getCartItemFromProduct(pro));

        return this.eComService.quantityCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
    }

    share() {
        this.inAppBrowser.create("https://api.whatsapp.com/send?text=Sharing joy is double joy, hence sharing this site with you. Jeevamrut is a one stop for more than 500 Natural products and great selection, all available with home delivery. Android- https://play.google.com/store/apps/details?id=com.ityme.app, iOS-https://www.jeevamrut.in. Let us together become a healthy big family.", "_system");

    }
    wishlist() {
        if (this.apiService.getUserMe() != null) {
            this.navCtrl.navigateForward(['./saved-items']);
        } else {
            this.alertLogin();
        }
    }
    alertLogin() {
        this.translate.get("alert_login_short").subscribe(value => this.uiElementService.presentToast(value));
        this.navCtrl.navigateForward(['./sign-in']);
    }

    navExpressShop() {
        this.navCtrl.navigateForward(['./items']);
    }

    logout() {
        this.translate.get(["logout_title", "logout_message", "no", "yes"]).subscribe(values => {
            this.alertCtrl.create({
                header: values["logout_title"],
                message: values["logout_message"],
                buttons: [{
                    text: values["no"],
                    handler: () => { }
                }, {
                    text: values["yes"],
                    handler: () => {
                        //This is required as user is logged out and cart is user based
                        this.eComService.clearCart();
                        Helper.setLoggedInUserResponse(null);
                        this.myEventsService.setUserMeData(null);
                        this.myEventsService.setAddressData(null);
                    }
                }]
            }).then(alert => alert.present());
        });
    }
    toggleFavorite(product,event) {
        if (Helper.getLoggedInUser() != null) {
            this.translate.get("just_moment").subscribe(value => {
                this.uiElementService.presentLoading(value);
                this.subscriptions.push(this.apiService.toggleFavoriteProduct(product.id).subscribe(res => {
                    product.is_favourite = !product.is_favourite;
                    this.uiElementService.dismissLoading();
                }, err => {
                    console.log("toggleProductFavorite", err);
                    this.uiElementService.dismissLoading();
                }));
            });
        } else {
            this.alertLogin();
        }
        event.stopPropagation();
    }
    getLatestNews() {

        let defaultText = "Check out the Ugadi Special Basket. You can also gift to your friends. Experience a healthier and happier you. Home Delivery available. For any queries reach us at +91 95731 23971.";

        try {
            let pincodeText='';
            let regularPincode = Helper.getRegularPincode();

            if (regularPincode != null) {
                pincodeText= regularPincode.whatshappening;
            }
            if(pincodeText=='')
            pincodeText=defaultText;
        }
        catch (e) {
            return defaultText;
        }
        return defaultText;
    }
    onClickSeasonal() {
        this.navCtrl.navigateForward(['./seasonal-items']);
    }


}

