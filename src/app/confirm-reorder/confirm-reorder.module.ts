import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmReorderPageRoutingModule } from './confirm-reorder-routing.module';

import { ConfirmReorderPage } from './confirm-reorder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmReorderPageRoutingModule
  ],
  declarations: [ConfirmReorderPage]
})
export class ConfirmReorderPageModule {}
