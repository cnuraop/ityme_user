import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryUnavailablePage } from './delivery-unavailable.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryUnavailablePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryUnavailablePageRoutingModule {}
