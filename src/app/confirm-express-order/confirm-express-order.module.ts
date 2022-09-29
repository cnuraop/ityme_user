import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ConfirmExpressOrderPageRoutingModule } from './confirm-express-order-routing.module';

import { ConfirmExpressOrderPage } from './confirm-express-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,    
    ConfirmExpressOrderPageRoutingModule
  ],
  declarations: [ConfirmExpressOrderPage]
})
export class ConfirmExpressOrderPageModule {}
