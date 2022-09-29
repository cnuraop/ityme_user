import { Component, OnInit } from '@angular/core';
import { Helper } from 'src/models/helper.models';
import { Reminder } from 'src/models/reminder.models';
import { NavController } from '@ionic/angular';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Component({
  selector: 'app-pill-reminders',
  templateUrl: './pill-reminders.page.html',
  styleUrls: ['./pill-reminders.page.scss']
})
export class PillRemindersPage implements OnInit {
  reminders = new Array<Reminder>();

  constructor(private navCtlr: NavController, private localNotifications: LocalNotifications) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.reminders = Helper.getReminders();
  }

  navNewReminder() {
    this.navCtlr.navigateForward(['./pill-reminder']);
  }

  deleteReminder(reminder: Reminder) {
    console.log("notificationIds", reminder.notificationIds);
    if (reminder && reminder.notificationIds) this.localNotifications.cancel(reminder.notificationIds);
    this.reminders = Helper.removeReminder(reminder);
  }

}
