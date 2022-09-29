import { Component, Inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Order, PaymentOrder } from 'src/models/order.models';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { AppConfig, APP_CONFIG } from '../app.config';
import { sha512 } from 'js-sha512';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ECommerceService } from '../services/common/ecommerce.service';
import { ApiService } from '../services/network/api.service';
import { OrderPayment } from 'src/models/order-payment.models';
import { Subscription } from 'rxjs';
import { DeliverySlot } from 'src/models/delivery-slot.models';
import { Helper } from 'src/models/helper.models';
import { PartialWalletPayment } from 'src/models/payout-request.models';
import { TestBed } from '@angular/core/testing';
import { PaymentMethod } from 'src/models/payment-method.models';
declare let fbq: Function;
@Component({
    selector: 'app-order-details',
    templateUrl: './order-details.page.html',
    styleUrls: ['./order-details.page.scss']
})
export class OrderDetailsPage implements OnInit {
    private subscriptions = new Array<Subscription>();
    currency_icon: string;
    input_order_status: string;
    input_payment_status:string;
    input_order_id: number;
    input_seasonal: number;
    input_express: number;
    orderDetails = new Array<PaymentOrder>();

    orders = Array<Order>();
    constructor(@Inject(APP_CONFIG) private config: AppConfig, private router: Router,
        private uiElementService: UiElementsService, private apiService: ApiService,
        private navCtrl: NavController, private inAppBrowser: InAppBrowser,
        private translate: TranslateService, private eComService: ECommerceService) {

    }

    toggleDetails(data) {
        if (data.showDetails) {
            data.showDetails = false;
            data.icon = 'add';
        } else {
            data.showDetails = true;
            data.icon = 'remove';
        }
    }
    ngOnInit() {
        this.currency_icon = Helper.getSetting("currency_icon");
        this.input_order_id = null;
    }

    ionViewDidEnter() {
        this.input_express=2;
        this.input_order_status="all";
        this.input_payment_status="all";
        this.input_order_id=0;
        this.input_seasonal=2;
        this.GetOrderDetails();
    }

    private GetOrderDetails() {


        this.translate.get("loading").subscribe(value => {
            this.uiElementService.presentLoading(value);
            this.subscriptions.push(this.apiService.getOrdersv2(this.input_order_status, this.input_payment_status, this.input_express, this.input_seasonal, this.input_order_id).subscribe(res => {
                this.orderDetails = res;
            }, err => {

            }));
        });
    }

    SearchOrders()
    {
        this.GetOrderDetails();
    }

    ionViewWillLeave() {
        this.uiElementService.dismissLoading();
        for (const sub of this.subscriptions) sub.unsubscribe();
    }

    SearchStatus(event) {
        this.input_order_status = event.detail.value;
        event.stopPropagation();
    }

    SearchRegex(event) {
        this.input_express = event.detail.value;
        event.stopPropagation();
    }

    SearchSeasonal(event) {
        this.input_seasonal = event.detail.value;
        event.stopPropagation();
    }

    navHome() {
        this.navCtrl.navigateRoot(['./tabs']);
    }

    navMyOrders() {
        this.navHome();
        setTimeout(() => this.navCtrl.navigateForward(['./orders']), 100);
    }

    navOrderDetail(order,orderDetail) {
        let navigationExtras: NavigationExtras = { state: { order: this.setupOrder(order,orderDetail) } };
        this.navCtrl.navigateForward(['./orders-info'], navigationExtras);
    }

    private setupOrder(order: Order,orderDetail: PaymentOrder) {

        order.created_at = Helper.formatTimestampDate(orderDetail.created_at, Helper.getSetting('locale'));
        order.scheduled_on = Helper.formatTimestampDate(Helper.getRegularPincode().slot1.toString(), Helper.getSetting('locale'));
        order.total_toshow = this.currency_icon + Number(order.total).toFixed(2);
        order.subtotal_toshow = this.currency_icon + Number(order.subtotal).toFixed(2);
        if (order.delivery_fee) order.delivery_fee_toshow = this.currency_icon + Number(order.delivery_fee).toFixed(2);
        if (order.discount) order.discount_toshow = this.currency_icon + Number(order.discount).toFixed(2);
        if (order.taxes) order.taxes_toshow = this.currency_icon + Number(order.taxes).toFixed(2);

        for (const product of order.products) {
            product.total_toshow = this.currency_icon + Number(product.total).toFixed(2);
        }
        
        order.payment=new OrderPayment();
        order.payment.payment_method=new PaymentMethod();
        order.payment.payment_method.title = orderDetail.payment_method_title;
        order.payment.payment_method.slug = orderDetail.slug;
        return order;

    }

    onSearchbarChange(event) {
        let query = "";
        if (event && event.detail && event.detail.value) query = event.detail.value.toLowerCase().trim();

        this.input_order_id = Number(query);

    }



}
