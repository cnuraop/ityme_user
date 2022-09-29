import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpressPaymentMethodPage } from './express-payment-method.page';

const routes: Routes = [
  {
    path: '',
    component: ExpressPaymentMethodPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpressPaymentMethodPageRoutingModule {}
