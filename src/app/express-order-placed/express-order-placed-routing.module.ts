import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpressOrderPlacedPage } from './express-order-placed.page';

const routes: Routes = [
  {
    path: '',
    component: ExpressOrderPlacedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpressOrderPlacedPageRoutingModule {}
