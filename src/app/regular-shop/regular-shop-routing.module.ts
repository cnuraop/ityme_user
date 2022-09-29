import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegularShopPage } from './regular-shop.page';

const routes: Routes = [
  {
    path: '',
    component: RegularShopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegularShopPageRoutingModule {}
