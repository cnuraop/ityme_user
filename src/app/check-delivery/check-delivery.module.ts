import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { CheckDeliveryPageRoutingModule } from './check-delivery-routing.module';

import { CheckDeliveryPage } from './check-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
	TranslateModule,  
    CheckDeliveryPageRoutingModule
  ],
  declarations: [CheckDeliveryPage]
})
export class CheckDeliveryPageModule {}
