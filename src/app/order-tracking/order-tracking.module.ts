import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { OrderTrackingPageRoutingModule } from './order-tracking-routing.module';

import { OrderTrackingPage } from './order-tracking.page';

import { CallNumber } from '@ionic-native/call-number/ngx';
import { GoogleMapsService } from '../services/network/google-maps.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    OrderTrackingPageRoutingModule
  ],
  providers: [CallNumber, GoogleMapsService],
  declarations: [OrderTrackingPage]
})
export class OrderTrackingPageModule { }
