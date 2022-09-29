import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, IonSlides, ModalController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { MyEventsService } from '../services/events/my-events.service';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { ECommerceService, ExpressECommerceService } from '../services/common/ecommerce.service';
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
    selector: 'app-express-shop',
    templateUrl: './express-shop.page.html',
    styleUrls: ['./express-shop.page.scss']
})
export class ExpressShopPage implements OnInit {
    location :MyAddress;
    private subscriptions = new Array<Subscription>();
    private once = false;
    featured = new Array<Product>();
    selectedLocation: MyAddress;
    vendorsArray = new Array<{ vendors: Array<Vendor>; }>();
    categories: Array<Category>;
    banners: Array<Category>;
    custfeedbacks: Array<Category>;
    cartCount: number;
    pageNo: number;
    private isLoading = false;
    private loadedCount = 0;
    currency_icon: string;
    expressDeliverySettings: DeliverySlot;
    orderCutOffMessage: string;
    immediateCall: boolean;
    slideOpts = {
        slidesPerView: 1,
        initialSlide: 0,
        centeredSlides: true,
        autoplay:true,
        speed:100,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    };

    constructor(private navCtrl: NavController, private translate: TranslateService, private myEventsService: MyEventsService,
        private uiElementService: UiElementsService, public apiService: ApiService, private alertCtrl: AlertController,
        public expressEComService: ExpressECommerceService,private modalController: ModalController,
        private inAppBrowser: InAppBrowser) { }

    getAddressToShow() {

        if (Helper.getLoggedInUser() == null)
            return "Click here to set your address!"
        else
            this.selectedLocation = Helper.getAddressSelected();

        // return MyAddress.getAddressToShow(this.selectedLocation).substring(0, 260) + "..";
        return MyAddress.getAddressToShow(this.selectedLocation);
    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting("currency_icon");
        this.selectedLocation = Helper.getAddressSelected();
        //console.log("pincode"+this.selectedLocation.pincode);

        this.expressDeliverySettings = Helper.getExpressPincode();
//this.expressDeliverySettings=Helper.getRegularPincode();

        this.subscriptions.push(this.myEventsService.getAddressObservable().subscribe(selectedLocationNew => {
            const changed: boolean = !this.selectedLocation || !selectedLocationNew ||
                (this.selectedLocation.latitude != selectedLocationNew.latitude ||
                    this.selectedLocation.longitude != selectedLocationNew.longitude);
            this.selectedLocation = selectedLocationNew;
            if (changed) {
                this.doRefresh();
            }
        }));

        // const slides = document.querySelector('ion-slides');
        // // Optional parameters to pass to the swiper instance.
        // // See http://idangero.us/swiper/api/ for valid options.
        // slides.options = {
        //     initialSlide: 1,
        //     speed: 400
        // }

    }

    ionViewDidEnter() {
        this.doRefresh();
        // this.CalculateHours();
        //temporary commenting until daily delivery is sorted by business
        //this.initializeClock('clockdivExpress', this.expressDeliverySettings.order_end_date, this.expressDeliverySettings.order_end_time);
        this.getLatestNews();
    }

    ionViewWillLeave() {
        this.uiElementService.dismissLoading();
        for (const sub of this.subscriptions) sub.unsubscribe();
    }

    slidesDidLoad(slides: IonSlides): void {
        slides.startAutoplay();
      }

    private doRefresh() {
        this.pageNo = 1;
        this.vendorsArray = [];
        this.banners = [];
        this.custfeedbacks = [];
        this.loadedCount = 0;
        this.selectedLocation = Helper.getAddressSelected();
        this.expressDeliverySettings = Helper.getExpressPincode();
        //this.expressDeliverySettings = Helper.getRegularPincode();
        console.log("Express" + this.expressDeliverySettings.pincode);
        this.translate.get('loading').subscribe(value => {
            //this.uiElementService.presentToast(value);
            this.loadCategories();
        });

    }

    shop() {
        this.navCtrl.navigateForward(['./tabs/regular']);
    }


    pickLocation() {
        this.selectedLocation = undefined;
        this.myEventsService.setCustomEventData('nav:pick_location');
    }

    pickPincode() {
        this.myEventsService.setCustomEventData('nav:pick_pincode');
    }

