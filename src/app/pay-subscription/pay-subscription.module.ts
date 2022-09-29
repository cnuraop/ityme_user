import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { PaySubscriptionPageRoutingModule } from './pay-subscription-routing.module';

import { PaySubscriptionPage } from './pay-subscription.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    PaySubscriptionPageRoutingModule
  ], providers: [InAppBrowser],
  declarations: [PaySubscriptionPage]
})
export class PaySubscriptionPageModule { }
