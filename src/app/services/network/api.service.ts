import {Injectable, Inject} from '@angular/core';
import {APP_CONFIG, AppConfig} from 'src/app/app.config';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {Country} from 'src/models/country.models';
import {AuthResponse} from 'src/models/auth-response.models';
import {SocialLoginRequest} from 'src/models/sociallogin-request.models';
import {SignUpRequest} from 'src/models/auth-signup-request.models';
import {MyMeta} from 'src/models/meta.models';
import {MyAddress} from 'src/models/address.models';
import {MyPincode} from 'src/models/pincode.models';
import {BaseListResponse} from 'src/models/base-list.models';
import {Helper} from 'src/models/helper.models';
import {Rating} from 'src/models/rating.models';
import {RatingSummary} from 'src/models/rating-summary.models';
import {PaymentMethod, RazorPayment} from 'src/models/payment-method.models';
import {SupportRequest} from 'src/models/support-request.models';
import {User} from 'src/models/user.models';
import {RateRequest} from 'src/models/rate-request.models';
import {Category} from 'src/models/category.models';
import {Product} from 'src/models/product.models';
import {OrderRequest} from 'src/models/order-request.models';
import {Coupon} from 'src/models/coupon.models';
import {Order, OrderObject, PaymentOrder} from 'src/models/order.models';
import {Doctor, AvailabilityDateTime} from 'src/models/doctor.models';
import {Review} from 'src/models/review.models';
import {Faq} from 'src/models/faq.models';
import {Hospital} from 'src/models/hospital.models';
import {Appointment} from 'src/models/appointment.models';
import {Vendor} from 'src/models/vendor.models';
import {WalletTransaction} from 'src/models/wallet-transaction.models';
import * as moment from 'moment';
import {DoctorSchedule} from 'src/models/doctor-schedule.models';
import {OrderPayment} from 'src/models/order-payment.models';
import {MembershipModel, MembershipObject} from 'src/models/membership-plan.models';
import {DeliverySlot, DeliverySlotListResponse} from 'src/models/delivery-slot.models';
import {PartialWalletPayment} from 'src/models/payout-request.models';
import {SeasonalProduct} from 'src/models/seasonal-product.models';
import {OrderRequestNew} from '../../../models/order-request-updated.models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private myHeaders: HttpHeaders;

    private currency_icon: string;
    private locale: string;
    private reviewedIds = new Array<string>();
    private myLocation: MyAddress;
    private distance_metric = 'km';
    private userMe: User;
    private uuid = 'xxx';
    private platform = 'android';

    constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {
    }

    reloadSetting() {
        this.currency_icon = Helper.getSetting('currency_icon');
        this.locale = Helper.getSetting('locale');
    }

    setUserMe(user: User) {
        this.userMe = user;
    }

    getUserMe(): User {
        return this.userMe;
    }

    reloadItemsReviewed() {
        this.reviewedIds = Helper.getReviewedProductIds();
    }

    setupHeaders(authToken?: string) {
        const tokenToUse = authToken ? authToken : Helper.getToken();
        const savedLanguageCode = Helper.getLanguageDefault();
        this.myHeaders = tokenToUse ? new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: ('Bearer ' + tokenToUse),
            'X-Localization': String(savedLanguageCode ? savedLanguageCode : this.config.availableLanguages[0].code),
            'X-Device-Id': this.uuid ? this.uuid : 'xxx',
            'X-Device-Type': this.platform ? this.platform : 'android'
        }) : new HttpHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Localization': String(savedLanguageCode ? savedLanguageCode : this.config.availableLanguages[0].code),
            'X-Device-Id': this.uuid ? this.uuid : 'xxx',
            'X-Device-Type': this.platform ? this.platform : 'android'
        });
    }

    setUuidAndPlatform(uuid: string, platform: string) {
        this.uuid = uuid;
        this.platform = platform ? String(platform).toLowerCase() : platform;
        this.setupHeaders();
    }

    public getCountries(): Observable<Array<Country>> {
        return this.http.get<Array<Country>>('./assets/json/countries.json').pipe(
            tap(data => {
                const indiaIndex = -1;
                // if (data) {
                //   for (let i = 0; i < data.length; i++) {
                //     if (data[i].name == "India") {
                //       indiaIndex = i;
                //       break;
                //     }
                //   }
                // }
                if (indiaIndex != -1) data.unshift(data.splice(indiaIndex, 1)[0]);
            }),
            catchError(this.handleError<Array<Country>>('getCountries', []))
        );
    }

    public postNotification(roleTo: string, userIdTo: string): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/user/push-notification', {
            role: roleTo,
            user_id: userIdTo
        }, {headers: this.myHeaders});
    }

    public getURL(url: string): Observable<any> {
        return this.http.get<any>(url, {headers: this.myHeaders});
    }

    public postURL(url: string): Observable<any> {
        return this.http.post<any>(url, {}, {headers: this.myHeaders});
    }

    // public getContactLink(): Observable<{ link: string }> {
    //     return this.http.get<{ link: string }>('https://dashboard.vtlabs.dev/whatsapp.php?product_name=doctorworld&source=application', {headers: this.myHeaders});
    // }

    public getSettings(): Observable<Array<MyMeta>> {
        return this.http.get<Array<MyMeta>>(this.config.apiBase + 'api/settings', {headers: this.myHeaders});
    }

    public refreshSettings(): Observable<Array<MyMeta>> {
        return this.http.get<Array<MyMeta>>(this.config.apiBase + 'api/user/refreshsettings', {headers: this.myHeaders});
    }


    public getFaqs(): Observable<Array<Faq>> {
        return this.http.get<Array<Faq>>(this.config.apiBase + 'api/faq', {headers: this.myHeaders});
    }

    public submitSupport(supportRequest: SupportRequest): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + 'api/support', supportRequest, {headers: this.myHeaders});
    }

    public checkUser(checkUserRequest: any): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + 'api/check-user', checkUserRequest, {headers: this.myHeaders});
    }

    public loginSocial(socialLoginRequest: SocialLoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + 'api/social/login', socialLoginRequest, {headers: this.myHeaders}).pipe(tap(data => this.setupUserMe(data.user)));
    }

    public loginUser(loginTokenRequest: { token: string, role: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + 'api/login', loginTokenRequest, {headers: this.myHeaders}).pipe(tap(data => this.setupUserMe(data.user)));
    }

    public loginUser2(loginTokenRequest: { token: string, role: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + 'api/directlogin', loginTokenRequest, {headers: this.myHeaders}).pipe(tap(data => this.setupUserMe(data.user)));
    }

    public createUser(signUpRequest: SignUpRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.config.apiBase + 'api/register', signUpRequest, {headers: this.myHeaders}).pipe(tap(data => this.setupUserMe(data.user)));
    }

    public updateUser(updateRequest: any): Observable<User> {
        return this.http.put<User>(this.config.apiBase + 'api/user', updateRequest, {headers: this.myHeaders}).pipe(tap(data => this.setupUserMe(data)));
    }

    public getCoupons(): Observable<Array<Coupon>> {
        return this.http.get<Array<Coupon>>(this.config.apiBase + 'api/coupons', {headers: this.myHeaders});
    }

    public getMembershipPlans(): Observable<Array<MembershipModel>> {
        return this.http.get<Array<MembershipModel>>(this.config.apiBase + 'api/membershipplans', {headers: this.myHeaders});
    }

    public checkSubscription(): Observable<MembershipModel> {
        return this.http.get<MembershipModel>(this.config.apiBase + 'api/membershipplans/retrieve-subscription', {headers: this.myHeaders});
    }

    public IsSubscribed(): Observable<any> {

        return this.http.get<any>(this.config.apiBase + 'api/membershipplans/check-validity', {headers: this.myHeaders});
    }

    public AddMembershipPlanUser(membershipplan: any): Observable<MembershipObject> {
        return this.http.post<MembershipObject>(this.config.apiBase + 'api/subscribenow', membershipplan, {headers: this.myHeaders});
    }

    public postNotificationContent(roleTo: string, userIdTo: string, title: string, body: string): Observable<any> {
        const urlParams = new URLSearchParams();
        urlParams.append('message_title', title);
        urlParams.append('message_body', body);
        return this.http.post<any>(this.config.apiBase + 'api/user/push-notification?' + urlParams.toString(), {
            role: roleTo,
            user_id: userIdTo
        }, {headers: this.myHeaders});
    }

    public getBanners(scope?: string): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('parent', '1');
        if (scope != null) urlParams.append('scope', scope);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/banners?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
        );
    }

    public getProductsWithQuery(query: string, page?: number, location?: MyAddress): Observable<BaseListResponse> {
        this.reloadSetting();
        const urlParams = new URLSearchParams();
        urlParams.append('search', query);
        if (page) urlParams.append('page', String(page));
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/products?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getExpressProductsWithQuery(query: string, page?: number, location?: MyAddress): Observable<BaseListResponse> {
        this.reloadSetting();
        const urlParams = new URLSearchParams();
        urlParams.append('search', query);
        if (page) urlParams.append('page', String(page));
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/expressproducts?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getHospitalsWithQuery(query: string, page?: number, location?: MyAddress): Observable<Array<Hospital>> {
        const urlParams = new URLSearchParams();
        urlParams.append('name', query);
        if (page) urlParams.append('page', String(page));
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<Array<Hospital>>(this.config.apiBase + 'api/doctor/hospitals?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data && data.length) for (const pro of data) this.setupHospital(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getHospitals(location: MyAddress, pageNo: number): Observable<Array<Hospital>> {
        const urlParams = new URLSearchParams();
        if (pageNo) urlParams.append('page', String(pageNo));
        if (location) {
            urlParams.append('lat', String(location.latitude));
            urlParams.append('long', String(location.longitude));
        }
        return this.http.get<Array<Hospital>>(this.config.apiBase + 'api/doctor/hospitals?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const hos of data) this.setupHospital(hos);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestDoctors()))
        );
    }

    public getDoctorsWithHospitalId(hospitalId: number, page?: number): Observable<BaseListResponse> {
        this.myLocation = Helper.getAddressSelected();
        const urlParams = new URLSearchParams();
        urlParams.append('hospital', String(hospitalId));
        if (page) urlParams.append('page', String(page));
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/doctor/profile/list?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data) this.setupDoctorRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const doc of data.data) this.setupDoctor(doc);
            })
            // , catchError(this.handleError<BaseListResponse>('getDoctorsWithCategoryId', this.getTestDoctors()))
        );
    }

    public getDoctorsWithQuery(query: string, page?: number, location?: MyAddress): Observable<BaseListResponse> {
        this.myLocation = Helper.getAddressSelected();
        const urlParams = new URLSearchParams();
        urlParams.append('search', query);
        if (page) urlParams.append('page', String(page));
        // if (location) { urlParams.append("lat", String(location.latitude)); urlParams.append("long", String(location.longitude)); }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/doctor/profile/list?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data) this.setupDoctorRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupDoctor(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('get   ProductsWithCategoryId', this.getTestDoctors()))
        );
    }

    public getDoctorsWithScopeId(categoryId: number, scope: string, location: MyAddress, page: number): Observable<BaseListResponse> {
        this.myLocation = Helper.getAddressSelected();
        const urlParams = new URLSearchParams();
        if (categoryId) urlParams.append(scope, String(categoryId));
        if (page) urlParams.append('page', String(page));
        // if (location) { urlParams.append("lat", String(location.latitude)); urlParams.append("long", String(location.longitude)); }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/doctor/profile/list?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data) this.setupDoctorRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const doc of data.data) this.setupDoctor(doc);
            })
            // , catchError(this.handleError<BaseListResponse>('getDoctorsWithCategoryId', this.getTestDoctors()))
        );
    }

    public getDoctorSchedule(doctorId: number, forDays: number, fromDate: string): Observable<DoctorSchedule> {
        const urlParams = new URLSearchParams();
        urlParams.append('days', String(forDays));
        urlParams.append('start_from', String(fromDate));
        return this.http.get<DoctorSchedule>(this.config.apiBase + 'api/doctor/profile/schedule/' + doctorId + '?' + urlParams.toString(), {headers: this.myHeaders});
    }

    public rateUser(uId: number, rateRequest: RateRequest): Observable<{}> {
        return this.http.post<{}>(this.config.apiBase + 'api/user/ratings/' + uId, JSON.stringify(rateRequest), {headers: this.myHeaders});
    }

    public getCategoriesWithScope(scope: string): Observable<Array<Category>> {

        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('scope', scope);
        urlParams.append('pincode', Helper.getAddressSelected().pincode);

        return this.http.get<Array<Category>>(this.config.apiBase + 'api/categories?' + +urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesWithScope', this.getTestCategories()))
        );
    }

    public getExpressCategoriesWithScope(scope: string): Observable<Array<Category>> {
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/expresscategories?pagination=0&scope=' + scope, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesWithScope', this.getTestCategories()))
        );
    }

    public getCategoriesParents(scope?: string): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('parent', '1');
        urlParams.append('pincode', Helper.getAddressSelected().pincode);
        if (scope != null) urlParams.append('scope', scope);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/categories?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
        );
    }

    public getHealthCategoriesParents(scope?: string): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('parent', '1');
        urlParams.append('pincode', Helper.getAddressSelected().pincode);
        if (scope != null) urlParams.append('scope', scope);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/healthcategories?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
        );
    }


    public getExpressCategoriesParents(scope?: string): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('parent', '1');
        if (scope != null) urlParams.append('scope', scope);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/expresscategories?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesParents', this.getTestCategories()))
        );
    }

    public getCategoriesVendors(location: MyAddress): Observable<Array<BaseListResponse>> {
        const urlParams = new URLSearchParams();
        // console.log(location.latitude);
        // // urlParams.append("category", String(parentId));
        // urlParams.append('lat', String(location.latitude));
        // urlParams.append('long', String(location.longitude));
        urlParams.append('pincode', String(location.pincode));


        return this.http.get<Array<BaseListResponse>>(this.config.apiBase + 'api/vendors/list?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap((data: any) => {
            // console.log(this.myLocation);
            //console.log('----------------------')
            //console.log(Helper.getAddressSelected());
            this.myLocation = Helper.getAddressSelected();
            //console.log(this.myLocation);
            if (data.data && data.data.length) data.data.map((vendor: Vendor) => this.setupVendor(vendor));
        }));
    }

    public getPincodeServiceSettings(userPincode: string): Observable<DeliverySlot[]> {
        const location = Helper.getAddressSelected();
        const urlParams = new URLSearchParams();
        let pincode = userPincode;
        if (location != undefined)
            pincode = location.pincode;

        urlParams.append('pincode', pincode);
        //console.log("pincode"+location.pincode);
        //todo: remove this when database stabilizes
        //  if(location.pincode == "" || location.pincode == undefined || location.pincode == null)
        //   urlParams.append('pincode', pincode);
        //    else
        //    urlParams.append('pincode', String(location.pincode));
        return this.http.get<DeliverySlot[]>(this.config.apiBase + 'api/services/list?' + urlParams, {headers: this.myHeaders})
            ;
    }

    public checkDeliveryAvailability(pincode: string): Observable<DeliverySlot[]> {
        const urlParams = new URLSearchParams();
        urlParams.append('pincode', String(pincode));
        return this.http.get<DeliverySlot[]>(this.config.apiBase + 'api/services/list?' + urlParams, {headers: this.myHeaders})
            ;
    }


    setupVendor(vendor: Vendor) {
        if (!vendor.mediaurls || !vendor.mediaurls.images) vendor.mediaurls = {images: []};
        vendor.image = 'assets/images/empty_image.png';
        for (const imgObj of vendor.mediaurls.images) if (imgObj.default) {
            vendor.image = imgObj.default;
            break;
        }

        vendor.categories_text = '';
        if (vendor.categories && vendor.categories.length) for (const cat of vendor.categories) vendor.categories_text += (cat.title + ', ');
        if (vendor.categories_text.length) vendor.categories_text = vendor.categories_text.substring(0, vendor.categories_text.length - 2);
        // vendor.distance = this.getDistanceBetweenTwoCoordinates(Number(this.myLocation.latitude), Number(this.myLocation.longitude), Number(vendor.latitude), Number(vendor.longitude));
        // vendor.distance_toshow = Helper.formatDistance(vendor.distance, this.distance_metric);
    }

    public getCategoriesSub(parentId: number): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('category', parentId.toString());
        urlParams.append('pincode', Helper.getAddressSelected().pincode);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/categories?' + urlParams, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesSub', this.getTestCategories()))
        );
    }

    public getExpressCategoriesSub(parentId: number): Observable<Array<Category>> {
        const urlParams = new URLSearchParams();
        urlParams.append('pagination', '0');
        urlParams.append('category', parentId.toString());
        urlParams.append('pincode', Helper.getAddressSelected().pincode);
        return this.http.get<Array<Category>>(this.config.apiBase + 'api/expresscategories?' + urlParams, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const cat of data) this.setupCategory(cat);
            })
            // , catchError(this.handleError<Array<Category>>('getCategoriesSub', this.getTestCategories()))
        );
    }

    public getProductsWithCategoryId(scope: string, categoryId: number, page: number): Observable<BaseListResponse> {
        this.reloadSetting();
        const urlParams = new URLSearchParams();
        if (categoryId) urlParams.append('category', String(categoryId));
        urlParams.append('page', String(page));
        urlParams.append('scope', String(scope));
        const location = Helper.getAddressSelected();
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/products?' + urlParams, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getProductsWithHealthCategoryId(scope: string, healthCategoryId: number, page: number): Observable<BaseListResponse> {
        this.reloadSetting();
        const urlParams = new URLSearchParams();
        if (healthCategoryId) urlParams.append('healthCategory', String(healthCategoryId));
        urlParams.append('page', String(page));
        urlParams.append('scope', String(scope));
        const location = Helper.getAddressSelected();
        if (location) {
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/healthproducts?' + urlParams, {headers: this.myHeaders}).pipe(tap(data => {
            if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
            if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
        }));
    }

    public getExpressProductsWithCategoryId(scope: string, categoryId: number, page: number): Observable<BaseListResponse> {
        this.reloadSetting();
        const urlParams = new URLSearchParams();
        if (categoryId) urlParams.append('category', String(categoryId));
        urlParams.append('page', String(page));
        urlParams.append('scope', String(scope));
        urlParams.append('express', '1');
        const location = Helper.getAddressSelected();
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/expressproducts?' + urlParams, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }


    public getVendorById(vendorId: number): Observable<Vendor> {
        this.myLocation = Helper.getAddressSelected();
        return this.http.get<Vendor>(this.config.apiBase + 'api/vendors/' + vendorId, {headers: this.myHeaders}).pipe(tap(data => this.setupVendor(data)));
    }

    public getProductsWithVendorId(vendorId: number, page: number): Observable<BaseListResponse> {
        this.reloadSetting();
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/products?vendor=' + vendorId + '&page=' + page, {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.data && data.data.length) this.setupProductRemoveUnfilled(data.data);
                if (data && data.data && data.data.length) for (const pro of data.data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getProductsWithId(productId: string): Observable<Product> {
        this.reloadSetting();
        return this.http.get<Product>(this.config.apiBase + 'api/products/' + productId, {headers: this.myHeaders}).pipe(tap(data => {
                this.setupProduct(data);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public toggleFavoriteProduct(productId: string | number): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/products/favourites/' + productId, {}, {headers: this.myHeaders});
    }

    public toggleFavoriteDoctor(docId: string | number): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/doctor/profile/favourites/' + docId, {}, {headers: this.myHeaders});
    }

    public toggleFavoriteHospital(hosId: string): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/doctor/hospitals/favourites/' + hosId, {}, {headers: this.myHeaders});
    }

    public getFavoriteProducts(): Observable<Array<Product>> {
        return this.http.get<Array<Product>>(this.config.apiBase + 'api/products/favourites/list', {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) this.setupProductRemoveUnfilled(data);
                if (data && data.length) for (const pro of data) this.setupProduct(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getFavoriteDoctors(): Observable<Array<Doctor>> {
        return this.http.get<Array<Doctor>>(this.config.apiBase + 'api/doctor/profile/favourites/list', {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const pro of data) this.setupDoctor(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getFavoriteHospitals(): Observable<Array<Hospital>> {
        return this.http.get<Array<Hospital>>(this.config.apiBase + 'api/doctor/hospitals/favourites/list', {headers: this.myHeaders}).pipe(tap(data => {
                if (data && data.length) for (const pro of data) this.setupHospital(pro);
            })
            // , catchError(this.handleError<BaseListResponse>('getProductsWithCategoryId', this.getTestProducts()))
        );
    }

    public getPaymentMethods(): Observable<Array<PaymentMethod>> {
        return this.http.get<Array<PaymentMethod>>(this.config.apiBase + 'api/payment/methods', {headers: this.myHeaders});
    }

    public getAddresses(): Observable<Array<MyAddress>> {
        return this.http.get<Array<MyAddress>>(this.config.apiBase + 'api/addresses', {headers: this.myHeaders});
    }

    public getPincodes(): Observable<Array<MyPincode>> {
        return this.http.get<Array<MyPincode>>(this.config.apiBase + 'api/pincodes', {headers: this.myHeaders});
    }

    public addressAdd(address: MyAddress): Observable<MyAddress> {
        return this.http.post<MyAddress>(this.config.apiBase + 'api/addresses', address, {headers: this.myHeaders});
    }

    public addressUpdate(address: MyAddress): Observable<MyAddress> {
        return this.http.put<MyAddress>(this.config.apiBase + 'api/addresses/' + address.id, address, {headers: this.myHeaders});
    }

    public addressDelete(address: MyAddress): Observable<MyAddress> {
        return this.http.put<MyAddress>(this.config.apiBase + 'api/deleteaddr/' + address.id, address, {headers: this.myHeaders});
    }

    public createOrder(orderRequest: OrderRequest): Observable<OrderObject> {
        return this.http.post<OrderObject>(this.config.apiBase + 'api/orders', orderRequest,
            {headers: this.myHeaders}).pipe(tap(data => this.setupOrder(data.order)));
    }

    public createOrderv2(orderRequest: OrderRequest): Observable<OrderObject> {
        return this.http.post<OrderObject>(this.config.apiBase + 'api/ordersv2', orderRequest,
            {headers: this.myHeaders}).pipe(tap(data => this.setupOrder(data.order[0])));
        // return this.http.post<OrderObject>(this.config.apiBase + 'api/ordersv2', orderRequest, {headers: this.myHeaders});
    }

    public createOrderv3(orderRequestNew: OrderRequestNew): Observable<OrderObject> {
        return this.http.post<OrderObject>(this.config.apiBase + 'api/ordersv2', orderRequestNew,
            {headers: this.myHeaders}).pipe(tap(data => this.setupOrder(data.order[0])));
    }

    public creatRazorOrder(razorPayment: RazorPayment): Observable<any> {
        return this.http.post(this.config.apiBase + 'api/razorOrder', razorPayment, {headers: this.myHeaders});
    }

    public updateRazorPayment(razorPayment: any) {
        return this.http.post<OrderObject>(this.config.apiBase + 'api/payment/razorpay/'
            + razorPayment.id + '?result=success', razorPayment, {headers: this.myHeaders});
    }


    public createAppointment(doctorId: string, apr: any): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/doctor/appointments/' + doctorId, apr, {headers: this.myHeaders});
    }

    public checkCoupon(couponCode: string): Observable<Coupon> {
        return this.http.get<Coupon>(this.config.apiBase + 'api/coupons/check-validity?code=' + couponCode, {headers: this.myHeaders});
    }

    public getAppointments(userId: any, pageNo: any): Observable<BaseListResponse> {
        const urlParams = new URLSearchParams();
        urlParams.append('appointer', String(userId));
        if (pageNo) urlParams.append('page', String(pageNo));
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/doctor/appointments?' + urlParams.toString(), {headers: this.myHeaders}).pipe(tap(data => {
            if (data && data.data) this.setupAppointmentRemoveUnfilled(data.data);
            for (const ap of data.data) this.setupAppointment(ap);
        }));
    }

    public getAppointmentById(apId: string): Observable<Appointment> {
        return this.http.get<Appointment>(this.config.apiBase + 'api/doctor/appointments/' + apId, {headers: this.myHeaders}).pipe(tap(data => {
            if (data && data.doctor && data.doctor.hospitals) this.setupAppointment(data);
        }));
    }

    public updateAppointment(apId: string, ur: any): Observable<Appointment> {
        return this.http.put<Appointment>(this.config.apiBase + 'api/doctor/appointments/' + apId, ur,
            {headers: this.myHeaders})
            .pipe(tap(ap => {
                this.setupAppointment(ap);
            }));
    }

    public getOrders(pageNo: number): Observable<BaseListResponse> {
        this.reloadSetting();
        this.reloadItemsReviewed();
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/orders?page=' + pageNo, {headers: this.myHeaders})
            .pipe(tap(res => {
                console.log(res);
                if (res && res.data) this.setupOrderRemoveUnfilled(res.data);
                for (const order of res.data) this.setupOrder(order);
            }));
    }

    public getOrdersSimplified(pageNo: number): Observable<BaseListResponse> {
        this.reloadSetting();
        this.reloadItemsReviewed();
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/orders?page=' + pageNo, {headers: this.myHeaders});
    }

    public getOneOrder(orderId: number): Observable<BaseListResponse> {
        this.reloadSetting();
        this.reloadItemsReviewed();
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/order?id=' + orderId, {headers: this.myHeaders});
    }

    public getOrdersv2(order_status: string, payment_status: string, input_express: number, input_seasonal: number, input_order_id: number)
        : Observable<Array<PaymentOrder>> {
        const urlParams = new URLSearchParams();
        if (order_status != null || order_status != undefined)
            urlParams.append('order_status', String(order_status));
        if (payment_status != null || payment_status != undefined)
            urlParams.append('payment_status', String(payment_status));
        if (input_express != null || input_express != undefined)
            urlParams.append('order_express', String(input_express));
        if (input_seasonal != null || input_seasonal != undefined)
            urlParams.append('order_seasonal', String(input_seasonal));
        if (input_order_id != null && input_order_id != undefined && input_order_id != 0)
            urlParams.append('order_id', String(input_order_id));

        return this.http.get<Array<PaymentOrder>>(this.config.apiBase + 'api/ordersv2?' + urlParams, {headers: this.myHeaders});

    }

    public getRatingSummaryProduct(productId: string): Observable<Rating> {
        return this.http.get<Rating>(this.config.apiBase + 'api/products/ratings/summary/' + productId, {headers: this.myHeaders}).pipe(tap(data => {
            const ratingSummaries = RatingSummary.defaultArray();
            for (const ratingSummaryResult of data.summary) {
                ratingSummaries[ratingSummaryResult.rounded_rating - 1].total = ratingSummaryResult.total;
                ratingSummaries[ratingSummaryResult.rounded_rating - 1].percent = ((ratingSummaryResult.total / data.total_ratings) * 100);
            }
            data.summary = ratingSummaries;
        }));
    }

    public getReviewsProduct(productId: string | number, pageNo: number): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/products/ratings/' + productId + '?page=' + pageNo, {headers: this.myHeaders}).pipe(tap(data => {
            for (const review of data.data) this.setupReview(review);
        }));
    }

    public getReviewsDoctor(doctorId: string | number, pageNo: number): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/doctor/profile/ratings/' + doctorId + '?page=' + pageNo, {headers: this.myHeaders}).pipe(tap(data => {
            for (const review of data.data) this.setupReview(review);
        }));
    }

    public postReviewProduct(productId: string | number, rr: RateRequest): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/products/ratings/' + productId, rr, {headers: this.myHeaders});
    }

    public postReviewDoctor(doctorId: string | number, rr: RateRequest): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/doctor/profile/ratings/' + doctorId, rr, {headers: this.myHeaders});
    }

    public walletPayout(pId: number): Observable<{ success: boolean; message: string; }> {
        return this.http.get<{ success: boolean; message: string; }>(this.config.apiBase + 'api/payment/wallet/' + pId, {headers: this.myHeaders});
    }

    public partialWalletPayout(pwp: PartialWalletPayment): Observable<any> {
        return this.http.post<any>(this.config.apiBase + 'api/payment/partialwallet', pwp, {headers: this.myHeaders});
    }

    public walletDeposit(depositRequest: { amount: string; payment_method_slug: string; }): Observable<OrderPayment> {
        return this.http.post<OrderPayment>(this.config.apiBase + 'api/user/wallet/deposit', depositRequest, {headers: this.myHeaders});
    }

    public getBalance(): Observable<{ balance: number }> {
        return this.http.get<{ balance: number }>(this.config.apiBase + 'api/user/wallet/balance', {headers: this.myHeaders}).pipe(tap(data => {
            if (!data.balance) data.balance = 0;
            data.balance = Number(data.balance.toFixed(2));
        }));
    }

    public getTransactions(): Observable<BaseListResponse> {
        return this.http.get<BaseListResponse>(this.config.apiBase + 'api/user/wallet/transactions', {headers: this.myHeaders}).pipe(tap(data => {
            if (data && data.data && data.data.length) for (const trans of data.data) this.setupTransaction(trans);
        }));
    }

    public setupTransaction(transaction: WalletTransaction) {
        transaction.created_at = Helper.formatTimestampDateTime(transaction.created_at, this.locale);
        transaction.updated_at = Helper.formatTimestampDateTime(transaction.updated_at, this.locale);
        if (!transaction.amount) transaction.amount = 0;
        transaction.amount = Number(transaction.amount.toFixed(2));
        if (transaction.meta && transaction.meta.source_amount) transaction.meta.source_amount = Number(Number(transaction.meta.source_amount).toFixed(2));
    }

    public setupReview(data: Review) {
        data.created_at = Helper.formatTimestampDate(data.created_at, this.locale);
        if (data.user.mediaurls && data.user.mediaurls.images) for (const imgObj of data.user.mediaurls.images) if (imgObj.default) {
            data.user.image_url = imgObj.default;
            break;
        }
        if (!data.user.image_url) data.user.image_url = 'assets/images/empty_dp.png';
    }

    private getCategoriesText(categories: Array<Category>): string {
        let toReturn = '';
        if (categories != null && categories.length > 0) {
            for (const cat of categories) toReturn += (cat.title + ', ');
            toReturn = toReturn.substring(0, toReturn.length - 2);
        }
        return toReturn;
    }

    private getDistanceBetweenTwoCoordinates(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);  // deg2rad below
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000; // Returning in meters
    }

    private setDoctorsClosestHospital(data: Doctor) {
        data.hospitalClosest = data.hospitals[0];
        if (this.myLocation != null) {
            let smallestDistance = -1;
            for (const hos of data.hospitals) {
                const hosMeDistance = this.getDistanceBetweenTwoCoordinates(Number(this.myLocation.latitude), Number(this.myLocation.longitude), Number(hos.latitude), Number(hos.longitude));
                if (smallestDistance == -1 || hosMeDistance < smallestDistance) {
                    smallestDistance = hosMeDistance;
                    data.hospitalClosest = hos;
                }
            }
        }
    }

    private setupAppointment(data: Appointment) {
        if (!data.meta) data.meta = {};
        if (!data.status) data.status = 'pending';
        data.momentAppointment = moment(data.date + ' ' + data.time_from);

        data.day_toshow = String(data.momentAppointment.format('ddd')).toLowerCase();
        data.date_toshow = data.momentAppointment.format('Do MMM');
        const timeFromSplit = data.time_from.split(':');
        const timeToSplit = data.time_to.split(':');
        data.time_from_toshow = timeFromSplit[0] + ':' + timeFromSplit[1];
        data.time_to_toshow = timeToSplit[0] + ':' + timeToSplit[1];
        this.setupDoctor(data.doctor);

        if (!data.user) data.user = new User();
        if (data.user.mediaurls && data.user.mediaurls.images) for (const imgObj of data.user.mediaurls.images) if (imgObj.default) {
            data.user.image_url = imgObj.default;
            break;
        }
        if (!data.user.image_url) data.user.image_url = 'assets/images/empty_dp.png';
    }

    private setupDoctorRemoveUnfilled(data: Array<Doctor>) {
        let found = false;
        for (let i = 0; i < data.length; i++) {
            if (!data[i].hospitals || !data[i].hospitals.length) {
                found = true;
                data.splice(i, 1);
            }
        }
        if (found) this.setupDoctorRemoveUnfilled(data);
    }

    private setupAppointmentRemoveUnfilled(data: Array<Appointment>) {
        let found = false;
        for (let i = 0; i < data.length; i++) {
            if (!data[i].doctor || !data[i].doctor.hospitals) {
                found = true;
                data.splice(i, 1);
            }
        }
        if (found) this.setupAppointmentRemoveUnfilled(data);
    }

    public setupHospital(data: Hospital) {
        if (!data.mediaurls || !data.mediaurls.images) data.mediaurls = {images: []};
        data.image = 'assets/images/empty_image.png';
        data.images = new Array<string>();
        for (let i = 0; i < data.mediaurls.images.length; i++) {
            if (data.mediaurls.images[i].default) {
                if (i == 0) data.image = data.mediaurls.images[i].default;
                data.images.push(data.mediaurls.images[i].default);
            }
        }
        if (!data.images.length) data.images.push('assets/images/empty_image.png');

        if (!data.services) data.services = new Array<Category>();

        const availabilityDefault = AvailabilityDateTime.getDefault();
        if (data.availability && data.availability.length) {
            for (const avail of data.availability) {
                let index = 0;
                switch (avail.days) {
                    case 'sun':
                        index = 0;
                        break;
                    case 'mon':
                        index = 1;
                        break;
                    case 'tue':
                        index = 2;
                        break;
                    case 'wed':
                        index = 3;
                        break;
                    case 'thu':
                        index = 4;
                        break;
                    case 'fri':
                        index = 5;
                        break;
                    case 'sat':
                        index = 6;
                        break;
                }
                availabilityDefault[index].selected = true;
                availabilityDefault[index].setTime(avail.from, avail.to);
            }
        }
        data.availability = availabilityDefault;
    }

    public setupDoctor(data: Doctor) {
        this.setDoctorsClosestHospital(data);
        data.consultancy_fee = data.hospitalClosest.fee;

        if (!data.ratings) data.ratings = 0;
        if (!data.ratings_count) data.ratings_count = 0;
        data.ratings = Number(Number(data.ratings).toFixed(1));
        data.hospitals_text = '';
        if (data.hospitals && data.hospitals.length) {
            let hospitals_text_new = '';
            for (const hos of data.hospitals) hospitals_text_new += (hos.name + ', ');
            hospitals_text_new = hospitals_text_new.substring(0, hospitals_text_new.length - 2);
            data.hospitals_text = hospitals_text_new;
            for (const hos of data.hospitals) this.setupHospital(hos)
        }

        data.degrees_text = this.getCategoriesText(data.degrees);
        data.specializations_text = this.getCategoriesText(data.specializations);
        data.services_text = this.getCategoriesText(data.services);

        if (!data.mediaurls || !data.mediaurls.images) data.mediaurls = {images: []};
        data.image = 'assets/images/empty_image.png';
        for (const imgObj of data.mediaurls.images) if (imgObj.default) {
            data.image = imgObj.default;
            break;
        }

        if (!data.user) data.user = new User();
        if (data.user.mediaurls && data.user.mediaurls.images) for (const imgObj of data.user.mediaurls.images) if (imgObj.default) {
            data.user.image_url = imgObj.default;
            break;
        }
        if (!data.user.image_url) data.user.image_url = 'assets/images/empty_dp.png';

        const availabilityDefault = AvailabilityDateTime.getDefault();
        if (data.availability && data.availability.length) {
            for (const avail of data.availability) {
                let index = 0;
                switch (avail.days) {
                    case 'sun':
                        index = 0;
                        break;
                    case 'mon':
                        index = 1;
                        break;
                    case 'tue':
                        index = 2;
                        break;
                    case 'wed':
                        index = 3;
                        break;
                    case 'thu':
                        index = 4;
                        break;
                    case 'fri':
                        index = 5;
                        break;
                    case 'sat':
                        index = 6;
                        break;
                }
                availabilityDefault[index].selected = true;
                availabilityDefault[index].setTime(avail.from, avail.to);
            }
        }
        data.availability = availabilityDefault;
    }

    private setupCategory(category: Category) {
        if (category.mediaurls && category.mediaurls.images) for (const imgObj of category.mediaurls.images) if (imgObj.default) {
            category.image = imgObj.default;
            break;
        }
        if (!category.image) category.image = 'assets/images/empty_image.png';
    }

    private setupProductRemoveUnfilled(data: Array<Product>) {
        let found = false;
        for (let i = 0; i < data.length; i++) {
            if (!data[i].categories || !data[i].categories.length) {
                found = true;
                data.splice(i, 1);
            }
        }
        if (found) this.setupProductRemoveUnfilled(data);
    }

    private setupOrderRemoveUnfilled(data: Array<Order>) {
        let found = false;
        for (let i = 0; i < data.length; i++) {
            if (!data[i].products || !data[i].products.length || !data[i].vendor || !data[i].user) {
                found = true;
                data.splice(i, 1);
            }
        }
        if (found) this.setupOrderRemoveUnfilled(data);
    }

    public setupProduct(product: Product) {
        product.prescription_required = (product.meta && product.meta.prescription
            && (product.meta.prescription == '1' || product.meta.prescription == true));

        if (!product.ratings) product.ratings = 0;
        if (!product.ratings_count) product.ratings_count = 0;
        product.ratings = Number(Number(product.ratings).toFixed(1));
        if (!product.price) product.price = 0;
        product.priceToShow = this.currency_icon + product.price.toFixed(2);
        if (product.sale_price != null) {
            product.sale_priceToShow = this.currency_icon + product.sale_price.toFixed(2);
        }

        product.ratings = Number(product.ratings.toFixed(2));

        product.vendorText = '';
        if (product.vendor_products && product.vendor_products.length) {
            for (const vp of product.vendor_products) {
                if (!vp.sale_price) vp.sale_price = 0;
                vp.priceToShow = this.currency_icon + vp.price.toFixed(2);
                if (vp.sale_price != null) {
                    vp.sale_priceToShow = this.currency_icon + vp.sale_price.toFixed(2);
                }


                if (vp.vendor) {
                    if (!vp.vendor.mediaurls || !vp.vendor.mediaurls.images) vp.vendor.mediaurls = {images: []};
                    vp.vendor.image = 'assets/images/empty_image.png';
                    for (const imgObj of vp.vendor.mediaurls.images) if (imgObj.default) {
                        vp.vendor.image = imgObj.default;
                        break;
                    }

                    product.vendorText += (vp.vendor.name + ', ');
                }
            }
        }

        if (product.vendorText.length) product.vendorText = product.vendorText.substring(0, product.vendorText.length - 2);

        if (product.categories && product.categories.length) {
            for (const cat of product.categories) this.setupCategory(cat);
        }

        product.images = new Array<string>();
        if (product.mediaurls && product.mediaurls.images) for (const imgObj of product.mediaurls.images) if (imgObj.default) product.images.push(imgObj.default);
        if (!product.images.length) product.images.push('assets/images/empty_image.png');
    }

    private setupOrder(order: Order) {

        order.created_at = Helper.formatTimestampDate(order.created_at, this.locale);
        //if (order.scheduled_on) order.scheduled_on = Helper.formatTimestampDate(order.scheduled_on, this.locale);
        console.log('Deliver' + Helper.getRegularPincode().slot1.toString());
        //if (order.scheduled_on) 
        order.scheduled_on = Helper.formatTimestampDate(Helper.getRegularPincode().slot1.toString(), this.locale);
        order.total_toshow = this.currency_icon + Number(order.total).toFixed(2);
        order.subtotal_toshow = this.currency_icon + Number(order.subtotal).toFixed(2);
        if (order.delivery_fee) order.delivery_fee_toshow = this.currency_icon + Number(order.delivery_fee).toFixed(2);
        if (order.discount) order.discount_toshow = this.currency_icon + Number(order.discount).toFixed(2);
        if (order.taxes) order.taxes_toshow = this.currency_icon + Number(order.taxes).toFixed(2);

        for (const product of order.products) {
            product.total_toshow = this.currency_icon + Number(product.total).toFixed(2);
            if (product.vendor_product && product.vendor_product.product) {
                if (!product.vendor_product.product.price) product.vendor_product.product.price = 0;
                product.vendor_product.product.priceToShow = this.currency_icon + Number(product.vendor_product.product.price).toFixed(2);

                product.vendor_product.product.images = new Array<string>();
                if (product.vendor_product.product.mediaurls && product.vendor_product.product.mediaurls.images) for (const imgObj of product.vendor_product.product.mediaurls.images) if (imgObj.default) product.vendor_product.product.images.push(imgObj.default);
                if (!product.vendor_product.product.images.length) product.vendor_product.product.images.push('assets/images/empty_image.png');

                // custom
                product.vendor_product.product.reviewed = (this.reviewedIds != null && this.reviewedIds.includes(String(String(order.id) + String(product.vendor_product.product.id))));
            }
        }

        if (order.vendor) {
            if (!order.vendor.mediaurls || !order.vendor.mediaurls.images) order.vendor.mediaurls = {images: []};
            order.vendor.image = 'assets/images/empty_image.png';
            for (const imgObj of order.vendor.mediaurls.images) if (imgObj.default) {
                order.vendor.image = imgObj.default;
                break;
            }
        }

        if (order.delivery) {
            order.delivery.delivery.user.image_url = 'assets/images/empty_dp';
            if (!order.delivery.delivery.user.mediaurls || !order.delivery.delivery.user.mediaurls.images)
                order.delivery.delivery.user.mediaurls = {images: []};
            for (const imgObj of order.delivery.delivery.user.mediaurls.images) if (imgObj.default) {
                order.delivery.delivery.user.image_url = imgObj.default;
                break;
            }
        }

        if (order.user) {
            if (!order.user.mediaurls || !order.user.mediaurls.images) order.user.mediaurls = {images: []};
            order.user.image_url = 'assets/images/empty_dp.png';
            for (const imgObj of order.user.mediaurls.images) if (imgObj.default) {
                order.user.image_url = imgObj.default;
                break;
            }
        }

    }

    private setupUserMe(data: User) {
        if (!data.mediaurls || !data.mediaurls.images) data.mediaurls = {images: []};
        if (!data.image_url) for (const imgObj of data.mediaurls.images) if (imgObj.default) {
            data.image_url = imgObj.default;
            break;
        }
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead
            // TODO: better job of transforming error for user consumption
            console.log(`${operation} failed: ${error.message}`);
            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }


    public getFeaturedProducts(): Observable<Array<Product>> {
        const urlParams = new URLSearchParams();
        const location = Helper.getAddressSelected();
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<Array<Product>>(this.config.apiBase + 'api/products/promotion/featured?' + urlParams, {headers: this.myHeaders});

    }

    public getExpressFeaturedProducts(): Observable<Array<Product>> {
        //return this.http.get<Array<Product>>(this.config.apiBase + 'api/products/promotion/expressfeatured');
        const urlParams = new URLSearchParams();
        const location = Helper.getAddressSelected();
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        return this.http.get<Array<Product>>(this.config.apiBase + 'api/products/promotion/expressfeatured?' + urlParams, {headers: this.myHeaders});

    }

    public getSeasonalProducts(): Observable<Array<SeasonalProduct>> {

        const urlParams = new URLSearchParams();
        const location = Helper.getAddressSelected();
        if (location) {
            // urlParams.append('lat', String(location.latitude));
            // urlParams.append('long', String(location.longitude));
            urlParams.append('pincode', String(location.pincode));
        }
        urlParams.append('seasonal_variety', 'mango');
        return this.http.get<Array<SeasonalProduct>>(this.config.apiBase + 'api/getSeasonalProducts?' + urlParams, {headers: this.myHeaders});

    }


}
