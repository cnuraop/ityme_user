import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ExpressPaymentMethodPageRoutingModule } from './express-payment-method-routing.module';

import { ExpressPaymentMethodPage } from './express-payment-method.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ExpressPaymentMethodPageRoutingModule
  ],
  declarations: [ExpressPaymentMethodPage]
})
export class ExpressPaymentMethodPageModule { }
