import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
   
import { IonicModule } from '@ionic/angular';

import { AddAddressPageRoutingModule } from './add-address-routing.module';

import { AddAddressPage } from './add-address.page';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { GoogleMapsService } from '../services/network/google-maps.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
 	TranslateModule,
    AddAddressPageRoutingModule
  ],
  providers: [Geolocation, Diagnostic, LocationAccuracy, GoogleMapsService],
  declarations: [AddAddressPage]
})
export class AddAddressPageModule {}
