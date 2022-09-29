import {Injectable} from '@angular/core';
import {Product} from 'src/models/product.models';
import {Helper} from 'src/models/helper.models';
import {MyAddress} from 'src/models/address.models';
import {OrderRequest} from 'src/models/order-request.models';
import {PaymentMethod} from 'src/models/payment-method.models';
import {Coupon} from 'src/models/coupon.models';
import {ServiceRequest} from 'src/models/service-request.models';
import {MembershipModel} from 'src/models/membership-plan.models';
import {Order} from 'src/models/order.models';
import {OrderPayment} from 'src/models/order-payment.models';

export class CartItem {
    id: number;
    title: string;
    subtitle: string;
    image: string;
    // price is what we charge to the customer, either price or sale price
    // tslint:disable-next-line:variable-name
    sale_price: number;
    price: number;
    priceToShow: string;
    savings: number;
    quantity: number;
    total: number;
    originalTotal: number;
    product: any;
    week: string;
    // tslint:disable-next-line:variable-name
    delivery_type: string;

    setQuantity(newQuantity: number) {
        this.quantity = newQuantity;
        if (this.sale_price != null && this.sale_price > 0) {
            this.total = this.sale_price * this.quantity;
            this.originalTotal = this.price * this.quantity;
            this.savings = (this.price - this.sale_price) * this.quantity;
        } else {
            this.total = this.price * this.quantity;
            this.originalTotal = 0;
            this.savings = 0;
        }
    }

    getTotal(fixFloatingPoint: boolean): number {
        return fixFloatingPoint ? Number(this.total.toFixed(2)) : this.total;
    }

    getOriginalTotal(fixFloatingPoint: boolean): number {
        if (this.originalTotal != null || this.originalTotal != undefined)
            return fixFloatingPoint ? Number(this.originalTotal.toFixed(2)) : this.originalTotal;
        else
            return this.total;
    }

    static fromSaved(savedCartItem: CartItem): CartItem {
        let toReturn = new CartItem();
        toReturn.id = savedCartItem.id;
        toReturn.title = savedCartItem.title;
        toReturn.subtitle = savedCartItem.subtitle;
        toReturn.image = savedCartItem.image;
        toReturn.price = savedCartItem.price;
        toReturn.week = savedCartItem.week;
        toReturn.priceToShow = savedCartItem.priceToShow;
        toReturn.quantity = savedCartItem.quantity;
        toReturn.total = savedCartItem.total;
        toReturn.originalTotal = savedCartItem.originalTotal;
        toReturn.savings = savedCartItem.savings;
        toReturn.product = savedCartItem.product;
        return toReturn;
    }
}

export class ExtraCharge {
    id: string;
    title: string;
    price: number;
    isPercent: boolean;
    priceToShow: string;
    extraChargeObject: any;
}

export class Cart {
    static KEY_CART: string = 'it_cart';
    static EXPRESS_KEY_CART: string = 'express_it_cart'
    cartItems: Array<CartItem>;
    extraCharges: Array<ExtraCharge>;

    static restore(cartType: number): Cart {
        const toReturn = new Cart();
        toReturn.cartItems = new Array<CartItem>();
        toReturn.extraCharges = new Array<ExtraCharge>();
        let savedCart: Cart;
        if (cartType === 1)
            savedCart = Cart.getSavedCart();
        else
            savedCart = Cart.getSavedExpressCart();
        if (savedCart) {
            if (savedCart.extraCharges && savedCart.extraCharges.length) toReturn.extraCharges = savedCart.extraCharges;
            if (savedCart.cartItems && savedCart.cartItems.length)
                for (let sCi of savedCart.cartItems) toReturn.cartItems.push(CartItem.fromSaved(sCi));
        }

        return toReturn;
    }

    removeExtraCharge(extraChargeId: string) {
        let currIndex = -1;
        for (let i = 0; i < this.extraCharges.length; i++) {
            if (this.extraCharges[i].id == extraChargeId) {
                currIndex = i;
                break;
            }
        }
        if (currIndex != -1) this.extraCharges.splice(currIndex, 1);
    }

    addExtraCharge(extraCharge: ExtraCharge) {
        this.extraCharges.push(extraCharge);
    }

