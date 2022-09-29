import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { ItemReviewPageRoutingModule } from './item-review-routing.module';

import { ItemReviewPage } from './item-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,     
    ItemReviewPageRoutingModule
  ],
  declarations: [ItemReviewPage]
})
export class ItemReviewPageModule {}
