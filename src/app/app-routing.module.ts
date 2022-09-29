import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'custom-route',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./sign-in/sign-in.module').then(m => m.SignInPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'verification',
    loadChildren: () => import('./verification/verification.module').then(m => m.VerificationPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then(m => m.CategoriesPageModule)
  },
  {
    path: 'product-list',
    loadChildren: () => import('./product-list/product-list.module').then(m => m.ProductListPageModule)
  },
  {
    path: 'product-info',
    loadChildren: () => import('./product-info/product-info.module').then(m => m.ProductInfoPageModule)
  },
  {
    path: 'my-cart',
    loadChildren: () => import('./my-cart/my-cart.module').then(m => m.MyCartPageModule)
  },
  {
    path: 'regular-shop',
    loadChildren: () => import('./regular-shop/regular-shop.module').then(m => m.RegularShopPageModule)
  },
  {
    path: 'my-express-cart',
    loadChildren: () => import('./my-express-cart/my-express-cart.module').then(m => m.MyExpressCartPageModule)
  },
  {
    path: 'select-address',
    loadChildren: () => import('./select-address/select-address.module').then(m => m.SelectAddressPageModule)
  },
  {
    path: 'select-paymet-method',
    loadChildren: () => import('./select-paymet-method/select-paymet-method.module').then(m => m.SelectPaymetMethodPageModule)
  },
  {
    path: 'express-payment-method',
    loadChildren: () => import('./express-payment-method/express-payment-method.module').then(m => m.ExpressPaymentMethodPageModule)
  },
  {
    path: 'order-placed',
    loadChildren: () => import('./order-placed/order-placed.module').then(m => m.OrderPlacedPageModule)
  },
  {
    path: 'express-order-placed',
    loadChildren: () => import('./express-order-placed/express-order-placed.module').then(m => m.ExpressOrderPlacedPageModule)
  },
  {
    path: 'items',
    loadChildren: () => import('./items/items.module').then(m => m.ItemsPageModule)
  },
  {
    path: 'express-items',
    loadChildren: () => import('./express-items/express-items.module').then(m => m.ExpressItemsPageModule)
  },
  {
    path: 'seasonal-items',
    loadChildren: () => import('./seasonal-items/seasonal-items.module').then(m => m.SeasonalItemsPageModule)
  },
  {
    path: 'specilities',
    loadChildren: () => import('./specilities/specilities.module').then(m => m.SpecilitiesPageModule)
  },
  {
    path: 'map-view',
    loadChildren: () => import('./map-view/map-view.module').then(m => m.MapViewPageModule)
  },
  {
    path: 'filter',
    loadChildren: () => import('./filter/filter.module').then(m => m.FilterPageModule)
  },
  {
    path: 'doctor-profile',
    loadChildren: () => import('./doctor-profile/doctor-profile.module').then(m => m.DoctorProfilePageModule)
  },
  {
    path: 'add-feedback',
    loadChildren: () => import('./add-feedback/add-feedback.module').then(m => m.AddFeedbackPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./my-profile/my-profile.module').then(m => m.MyProfilePageModule)
  },
  {
    path: 'addresses',
    loadChildren: () => import('./addresses/addresses.module').then(m => m.AddressesPageModule)
  },
  {
    path: 'manage-addr',
    loadChildren: () => import('./manage-addresses/manage-addresses.module').then(m => m.ManageAddressesPageModule)
  },
  {
    path: 'add-address',
    loadChildren: () => import('./add-address/add-address.module').then(m => m.AddAddressPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./contact-us/contact-us.module').then(m => m.ContactUsPageModule)
  },
  {
    path: 'faqs',
    loadChildren: () => import('./faqs/faqs.module').then(m => m.FaqsPageModule)
  },
  {
    path: 'tnc',
    loadChildren: () => import('./tnc/tnc.module').then(m => m.TncPageModule)
  },
  {
    path: 'title',
    loadChildren: () => import('./title/title.module').then(m => m.TitlePageModule)
  },
  {
    path: 'seller-profile',
    loadChildren: () => import('./seller-profile/seller-profile.module').then(m => m.SellerProfilePageModule)
  },
  {
    path: 'prescription',
    loadChildren: () => import('./prescription/prescription.module').then(m => m.PrescriptionPageModule)
  },
  {
    path: 'pill-reminders',
    loadChildren: () => import('./pill-reminders/pill-reminders.module').then(m => m.PillRemindersPageModule)
  },
  {
    path: 'pill-reminder',
    loadChildren: () => import('./pill-reminder/pill-reminder.module').then(m => m.PillReminderPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
  },
  {
    path: 'order-details',
    loadChildren: () => import('./order-details/order-details.module').then(m => m.OrderDetailsPageModule)
  },
  {
    path: 'orders-info',
    loadChildren: () => import('./orders-info/orders-info.module').then(m => m.OrdersInfoPageModule)
  },
  {
    path: 'order-tracking',
    loadChildren: () => import('./order-tracking/order-tracking.module').then(m => m.OrderTrackingPageModule)
  },
  {
    path: 'saved-items',
    loadChildren: () => import('./saved-items/saved-items.module').then(m => m.SavedItemsPageModule)
  },
  {
    path: 'search-products',
    loadChildren: () => import('./search-products/search-products.module').then(m => m.SearchProductsPageModule)
  },
  {
    path: 'offers',
    loadChildren: () => import('./offers/offers.module').then(m => m.OffersPageModule)
  },
  {
    path: 'product-reviews',
    loadChildren: () => import('./product-reviews/product-reviews.module').then( m => m.ProductReviewsPageModule)
  },
  {
    path: 'confirm-order',
    loadChildren: () => import('./confirm-order/confirm-order.module').then( m => m.ConfirmOrderPageModule)
  },
  {
    path: 'confirm-express-order',
    loadChildren: () => import('./confirm-express-order/confirm-express-order.module').then( m => m.ConfirmExpressOrderPageModule)
  },
  {
    path: 'doctor-reviews',
    loadChildren: () => import('./doctor-reviews/doctor-reviews.module').then( m => m.DoctorReviewsPageModule)
  },
  {
    path: 'wallet',
    loadChildren: () => import('./wallet/wallet.module').then( m => m.WalletPageModule)
  },
  {
    path: 'item-review',
    loadChildren: () => import('./item-review/item-review.module').then( m => m.ItemReviewPageModule)
  },
  {
    path: 'send-to-bank',
    loadChildren: () => import('./send-to-bank/send-to-bank.module').then( m => m.SendToBankPageModule)
  },
  {
    path: 'add-money',
    loadChildren: () => import('./add-money/add-money.module').then( m => m.AddMoneyPageModule)
  },
  {
    path: 'pay-subscription',
    loadChildren: () => import('./pay-subscription/pay-subscription.module').then( m => m.PaySubscriptionPageModule)
  },
  {
    path: 'delivery-unavailable',
    loadChildren: () => import('./account/delivery-unavailable/delivery-unavailable.module').then( m => m.DeliveryUnavailablePageModule)
  },
  {
    
    path: 'check-delivery',
    loadChildren: () => import('./check-delivery/check-delivery.module').then( m => m.CheckDeliveryPageModule)
  
  },
  {
    path: 'reorder',
    loadChildren: () => import('./reorder/reorder.module').then( m => m.ReorderPageModule)
  },
  {
    path: 'confirm-reorder',
    loadChildren: () => import('./confirm-reorder/confirm-reorder.module').then( m => m.ConfirmReorderPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
