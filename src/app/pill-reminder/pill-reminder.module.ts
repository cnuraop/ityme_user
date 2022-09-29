import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { IonicModule } from '@ionic/angular';

import { PillReminderPageRoutingModule } from './pill-reminder-routing.module';

import { PillReminderPage } from './pill-reminder.page';

import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    PillReminderPageRoutingModule
  ],
  providers:[LocalNotifications],
  declarations: [PillReminderPage]
})
export class PillReminderPageModule { }
