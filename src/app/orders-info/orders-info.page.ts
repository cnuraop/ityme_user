import {Component, OnInit} from '@angular/core';
import {Router, NavigationExtras} from '@angular/router';
import {Order} from 'src/models/order.models';
import {NavController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {UiElementsService} from '../services/common/ui-elements.service';
import {Constants} from 'src/models/constants.models';
import {PhotoViewer} from '@ionic-native/photo-viewer/ngx';

@Component({
    selector: 'app-orders-info',
    templateUrl: './orders-info.page.html',
    styleUrls: ['./orders-info.page.scss']
})
export class OrdersInfoPage implements OnInit {
    order: Order;
    orderProgress = 0;
    fabAction = true;
    prescriptionLink: string;

    constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
                private uiElementService: UiElementsService, private photoViewer: PhotoViewer) {
    }

    ngOnInit() {
        if (this.router.getCurrentNavigation().extras.state) {
            this.order = this.router.getCurrentNavigation().extras.state.order;
            switch (this.order.status) {
                case 'cancelled':
                case 'refund':
                case 'hold':
                case 'rejected':
                case 'failed':
                case 'new':
                case 'pending':
                    this.orderProgress = 0;
                    break;
                case 'accepted':
                    this.orderProgress = 1;
                    break;
                case 'preparing':
                case 'prepared':
                case 'dispatched':
                case 'intransit':
                    this.orderProgress = 2;
                    break;
                case 'complete':
                    this.orderProgress = 3;
                    break;
            }
        }
    }

    toggleFab() {
        this.fabAction = !this.fabAction;
    }

    navTrackOrder() {
        if (this.canTrack()) {
            const navigationExtras: NavigationExtras = {
                state: {
                    delivery: this.order.delivery,
                    address: this.order.address,
                    vendor: {
                        name: this.order.vendor.name,
                        image: this.order.vendor.image,
                        location: {latitude: this.order.vendor.latitude, longitude: this.order.vendor.longitude}
                    }
                }
            };
            this.navCtrl.navigateForward(['./order-tracking'], navigationExtras);
        } else {
            this.translate.get('track_unavailable').subscribe(value => this.uiElementService.presentToast(value));
        }
    }

    canTrack(): boolean {
        return (this.order.status == 'dispatched' || this.order.status == 'intransit') && this.order.delivery != null;
    }

    viewPresciption() {
        this.photoViewer.show(this.prescriptionLink);
    }

}