    getTotalCartItems(fixFloatingPoint: boolean): number {
        let toReturn = 0;
        for (const ci of this.cartItems) toReturn += ci.total;
        return fixFloatingPoint ? Number(toReturn.toFixed(2)) : toReturn;
    }

    getTotalSavings(fixFloatingPoint: boolean): number {
        let toReturn = 0;
        for (const ci of this.cartItems) toReturn += ci.savings;
        return fixFloatingPoint ? Number(toReturn.toFixed(2)) : toReturn;
    }

    getTotalCart(fixFloatingPoint: boolean): number {
        const subTotal = this.getTotalCartItems(false);

        // tslint:disable-next-line:variable-name
        let tax_in_percent = 0;
        for (const ec of this.extraCharges) {
            if (ec.id == 'tax_in_percent') {
                tax_in_percent = ec.isPercent ? ((subTotal * ec.price) / 100) : (ec.price);
                break;
            }
        }

        let coupon = 0;
        for (let ec of this.extraCharges) {
            if (ec.id == 'coupon') {
                coupon = ec.isPercent ? ((subTotal * ec.price) / 100) : (ec.price);
                break;
            }
        }

        let currency_icon = Helper.getSetting('currency_icon');

        let toReturn = 0;
        if ((subTotal + tax_in_percent - coupon) >= 1000) {
            //this.removeExtraCharge("delivery_fee");

            let found_del_charges = false;
            for (let i = 0; i < this.extraCharges.length; i++) {
                if (this.extraCharges[i].id == 'delivery_fee') {
                    this.extraCharges[i].price = Number(0);
                    this.extraCharges[i].priceToShow = currency_icon + 0;
                    found_del_charges = true;
                    break;
                }
            }
        } else {
            let delivery_fee_setting = Helper.getSetting('delivery_fee');
            let found_del_charges = false;
            for (let i = 0; i < this.extraCharges.length; i++) {
                if (this.extraCharges[i].id == 'delivery_fee') {
                    this.extraCharges[i].price = Number(delivery_fee_setting);
                    this.extraCharges[i].priceToShow = currency_icon + delivery_fee_setting;
                    found_del_charges = true;
                    break;
                }
            }
        }
        let delivery_fee = 0;
        let isDelFee = 0;
        for (let ec of this.extraCharges) {
            if (isDelFee == 0) {
                if (ec.id == 'delivery_fee') {
                    delivery_fee = ec.price;
                    isDelFee = 1;
                    break;
                }
            }
        }

        toReturn = subTotal + tax_in_percent + delivery_fee - coupon;

        return fixFloatingPoint ? Number(toReturn.toFixed(2)) : toReturn;
    }

    static getSavedCart(): Cart {
        return JSON.parse(window.localStorage.getItem(Cart.KEY_CART));
    }

    static setSavedCart(cartToSave: Cart) {
        window.localStorage.setItem(Cart.KEY_CART, JSON.stringify(cartToSave));
    }

    static getSavedExpressCart(): Cart {
        return JSON.parse(window.localStorage.getItem(Cart.EXPRESS_KEY_CART));
    }

    static setSavedExpressCart(cartToSave: Cart) {
        window.localStorage.setItem(Cart.EXPRESS_KEY_CART, JSON.stringify(cartToSave));
    }
}

@Injectable({
    providedIn: 'root'
})
export class ECommerceService {

    private myCart: Cart;
    private orderRequest: OrderRequest;
    private orderMeta: any;

    private serviceRequest: ServiceRequest;
    private serviceMeta: any;
    private subscriptionRequest: MembershipModel;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.myCart = Cart.restore(1);

        let tax_in_percent = Helper.getSetting('tax_in_percent');
        let delivery_fee = Helper.getSetting('delivery_fee');
        let currency_icon = Helper.getSetting('currency_icon');

