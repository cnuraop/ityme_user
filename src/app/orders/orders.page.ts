import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationExtras} from '@angular/router';
import {Order} from 'src/models/order.models';
import {Subscription} from 'rxjs';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {UiElementsService} from '../services/common/ui-elements.service';
import {ApiService} from '../services/network/api.service';
import {User} from 'src/models/user.models';
import {Helper} from 'src/models/helper.models';
import * as firebase from 'firebase/app';
import {DatePipe} from '@angular/common'
import {Product} from 'src/models/product.models';
import {ECommerceService} from '../services/common/ecommerce.service';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.page.html',
    styleUrls: ['./orders.page.scss']
})
export class OrdersPage implements OnInit {
    private once = false;
    private subscriptions = new Array<Subscription>();
    orders = new Array<Order>();
    isLoading = true;
    private pageNo = 1;
    private doneAll = false;
    private infiniteScrollEvent;
    private refresherEvent;
    private myOrdersRef: firebase.database.Reference;
    userMe: User;

    constructor(private navCtrl: NavController, private translate: TranslateService,
                private uiElementService: UiElementsService, private apiService: ApiService,
                public eComService: ECommerceService,
                public datepipe: DatePipe) {
    }

    ngOnInit() {
        this.userMe = Helper.getLoggedInUser();
    }

    ionViewDidEnter() {
        if (!this.once) {
            if (this.userMe != null) {
                this.translate.get('loading').subscribe(value => {
                    this.uiElementService.presentLoading(value);
                    this.getOrders();
                });
            } else {
                this.isLoading = false;
                this.alertLogin();
            }
        }
        this.once = true;
    }

    ionViewWillLeave() {
        this.unRegisterUpdates();
        for (let sub of this.subscriptions) sub.unsubscribe();
        this.uiElementService.dismissLoading();
    }

    doRefresh(event) {
        this.refresherEvent = event;
        this.pageNo = 1;
        this.orders = [];
        this.isLoading = true;
        this.translate.get('loading').subscribe(value => {
            this.unRegisterUpdates();
            this.uiElementService.presentLoading(value);
            this.getOrders();
        });
    }

    getOrders() {
        this.apiService.getOrdersSimplified(this.pageNo).subscribe(res => {
            console.log(res.data);
            if ((!this.orders || !this.orders.length) && res.data && res.data.length) this.registerUpdates();
            this.isLoading = false;

            this.orders = this.orders.concat(res.data);
            this.doneAll = (!res.data || !res.data.length);
            console.log(this.orders);
            this.reFilter();
            this.uiElementService.dismissLoading();
            this.uiElementService.dismissLoading();
            if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
            if (this.refresherEvent) this.refresherEvent.target.complete();
        }, err => {
            // console.log("getOrders", err);
            this.isLoading = false;
            if (this.infiniteScrollEvent) this.infiniteScrollEvent.target.complete();
            if (this.refresherEvent) this.refresherEvent.target.complete();
            this.uiElementService.dismissLoading();
            this.uiElementService.dismissLoading();
        });
    }

    doInfinite(event) {
        if (this.doneAll) {
            event.target.complete();
        } else {
            this.infiniteScrollEvent = event;
            this.pageNo = this.pageNo + 1;
            this.getOrders();
        }
    }

