import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckDeliveryPage } from './check-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: CheckDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckDeliveryPageRoutingModule {}
