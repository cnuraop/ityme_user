import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpressItemsPage } from './express-items.page';

const routes: Routes = [
  {
    path: '',
    component: ExpressItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpressItemsPageRoutingModule {}
