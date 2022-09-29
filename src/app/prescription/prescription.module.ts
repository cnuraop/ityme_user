import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { PrescriptionPageRoutingModule } from './prescription-routing.module';

import { PrescriptionPage } from './prescription.page';

import { Camera } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    PrescriptionPageRoutingModule
  ], providers: [Camera, Crop],
  declarations: [PrescriptionPage]
})
export class PrescriptionPageModule { }
