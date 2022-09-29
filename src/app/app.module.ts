import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { FilterPageModule } from './filter/filter.module';
import { TitlePageModule } from './title/title.module';
import { PrescriptionPageModule } from './prescription/prescription.module';

import { TranslateLoader, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_CONFIG, BaseAppConfig } from './app.config';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { File } from '@ionic-native/file/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Device } from '@ionic-native/device/ngx';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { VtPopupPageModule } from './vt-popup/vt-popup.module';
import {ComponentsModule} from './components/components.module';
import { DatePipe } from '@angular/common';
import { appCommonMethods } from 'src/app/services/common/appCommonMethods';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule,
    FilterPageModule,
    TitlePageModule,
    // Chat2PageModule,
    ComponentsModule,
    PrescriptionPageModule,
    VtPopupPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    OneSignal,
    File,
    Network,
    Device,
    InAppBrowser,
    DatePipe,
    { provide: APP_CONFIG, useValue: BaseAppConfig },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, appCommonMethods
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