        this.myCart.removeExtraCharge('delivery_fee');
        this.myCart.removeExtraCharge('tax_in_percent');
        if (tax_in_percent != null && Number(tax_in_percent) > 0) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = tax_in_percent;
            ec.id = 'tax_in_percent';
            ec.title = 'Service Fee';
            ec.isPercent = true;
            ec.price = Number(tax_in_percent);
            ec.priceToShow = ec.price + '%';
            this.myCart.addExtraCharge(ec);
        }
        if (delivery_fee != null && Number(delivery_fee) > 0) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = delivery_fee;
            ec.id = 'delivery_fee';
            ec.title = 'Delivery Fee';
            ec.isPercent = false;
            ec.price = Number(delivery_fee);
            ec.priceToShow = currency_icon + ec.price;
            this.myCart.addExtraCharge(ec);
        }
    }

    clearCart() {
        Cart.setSavedCart(null);
        this.initialize();
        this.orderMeta = null;
        this.orderRequest = null;
    }

    getCartItems(): Array<CartItem> {
        return this.myCart.cartItems;
    }

    getExtraCharges(): Array<ExtraCharge> {

        return this.myCart.extraCharges;
    }

    getCartItemsCount(): number {
        return this.myCart.cartItems.length;
    }

    getCartItemsTotal(fixFloatingPoint: boolean): number {
        return this.myCart.getTotalCartItems(fixFloatingPoint);
    }

    getCartItemsSavings(fixFloatingPoint: boolean): number {
        return this.myCart.getTotalSavings(fixFloatingPoint);
    }

    getCartTotal(fixFloatingPoint: boolean): number {
        return this.myCart.getTotalCart(fixFloatingPoint);
    }

    getSubscriptionRequest() {
        return this.subscriptionRequest;
    }

    isExistsCartItem(ci: CartItem): boolean {
        let index = -1;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                index = i;
                break;
            }
        }
        return index != -1;
    }

    quantityCartItem(ci: CartItem): number {
        let quantity = 0;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                quantity = this.myCart.cartItems[i].quantity;
                break;
            }
        }
        return quantity;
    }

    quantitySeasonalCartItem(ci: CartItem): number {
        let quantity = 0;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                quantity = this.myCart.cartItems[i].quantity;
                break;
            }
        }
        return quantity;
    }

    addOrIncrementSeasonalCartItem(ci: CartItem): number {
        let enableCartConflictCheck = false;
        //returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        let toReturn = 1;
        let index = -1;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            if (enableCartConflictCheck) {
                let cartConflict = false;
                let ciVendorIdNew = this.getCartItemVendorId(ci);
                console.log('ciVendorIdNew: ', ciVendorIdNew);
                if (ciVendorIdNew != -1) {
                    for (let ciOld of this.myCart.cartItems) {
                        if (this.getCartItemVendorId(ciOld) != ciVendorIdNew) {
                            cartConflict = true;
                            break;
                        }
                    }
                }
                if (cartConflict) {
                    toReturn = -1;
                } else {
                    toReturn = 1;
                    this.myCart.cartItems.push(ci);
                }
            } else {
                toReturn = 1;
                this.myCart.cartItems.push(ci);
            }
        } else {
            toReturn = 0;
            ci.setQuantity(this.myCart.cartItems[index].quantity + 1);
            this.myCart.cartItems[index] = ci;
        }
        if (toReturn != -1) {
            Cart.setSavedCart(this.myCart);
        }
        //returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        return toReturn;
    }

    addOrIncrementCartItem(ci: CartItem): number {
        let enableCartConflictCheck = false;
        //returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        let toReturn = 1;
        let index = -1;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            if (enableCartConflictCheck) {
                let cartConflict = false;
                let ciVendorIdNew = this.getCartItemVendorId(ci);
                console.log('ciVendorIdNew: ', ciVendorIdNew);
                if (ciVendorIdNew != -1) {
                    for (let ciOld of this.myCart.cartItems) {
                        if (this.getCartItemVendorId(ciOld) != ciVendorIdNew) {
                            cartConflict = true;
                            break;
                        }
                    }
                }
                if (cartConflict) {
                    toReturn = -1;
                } else {
                    toReturn = 1;
                    this.myCart.cartItems.push(ci);
                }
            } else {
                toReturn = 1;
                this.myCart.cartItems.push(ci);
            }
        } else {
            toReturn = 0;
            ci.setQuantity(this.myCart.cartItems[index].quantity + 1);
            this.myCart.cartItems[index] = ci;
        }
        if (toReturn != -1) {
            Cart.setSavedCart(this.myCart);
        }
        //returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        return toReturn;
    }

    removeOrDecrementCartItem(ci: CartItem): boolean {
        let index = -1;
        for (let i = 0; i < this.myCart.cartItems.length; i++) {
            if (this.myCart.cartItems[i].id == ci.id && this.myCart.cartItems[i].week == ci.week) {
                index = i;
                break;
            }
        }
        let removed = false;
        if (index != -1) {
            if (this.myCart.cartItems[index].quantity > 1) {
                ci.setQuantity(this.myCart.cartItems[index].quantity - 1);
                this.myCart.cartItems[index] = ci;
            } else {
                removed = true;
                this.myCart.cartItems.splice(index, 1);
            }
            Cart.setSavedCart(this.myCart);
        }
        return removed;
    }

    getCartItemVendorId(ci: CartItem): number {
        let toReturn = -1;
        if (ci && ci.product && ci.product.vendor_products && ci.product.vendor_products.length) {
            for (let ciVendorProduct of ci.product.vendor_products) {
                if (ciVendorProduct.product_id == ci.product.id) {
                    toReturn = ciVendorProduct.id;
                    break;
                }
            }
        }
        return toReturn;
    }

    //custom IMPLEMENTATION below.

    removeCoupon() {
        this.myCart.removeExtraCharge('coupon');
    }

    //custom COUPON implementation below

    applyCoupon(coupon: Coupon) {
        this.myCart.removeExtraCharge('coupon');

        if (coupon != null) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = coupon;
            ec.id = 'coupon';
            ec.title = coupon.title;
            ec.isPercent = coupon.type == 'percent';
            ec.price = Number(coupon.reward);
            if (ec.isPercent)
                ec.priceToShow = ec.price + '%';
            else
                ec.priceToShow = ec.price.toString();
            this.myCart.addExtraCharge(ec);

            this.setupOrderRequestBase();
            this.orderRequest.coupon_code = coupon.code;
        } else {
            this.setupOrderRequestBase();
            this.orderRequest.coupon_code = null;
        }
    }

    // custom PRODUCT implementation below

    getCartItemFromProduct(product: Product): CartItem {
        let ci = new CartItem();
        ci.price = product.price;
        ci.sale_price = product.sale_price;
        ci.title = product.title;
        ci.subtitle = product.categories[0].title;
        ci.image = product.images[0];
        ci.week = product.week;
        ci.product = product;

        ci.id = (product.vendor_products && product.vendor_products[0]) ? product.vendor_products[0].id : product.id;
        ci.setQuantity(1);
        return ci;
    }

    getCartItemFromFeatureProduct(product: Product): CartItem {
        let ci = new CartItem();
        ci.price = product.price;
        ci.sale_price = product.sale_price;
        ci.title = product.title;
        ci.subtitle = product.categories[0].title;
        ci.product = product;
        ci.id = (product.vendor_products && product.vendor_products[0]) ? product.vendor_products[0].id : product.id;
        ci.setQuantity(1);
        return ci;
    }

    // custom ORDERREQUEST implementation below

    getOrderRequest(): OrderRequest {
        this.orderRequest.products = [];
        for (const ci of this.myCart.cartItems) this.orderRequest.products.push({id: ci.id, quantity: ci.quantity, dispatch_week: ci.week});
        if (this.orderMeta != null) this.orderRequest.meta = JSON.stringify(this.orderMeta);
        return this.orderRequest;
    }

    setupOrderRequestBase() {
        if (this.orderRequest == null) this.orderRequest = new OrderRequest();
        if (this.orderMeta == null) this.orderMeta = {};
    }

    setupOrderRequestAddress(address: MyAddress) {
        this.setupOrderRequestBase();
        this.orderRequest.address_id = address.id;
    }

    setupOrderRequestPaymentMethod(paymentMethod: PaymentMethod) {
        this.setupOrderRequestBase();
        this.orderRequest.payment_method_id = paymentMethod.id;
        this.orderRequest.payment_method_slug = paymentMethod.slug;
        this.orderRequest.delivery_date = Helper.getRegularPincode().slot1;
        this.orderRequest.express = 0;
    }

    setupCustomOrderRequestPaymentMethod(slug) {
        this.setupOrderRequestBase();
        this.orderRequest.payment_method_id = slug;
        this.orderRequest.payment_method_slug = slug;
        this.orderRequest.delivery_date = Helper.getRegularPincode().slot1;
        this.orderRequest.seasonal = 0;
        this.orderRequest.express = 0;
    }

    setupSeasonalOrderRequestPaymentMethod(slug, deliveryDetails) {
        this.setupOrderRequestBase();
        this.orderRequest.payment_method_id = slug;
        this.orderRequest.payment_method_slug = slug;
        this.orderRequest.delivery_date = this.orderRequest.delivery_date = Helper.getRegularPincode().slot1;
        this.orderRequest.express = 0;
        this.orderRequest.seasonal = 1;
    }

    setupSubscriptionRequestPaymentMethod(subscriptionRequest: MembershipModel, paymentMethod: PaymentMethod) {
        subscriptionRequest.payment = new OrderPayment();
        subscriptionRequest.payment.payment_method = new PaymentMethod();
        subscriptionRequest.payment.id = paymentMethod.id;
        subscriptionRequest.payment.payment_method.slug = paymentMethod.slug;
        return subscriptionRequest;
    }

    setupOrderRequestMeta(key: string, value: string) {
        this.setupOrderRequestBase();
        this.orderMeta[key] = value;
    }

    getOrderRequestMetaKey(key: string): string {
        this.setupOrderRequestBase();
        return this.orderMeta[key] != null ? this.orderMeta[key] : null;
    }

    removeOrderRequestMeta(key: string) {
        this.setupOrderRequestBase();
        this.orderMeta[key] = null;
    }

    getAppointmentRequest(): ServiceRequest {
        if (this.serviceMeta != null) this.serviceRequest.meta = JSON.stringify(this.serviceMeta);
        return this.serviceRequest;
    }

    setupAppointmentRequestBase() {
        if (this.serviceRequest == null) this.serviceRequest = new ServiceRequest();
        if (this.serviceMeta == null) this.serviceMeta = {};
    }

    setupAppointmentRequestPaymentMethod(paymentMethod: PaymentMethod) {
        this.setupAppointmentRequestBase();
        this.serviceRequest.payment_method_id = paymentMethod.id;
        this.serviceRequest.payment_method_slug = paymentMethod.slug;
    }

    setupAppointmentRequest(serviceRequest: ServiceRequest) {
        if (this.serviceRequest == null) this.serviceRequest = serviceRequest;
    }

}

