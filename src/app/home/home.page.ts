import {Component, OnInit, OnDestroy} from '@angular/core';
import {NavigationExtras} from '@angular/router';
import {AlertController, IonSlides, ModalController, NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {MyEventsService} from '../services/events/my-events.service';
import {UiElementsService} from '../services/common/ui-elements.service';
import {ApiService} from '../services/network/api.service';
import {ECommerceService, ExpressECommerceService} from '../services/common/ecommerce.service';
import {Subscription} from 'rxjs';
import {MyAddress} from 'src/models/address.models';
import {Helper} from 'src/models/helper.models';
import {Constants} from 'src/models/constants.models';
import {Category} from 'src/models/category.models';
import {Vendor} from 'src/models/vendor.models';
import {Product} from 'src/models/product.models';
import {InAppBrowser} from '@ionic-native/in-app-browser/ngx';
import {DeliverySlot} from 'src/models/delivery-slot.models';
import {HomeService} from './home.service';
import {VtPopupPage} from '../vt-popup/vt-popup.page';
import {TitlePage} from '../title/title.page';
import {User} from 'src/models/user.models';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
    location = 'home';
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
    regularDeliverySettings: DeliverySlot;
    list: Array<string>;
    list1: Array<string>;
    addressToShow: string;
    slideOpts = {
        slidesPerView: 1,
        initialSlide: 0,
        centeredSlides: true,
        autoplay: true,
        speed: 100,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    };
    userMe: User;
    feedback_slides = {
        slidesPerView: 1,
        autoplay: true,
    };

    // option = {
    //     pagination: {
    //         el: '.swiper-pagination',
    //         clickable: true,
    //         renderBullet: (index, className) => '<span class="' + className + '">' + '</span>',
    //         // renderBullet: (index, className) => '<span class="' + className + '">' + (index + 1) + '</span>',
    //     },
    //     autoplay: {
    //         speed:400,
    //         disableOnInteraction: false,
    //     },
    // };


    constructor(private navCtrl: NavController, private translate: TranslateService, private myEventsService: MyEventsService,
                private uiElementService: UiElementsService, public apiService: ApiService, private alertCtrl: AlertController,
                public eComService: ECommerceService, private inAppBrowser: InAppBrowser, private service: HomeService, private modalController: ModalController,
                public expressEComService: ExpressECommerceService) {
        this.list = this.service.getBannerList();
        // // this.list1 = this.service.getList();
        this.list1 = this.service.getList();
    }

    slidesDidLoad(slides: IonSlides): void {
        slides.startAutoplay();
    }

    getAddressToShow() {
        if (Helper.getLoggedInUser() == null)
            return 'Click here to set your address!'
        else
            this.selectedLocation = Helper.getAddressSelected();

        return MyAddress.getAddressToShow(this.selectedLocation);

    }

    ngOnInit() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.selectedLocation = Helper.getAddressSelected();
        //this.checkAndLoadBanners();


        this.regularDeliverySettings = Helper.getRegularPincode();

        if (Helper.getLoggedInUser() != null) {
            this.userMe = this.apiService.getUserMe();
            // if(this.userMe.email && this.userMe.email=='newuser@jeevamrut.in')    
            // this.presentModal();
        }

    }

    getLatestNews() {

        let defaultText = 'Experience a healthier and happier you. Home Delivery available. For any queries reach us at +91 95731 23971.';

        try {
            let pincodeText = '';
            let regularPincode = Helper.getRegularPincode();
            let expressPincode = Helper.getExpressPincode();

            if (regularPincode != null) {
                pincodeText = regularPincode.whatshappening;
            } else if (expressPincode != null) {
                pincodeText = expressPincode.whatshappening;
            }
            if (pincodeText == '')
                pincodeText = defaultText;
        } catch (e) {
            return defaultText;
        }
        return defaultText;
    }

    offers(banner: Category) {
        if (banner != null && banner.reference) {
            if (banner.reference.startsWith('http'))
                this.inAppBrowser.create(banner.reference, '_system');
            else
                this.navCtrl.navigateForward(banner.reference);
        }
    }

    ionViewDidEnter() {
        //console.log("selected address"+ this.selectedLocation);
        if (!this.once) {
            this.doRefresh();
        }
        this.once = true;
        this.getLatestNews();
        this.checkAndLoadBanners();
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
        // this.translate.get('loading').subscribe(value => {
        //     this.uiElementService.presentToast(value);
        // });

    }

    async presentModal() {
        const modal = await this.modalController.create({
            component: VtPopupPage,
        });
        return await modal.present();
    }


    pickLocation() {
        this.selectedLocation = undefined;
        this.myEventsService.setCustomEventData('nav:pick_location');
    }

    pickPincode() {
        this.myEventsService.setCustomEventData('nav:pick_pincode');
    }

    private checkAndLoadBanners() {

        this.subscriptions.push(this.apiService.getBanners(Constants.SCOPE_ECOMMERCE)
            .subscribe(res => this.banners = res, err => console.log('getBanners', err)));
    }

    private checkAndLoadCustomerFeedbacks() {
        this.subscriptions.push(this.apiService.getBanners(Constants.SCOPE_CUSTOMERFEEDBACKS)
            .subscribe(res => this.custfeedbacks = res, err => console.log('getBanners', err)));
    }


    cart() {
        this.navCtrl.navigateForward(['./my-cart']);
        // if (this.selectedLocation && this.selectedLocation.latitude && this.selectedLocation.longitude) {
        //   this.navCtrl.navigateForward(['./my-cart']);
        // } else {
        //   this.translate.get("select_location").subscribe(value => this.uiElementService.presentToast(value));
        // }
    }

    navProDetail(pro) {
        const navigationExtras: NavigationExtras = {queryParams: {product_id: pro.id}};
        this.navCtrl.navigateForward(['./product-info'], navigationExtras);
    }

    updateAddress() {
        // this.location.latitude = "17.4842285";
        // this.location.longitude = "78.3541741";
        this.translate.get(['address_creating', 'something_wrong']).subscribe(values => {
            this.uiElementService.presentLoading(values['address_creating']);
            this.subscriptions.push(this.apiService.addressUpdate(this.selectedLocation).subscribe(res => {
                this.uiElementService.dismissLoading();
                this.selectAddress(res);
            }, err => {
                console.log('addressAdd', err);
                this.uiElementService.dismissLoading();
                this.uiElementService.presentToast(values['something_wrong']);
            }));
        });
    }

    selectAddress(address: MyAddress) {
        Helper.setAddressSelected(address);
    }

    addProCart(pro: Product) {
        if (this.selectedLocation.address2 == null) {
            this.modalController.create({component: TitlePage, componentProps: {address: this.selectedLocation}}).then((modalElement) => {
                modalElement.onDidDismiss().then(data => {
                    if (data && data.data) {
                        this.selectedLocation = data.data;
                        this.updateAddress();
                    }
                });
                modalElement.present();
            })
        }
        const added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
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
        this.eComService.removeOrDecrementCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
    }

    quantityProCart(pro: Product) {
        //console.log("Prodcut");
        //console.log(this.eComService.getCartItemFromProduct(pro));

        return this.eComService.quantityCartItem(this.eComService.getCartItemFromFeatureProduct(pro));
    }

    shop() {
        this.navCtrl.navigateForward(['./tabs/regular']);
    }

    share() {
        let text = 'Sharing joy is double joy, hence sharing this site with you. *Jeevamrut* is a one stop for more than 500 Natural products and great selection, all available with home delivery. Android- *https://play.google.com/store/apps/details?id=com.ityme.app*, iOS-*https://www.jeevamrut.in*. Let us together become a healthy big family.'
        let image = 'https://admin.ityme.in/storage/1324/WhatsApp-Image-2021-10-13-at-4.48.29-PM.jpeg';
        let url = 'https://jeevamrut.in';
        let whatsappUrl = 'https://wa.me/?text=' + text + '&image=' + image + '&url=' + url;
        console.log(whatsappUrl);

        this.inAppBrowser.create(whatsappUrl, '_blank');
    }

    onClickSeasonal() {
        this.navCtrl.navigateForward(['./seasonal-items']);
    }

    navExpressCart() {
        this.navCtrl.navigateForward(['./my-express-cart']);
    }

}
