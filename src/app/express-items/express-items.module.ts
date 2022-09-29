import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
 
import { IonicModule } from '@ionic/angular';

import { ExpressItemsPageRoutingModule } from './express-items-routing.module';

import { ExpressItemsPage } from './express-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,    
    ExpressItemsPageRoutingModule
  ],
  declarations: [ExpressItemsPage]
})
export class ExpressItemsPageModule {}