@Injectable({
    providedIn: 'root'
})
export class ExpressECommerceService {

    private expressCart: Cart;
    private orderRequest: OrderRequest;
    private orderMeta: any;

    private serviceRequest: ServiceRequest;
    private serviceMeta: any;
    private subscriptionRequest: MembershipModel;

    constructor() {
        this.initialize();
    }

    initialize() {
        this.expressCart = Cart.restore(2);

        let tax_in_percent = Helper.getSetting('tax_in_percent');
        let delivery_fee = Helper.getSetting('delivery_fee');
        let currency_icon = Helper.getSetting('currency_icon');

        this.expressCart.removeExtraCharge('delivery_fee');
        this.expressCart.removeExtraCharge('tax_in_percent');
        if (tax_in_percent != null && Number(tax_in_percent) > 0) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = tax_in_percent;
            ec.id = 'tax_in_percent';
            ec.title = 'Service Fee';
            ec.isPercent = true;
            ec.price = Number(tax_in_percent);
            ec.priceToShow = ec.price + '%';
            this.expressCart.addExtraCharge(ec);
        }
        if (delivery_fee != null && Number(delivery_fee) > 0) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = delivery_fee;
            ec.id = 'delivery_fee';
            ec.title = 'Delivery Fee';
            ec.isPercent = false;
            ec.price = Number(delivery_fee);
            ec.priceToShow = currency_icon + ec.price;
            this.expressCart.addExtraCharge(ec);
        }
    }

    clearCart() {
        Cart.setSavedExpressCart(null);
        this.initialize();
        this.orderMeta = null;
        this.orderRequest = null;
    }

    getCartItems(): Array<CartItem> {
        return this.expressCart.cartItems;
    }

    getExtraCharges(): Array<ExtraCharge> {

        return this.expressCart.extraCharges;
    }

    getCartItemsCount(): number {
        return this.expressCart.cartItems.length;
    }

    getCartItemsTotal(fixFloatingPoint: boolean): number {
        return this.expressCart.getTotalCartItems(fixFloatingPoint);
    }

    getCartItemsSavings(fixFloatingPoint: boolean): number {
        return this.expressCart.getTotalSavings(fixFloatingPoint);
    }

    getCartTotal(fixFloatingPoint: boolean): number {
        return this.expressCart.getTotalCart(fixFloatingPoint);
    }

    getSubscriptionRequest() {
        return this.subscriptionRequest;
    }

    isExistsCartItem(ci: CartItem): boolean {
        let index = -1;
        for (let i = 0; i < this.expressCart.cartItems.length; i++) {
            if (this.expressCart.cartItems[i].id == ci.id) {
                index = i;
                break;
            }
        }
        return index != -1;
    }

    quantityCartItem(ci: CartItem): number {
        let quantity = 0;
        for (let i = 0; i < this.expressCart.cartItems.length; i++) {
            if (this.expressCart.cartItems[i].id == ci.id) {
                quantity = this.expressCart.cartItems[i].quantity;
                break;
            }
        }
        return quantity;
    }

    addOrIncrementCartItem(ci: CartItem): number {
        const enableCartConflictCheck = false;
        // returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        let toReturn = 1;
        let index = -1;
        for (let i = 0; i < this.expressCart.cartItems.length; i++) {
            if (this.expressCart.cartItems[i].id === ci.id) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            if (enableCartConflictCheck) {
                let cartConflict = false;
                let ciVendorIdNew = this.getCartItemVendorId(ci);
                console.log('ciVendorIdNew: ', ciVendorIdNew);
                if (ciVendorIdNew != -1) {
                    for (let ciOld of this.expressCart.cartItems) {
                        if (this.getCartItemVendorId(ciOld) != ciVendorIdNew) {
                            cartConflict = true;
                            break;
                        }
                    }
                }
                if (cartConflict) {
                    toReturn = -1;
                } else {
                    toReturn = 1;
                    this.expressCart.cartItems.push(ci);
                }
            } else {
                toReturn = 1;
                this.expressCart.cartItems.push(ci);
            }
        } else {
            toReturn = 0;
            ci.setQuantity(this.expressCart.cartItems[index].quantity + 1);
            this.expressCart.cartItems[index] = ci;
        }
        if (toReturn != -1) {
            Cart.setSavedExpressCart(this.expressCart);
        }
        //returning 1 for added, 0 for not adding but incrementing and -1 for cart conflicts.
        return toReturn;
    }

    removeOrDecrementCartItem(ci: CartItem): boolean {
        let index = -1;
        for (let i = 0; i < this.expressCart.cartItems.length; i++) {
            if (this.expressCart.cartItems[i].id == ci.id) {
                index = i;
                break;
            }
        }
        let removed = false;
        if (index != -1) {
            if (this.expressCart.cartItems[index].quantity > 1) {
                ci.setQuantity(this.expressCart.cartItems[index].quantity - 1);
                this.expressCart.cartItems[index] = ci;
            } else {
                removed = true;
                this.expressCart.cartItems.splice(index, 1);
            }
            Cart.setSavedExpressCart(this.expressCart);
        }
        return removed;
    }

    getCartItemVendorId(ci: CartItem): number {
        let toReturn = -1;
        if (ci && ci.product && ci.product.vendor_products && ci.product.vendor_products.length) {
            for (let ciVendorProduct of ci.product.vendor_products) {
                if (ciVendorProduct.product_id == ci.product.id) {
                    toReturn = ciVendorProduct.id;
                    break;
                }
            }
        }
        return toReturn;
    }

    //custom IMPLEMENTATION below.

    removeCoupon() {
        this.expressCart.removeExtraCharge('coupon');
    }

    //custom COUPON implementation below

    applyCoupon(coupon: Coupon) {
        this.expressCart.removeExtraCharge('coupon');

        if (coupon != null) {
            let ec = new ExtraCharge();
            ec.extraChargeObject = coupon;
            ec.id = 'coupon';
            ec.title = coupon.title;
            ec.isPercent = coupon.type == 'percent';
            ec.price = Number(coupon.reward);
            if (ec.isPercent)
                ec.priceToShow = ec.price + '%';
            else
                ec.priceToShow = ec.price.toString();
            this.expressCart.addExtraCharge(ec);

            this.setupOrderRequestBase();
            this.orderRequest.coupon_code = coupon.code;
        } else {
            this.setupOrderRequestBase();
            this.orderRequest.coupon_code = null;
        }
    }

    // custom PRODUCT implementation below

    getCartItemFromProduct(product: Product): CartItem {
        const ci = new CartItem();
        ci.price = product.price;
        ci.sale_price = product.sale_price;
        ci.title = product.title;
        ci.subtitle = product.categories[0].title;
        ci.image = product.images[0];
        ci.product = product;
        ci.id = (product.vendor_products && product.vendor_products[0]) ? product.vendor_products[0].id : product.id;
        ci.setQuantity(1);
        return ci;
    }

    getCartItemFromFeatureProduct(product: Product): CartItem {
        let ci = new CartItem();
        ci.price = product.price;
        ci.sale_price = product.sale_price;
        ci.title = product.title;
        ci.subtitle = product.categories[0].title;
        ci.product = product;
        ci.id = (product.vendor_products && product.vendor_products[0]) ? product.vendor_products[0].id : product.id;
        ci.setQuantity(1);
        return ci;
    }

    // custom ORDERREQUEST implementation below

    getOrderRequest(): OrderRequest {
        this.orderRequest.products = [];
        for (const ci of this.expressCart.cartItems) this.orderRequest.products.push({
            id: ci.id,
            quantity: ci.quantity,
            dispatch_week: ci.week
        });
        if (this.orderMeta != null) this.orderRequest.meta = JSON.stringify(this.orderMeta);
        return this.orderRequest;
    }

    setupOrderRequestBase() {
        if (this.orderRequest == null) this.orderRequest = new OrderRequest();
        if (this.orderMeta == null) this.orderMeta = {};
    }

    setupOrderRequestAddress(address: MyAddress) {
        this.setupOrderRequestBase();
        this.orderRequest.address_id = address.id;
    }

    setupOrderRequestPaymentMethod(paymentMethod: PaymentMethod) {
        this.setupOrderRequestBase();
        this.orderRequest.payment_method_id = paymentMethod.id;
        this.orderRequest.payment_method_slug = paymentMethod.slug;
        this.orderRequest.delivery_date = Helper.getExpressPincode().slot1;
        this.orderRequest.express = 1;
    }

    setupCustomOrderRequestPaymentMethod(slug) {
        this.setupOrderRequestBase();
        this.orderRequest.payment_method_id = slug;
        this.orderRequest.payment_method_slug = slug;
        this.orderRequest.delivery_date = Helper.getExpressPincode().slot1;
        this.orderRequest.express = 1;
    }

    setupSubscriptionRequestPaymentMethod(subscriptionRequest: MembershipModel, paymentMethod: PaymentMethod) {
        subscriptionRequest.payment = new OrderPayment();
        subscriptionRequest.payment.payment_method = new PaymentMethod();
        subscriptionRequest.payment.id = paymentMethod.id;
        subscriptionRequest.payment.payment_method.slug = paymentMethod.slug;
        return subscriptionRequest;
    }

    setupOrderRequestMeta(key: string, value: string) {
        this.setupOrderRequestBase();
        this.orderMeta[key] = value;
    }

    getOrderRequestMetaKey(key: string): string {
        this.setupOrderRequestBase();
        return this.orderMeta[key] != null ? this.orderMeta[key] : null;
    }

    removeOrderRequestMeta(key: string) {
        this.setupOrderRequestBase();
        this.orderMeta[key] = null;
    }

    getAppointmentRequest(): ServiceRequest {
        if (this.serviceMeta != null) this.serviceRequest.meta = JSON.stringify(this.serviceMeta);
        return this.serviceRequest;
    }

    setupAppointmentRequestBase() {
        if (this.serviceRequest == null) this.serviceRequest = new ServiceRequest();
        if (this.serviceMeta == null) this.serviceMeta = {};
    }

    setupAppointmentRequestPaymentMethod(paymentMethod: PaymentMethod) {
        this.setupAppointmentRequestBase();
        this.serviceRequest.payment_method_id = paymentMethod.id;
        this.serviceRequest.payment_method_slug = paymentMethod.slug;
    }

    setupAppointmentRequest(serviceRequest: ServiceRequest) {
        if (this.serviceRequest == null) this.serviceRequest = serviceRequest;
    }

}
