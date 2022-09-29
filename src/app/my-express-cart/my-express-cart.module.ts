import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { MyExpressCartPageRoutingModule } from './my-express-cart-routing.module';

import { MyExpressCartPage } from './my-express-cart.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MyExpressCartPageRoutingModule
  ], providers: [PhotoViewer],
  declarations: [MyExpressCartPage]
})
export class MyExpressCartPageModule { }
