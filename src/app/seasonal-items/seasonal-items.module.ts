import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
 
import { IonicModule } from '@ionic/angular';

import { SeasonalItemsPageRoutingModule } from './seasonal-items-routing.module';

import { SeasonalItemsPage } from './seasonal-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,    
    SeasonalItemsPageRoutingModule
  ],
  declarations: [SeasonalItemsPage]
})
export class SeasonalItemsPageModule {}
