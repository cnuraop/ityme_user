import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TranslateModule,
    TabsPageRoutingModule
  ],
  providers: [Diagnostic, LocationAccuracy],
  declarations: [TabsPage]
})
export class TabsPageModule { }
