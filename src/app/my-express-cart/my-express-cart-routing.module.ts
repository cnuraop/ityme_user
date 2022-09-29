import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyExpressCartPage } from './my-express-cart.page';

const routes: Routes = [
  {
    path: '',
    component: MyExpressCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyExpressCartPageRoutingModule {}
