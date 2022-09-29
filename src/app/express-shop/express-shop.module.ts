import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ExpressShopPageRoutingModule } from './express-shop-routing.module';

import { ExpressShopPage } from './express-shop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ExpressShopPageRoutingModule
  ],
  declarations: [ExpressShopPage]
})
export class ExpressShopPageModule { }
