import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ItemReviewPage } from './item-review.page';

const routes: Routes = [
  {
    path: '',
    component: ItemReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ItemReviewPageRoutingModule {}
