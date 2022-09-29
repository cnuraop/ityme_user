import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeasonalItemsPage } from './seasonal-items.page';

const routes: Routes = [
  {
    path: '',
    component: SeasonalItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeasonalItemsPageRoutingModule {}
