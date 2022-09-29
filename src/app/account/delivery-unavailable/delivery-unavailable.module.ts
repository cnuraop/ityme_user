import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryUnavailablePageRoutingModule } from './delivery-unavailable-routing.module';

import { DeliveryUnavailablePage } from './delivery-unavailable.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryUnavailablePageRoutingModule
  ],
  declarations: [DeliveryUnavailablePage]
})
export class DeliveryUnavailablePageModule {}
