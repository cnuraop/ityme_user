import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountPage } from './account.page';

const routes: Routes = [
  {
    path: '',
    component: AccountPage
  },  {
    path: 'delivery-unavailable',
    loadChildren: () => import('./delivery-unavailable/delivery-unavailable.module').then( m => m.DeliveryUnavailablePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountPageRoutingModule {}
