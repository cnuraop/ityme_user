import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmExpressOrderPage } from './confirm-express-order.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmExpressOrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmExpressOrderPageRoutingModule {}
