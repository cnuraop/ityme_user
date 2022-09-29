import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { OrdersInfoPageRoutingModule } from './orders-info-routing.module';

import { OrdersInfoPage } from './orders-info.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    OrdersInfoPageRoutingModule
  ], providers: [PhotoViewer],
  declarations: [OrdersInfoPage]
})
export class OrdersInfoPageModule { }
