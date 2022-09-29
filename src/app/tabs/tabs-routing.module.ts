import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [{
      path: 'home',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../home/home.module').then(m => m.HomePageModule)
        }
      ]
    }, {
      path: 'regular',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../regular-shop/regular-shop.module').then(m => m.RegularShopPageModule)
        }
      ]
    },{
      path: 'seasonal',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../seasonal-items/seasonal-items.module').then(m => m.SeasonalItemsPageModule)
        }
      ]
    },
    {
      path: 'contactus',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../contact-us/contact-us.module').then(m => m.ContactUsPageModule)
        }
      ]
    },
    {
      path: 'wallet',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../wallet/wallet.module').then(m => m.WalletPageModule)
        }
      ]
    },  {
      path: 'my_orders',
      children: [
        {
          path: '',
          loadChildren: () =>
            import('../orders/orders.module').then(m => m.OrdersPageModule)
        }
      ]
    }, {
      path: 'express',
      children: [
        {
          path: '',
          loadChildren: () =>
           // import('../account/account.module').then(m => m.AccountPageModule)
           import('../express-shop/express-shop.module').then(m => m.ExpressShopPageModule)
        }
      ]
    }, {
      path: '',
      redirectTo: '/tabs/home',
      pathMatch: 'full'
    }
    ]
  }, {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