    updateStatusOnId(oId: number, oNew: Order) {
        let index = -1;
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id == oId) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            this.orders[index].status = oNew.status;
            if (oNew.delivery != null) {
                oNew.delivery.delivery.user.image_url = 'assets/images/empty_dp';
                if (!oNew.delivery.delivery.user.mediaurls || !oNew.delivery.delivery.user.mediaurls.images) oNew.delivery.delivery.user.mediaurls = {images: []};
                for (let imgObj of oNew.delivery.delivery.user.mediaurls.images) if (imgObj['default']) {
                    oNew.delivery.delivery.user.image_url = imgObj['default'];
                    break;
                }
                this.orders[index].delivery = oNew.delivery;
            }
            this.reFilter();
        }
    }

    registerUpdates() {
        const component = this;
        if (this.myOrdersRef == null) {
            this.myOrdersRef = firebase.database().ref('users').child(this.userMe.id).child('orders');
            this.myOrdersRef.on('child_changed', function (data) {
                var fireOrder = data.val() as { data: Order };
                if (fireOrder.data != null) component.updateStatusOnId(fireOrder.data.id, fireOrder.data);
            });
        }
    }

    unRegisterUpdates() {
        if (this.myOrdersRef != null) {
            this.myOrdersRef.off();
            this.myOrdersRef = null;
        }
    }

    private updateOrderInList(orderIn: Order) {
        let index = -1;
        for (let i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id == orderIn.id) {
                index = i;
                break;
            }
        }
        if (index != -1) this.orders[index] = orderIn;
    }

    private reFilter() {
        let orderProgress = new Order();
        orderProgress.id = -1;
        orderProgress.order_type = 'in_process';
        let orderPast = new Order();
        orderPast.id = -2;
        orderPast.order_type = 'past';

        let statusesPast = 'cancelled,rejected,refund,failed,complete';

        let allOrders = new Array<Order>();
        allOrders.push(orderProgress);
        for (let order of this.orders) if (order.id && order.id > 0 && !statusesPast.includes(order.status)) allOrders.push(order);
        allOrders.push(orderPast);
        for (let order of this.orders) if (order.id && order.id > 0 && statusesPast.includes(order.status)) allOrders.push(order);

        if (allOrders[1].id < 0) allOrders.splice(0, 1);
        if (allOrders[allOrders.length - 1].id < 0) allOrders.splice(allOrders.length - 1, 1);
        this.orders = allOrders.length ? allOrders : [];
    }

    alertLogin() {
        this.translate.get('alert_login_short').subscribe(value => this.uiElementService.presentToast(value));
        this.navCtrl.navigateForward(['./sign-in']);
    }

    navOrderDetail(order) {
        this.apiService.getOneOrder(order.id).subscribe(res => {
            console.log(res.data);
            const navigationExtras: NavigationExtras = {state: {order: res.data[0]}};
            this.navCtrl.navigateForward(['./orders-info'], navigationExtras);
        });
    }

    navReviewProduct(order: Order) {
        let checkReviewsStatus = false;
        order.products.map((element) => {
            if (!element.vendor_product.product.reviewed) {
                checkReviewsStatus = true;
            }
        })
        if (checkReviewsStatus) {
            let navigationExtras: NavigationExtras = {state: {orderId: order.id}};
            this.navCtrl.navigateForward(['./item-review'], navigationExtras);
        } else {
            this.translate.get('review_done').subscribe(value => this.uiElementService.presentToast(value));
        }

    }

    RepeatOrder(order: Order) {

        let orderProducts = order.products;

        orderProducts.forEach(element => {
            // this.addProCart(element);
        });

    }

    // SetupProduct(orderProduct: OrderProduct){

    // }

    addProCart(pro: Product) {
        let added = this.eComService.addOrIncrementCartItem(this.eComService.getCartItemFromProduct(pro));
        if (added == -1) {
            //Cart Conflict is case when products are added from multiple vendors, In our case it creates multiple order
            this.uiElementService.alertCartConflict().then(res => {
                if (res) {
                    this.eComService.clearCart();
                    this.addProCart(pro);
                }
            });
        }
    }

    quantityProCart(pro: Product) {
        return this.eComService.quantityCartItem(this.eComService.getCartItemFromProduct(pro));
    }


    ReOrder(order:Order){
        this.apiService.getOneOrder(order.id).subscribe(res => {
            console.log(res.data);
            const navigationExtras: NavigationExtras = {state: {order: res.data[0]}};
            this.navCtrl.navigateForward(['./reorder'], navigationExtras);
        });

        }

}
