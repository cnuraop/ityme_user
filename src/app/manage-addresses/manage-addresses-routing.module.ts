import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAddressesPage } from './manage-addresses.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAddressesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAddressesPageRoutingModule {}
