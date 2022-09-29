import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { RegularShopPageRoutingModule } from './regular-shop-routing.module';

import { RegularShopPage } from './regular-shop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RegularShopPageRoutingModule
  ],
  declarations: [RegularShopPage]
})
export class RegularShopPageModule { }
