import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmReorderPage } from './confirm-reorder.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmReorderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmReorderPageRoutingModule {}
