import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { SavedItemsPageRoutingModule } from './saved-items-routing.module';

import { SavedItemsPage } from './saved-items.page';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SavedItemsPageRoutingModule
  ],
  providers: [CallNumber, InAppBrowser],
  declarations: [SavedItemsPage]
})
export class SavedItemsPageModule { }
