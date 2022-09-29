import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { MyProfilePageRoutingModule } from './my-profile-routing.module';

import { MyProfilePage } from './my-profile.page';

import { Camera } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    MyProfilePageRoutingModule
  ], providers: [Camera, Crop],
  declarations: [MyProfilePage]
})
export class MyProfilePageModule { }
