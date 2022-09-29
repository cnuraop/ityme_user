import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ExpressOrderPlacedPageRoutingModule } from './express-order-placed-routing.module';

import { ExpressOrderPlacedPage } from './express-order-placed.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ExpressOrderPlacedPageRoutingModule
  ], providers: [InAppBrowser],
  declarations: [ExpressOrderPlacedPage]
})
export class ExpressOrderPlacedPageModule { }
