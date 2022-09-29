import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpressShopPage } from './express-shop.page';

const routes: Routes = [
  {
    path: '',
    component: ExpressShopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpressShopPageRoutingModule {}
