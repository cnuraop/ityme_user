import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReorderPageRoutingModule } from './reorder-routing.module';

import { ReorderPage } from './reorder.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReorderPageRoutingModule,
    TranslateModule
  ],
  declarations: [ReorderPage]
})
export class ReorderPageModule {}