    loadCategories() {
        this.subscriptions.push(this.apiService.getExpressCategoriesParents(Constants.SCOPE_ECOMMERCE).subscribe(res => {
            this.categories = res;

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
            this.subscriptions.push(this.apiService.getBanners("services")
                .subscribe(res => this.banners = res, err => console.log('getBanners', err)));
    }

    offers(banner: Category) {
        if (banner != null && banner.reference) {
            if (banner.reference.startsWith("http"))
                this.inAppBrowser.create(banner.reference, "_system");
            else
                this.navCtrl.navigateForward(banner.reference);
        }
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
            this.navCtrl.navigateForward(['./express-items'], navigationExtras);
        } else {
            this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    viewAllSubCategories() {
        if (this.selectedLocation) {
            let navigationExtras: NavigationExtras = { state: { categories: this.categories, category_id: this.categories[0].id } };
            this.navCtrl.navigateForward(['./express-items'], navigationExtras);
        } else {
            this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    navVenDetail(vendor: Vendor) {
        if (this.selectedLocation) {
            const navigationExtras: NavigationExtras = { queryParams: { vendor_id: vendor.id } };
            this.navCtrl.navigateForward(['./seller-profile'], navigationExtras);
        } else {
            this.translate.get('select_location').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    cart() {
        this.navCtrl.navigateForward(['./my-express-cart']);
        // if (this.selectedLocation && this.selectedLocation.latitude && this.selectedLocation.longitude) {
        //   this.navCtrl.navigateForward(['./my-cart']);
        // } else {
        //   this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        // }
    }

    navSearch() {
        if (this.selectedLocation && this.selectedLocation.pincode) {
            let navigationExtras: NavigationExtras = { state: { express: true } };
          this.navCtrl.navigateForward(['./search-products'], navigationExtras);
        } else {
            this.translate.get('select_location').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    getfeatured() {
        this.subscriptions.push(this.apiService.getExpressFeaturedProducts().subscribe((res: any) =>
            this.featured = res.data)
        );
    }

    navProDetail(pro, event) {
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
        if (this.selectedLocation.address2 == null) {
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
        // if (pro.sale_price != null && pro.sale_price > 0)
        //     pro.price = pro.sale_price;
        const added = this.expressEComService.addOrIncrementCartItem(this.expressEComService.getCartItemFromFeatureProduct(pro));
        if (added === -1) {
            //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
            this.uiElementService.alertCartConflict().then(res => {
                if (res) { this.expressEComService.clearCart(); this.addProCart(pro, event); }
            });
        }
        event.stopPropagation();
    }

    removeProCart(pro: Product, event) {
        this.expressEComService.removeOrDecrementCartItem(this.expressEComService.getCartItemFromFeatureProduct(pro));
        event.stopPropagation();
    }

    quantityProCart(pro: Product) {
        //console.log("Prodcut");
        //console.log(this.expressEComService.getCartItemFromProduct(pro));

        return this.expressEComService.quantityCartItem(this.expressEComService.getCartItemFromFeatureProduct(pro));
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
                        this.expressEComService.clearCart();
                        Helper.setLoggedInUserResponse(null);
                        this.myEventsService.setUserMeData(null);
                        this.myEventsService.setAddressData(null);
                    }
                }]
            }).then(alert => alert.present());
        });
    }
    toggleFavorite(product, event) {
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

    CalculateHours() {
        let dt = new Date(this.expressDeliverySettings.order_end_date);
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setHours(this.expressDeliverySettings.order_end_time);
        let currentDate = new Date();
        //let diff =  Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) ) /(1000 * 60 * 60 * 24));
        let differenceInTime = dt.getTime() - currentDate.getTime();
        let differenceInHours = Math.floor(differenceInTime / (1000 * 3600));
        // To calculate the no. of days between two dates
        // let differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));

        this.orderCutOffMessage = differenceInHours + " hours";
        this.immediateCall = true;
    }
    initializeClock(id, endDate, endTime) {
        let timeinterval;
        let clock = document.getElementById(id);
        // let daysSpan = clock.querySelector('.days');
        let hoursSpan = clock.querySelector('.hours');
        let minutesSpan = clock.querySelector('.minutes');
        let secondsSpan = clock.querySelector('.seconds');

        function updateClock() {
            let t = getTimeRemaining(endDate, endTime);

            // daysSpan.innerHTML = "" + t.days;
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
                // 'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        updateClock();
        timeinterval = setInterval(updateClock, 1000);
    }

    getLatestNews() {

        let defaultText = "For Fresh Vegetables & Fruits, please check out our Bi-weekly Mandi";

        try {
            let pincodeText='';
            let expressPincode = Helper.getExpressPincode();

            if (expressPincode != null) {
                pincodeText= expressPincode.whatshappening;
            }
            if(pincodeText=='')
            pincodeText=defaultText;
        }
        catch (e) {
            return defaultText;
        }
        return defaultText;
    }

}
