import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import * as moment from 'moment';
import { Helper } from 'src/models/helper.models';
import { Reminder } from 'src/models/reminder.models';

@Component({
  selector: 'app-pill-reminder',
  templateUrl: './pill-reminder.page.html',
  styleUrls: ['./pill-reminder.page.scss']
})
export class PillReminderPage implements OnInit {
  pillTitle: string;
  pillDay: string;
  pillTimes: Array<{ dateIso: string; dateValue: string; }>;
  private lastNotiID: number;

  constructor(private navCtrl: NavController, private translate: TranslateService, private localNotifications: LocalNotifications,
    private uiElementService: UiElementsService, private alertCtrl: AlertController) {
    this.pillTitle = "";
    //this.pillDays = new Array<string>();
    let momentStart = moment();
    this.pillTimes = [{ dateIso: momentStart.format(), dateValue: momentStart.format("HH:mm") }];
  }

  ngOnInit() {
    this.lastNotiID = Helper.getLastReminderID();
    if (this.lastNotiID == null) this.lastNotiID = 0;
  }

  ionViewWillLeave() {
    // for (let sub of this.subscriptions) sub.unsubscribe();
    // this.uiElementService.dismissLoading();
  }

  addRemoveTime(index) {
    if (index == 0) {
      let momentNew = moment();
      this.pillTimes.push({ dateIso: momentNew.format(), dateValue: momentNew.format("HH:mm") });
    } else {
      this.pillTimes.splice(index, 1);
    }
  }

  confirmReminder() {
    if (!this.pillTitle || !this.pillTitle.length) {
      this.translate.get("err_field_pill_name").subscribe(value => this.uiElementService.presentToast(value));
    } else if (!this.pillDay || !this.pillDay.length) {
      this.translate.get("err_field_pill_days").subscribe(value => this.uiElementService.presentToast(value));
    } else {
      this.translate.get(["pill_reminder", "pill_reminder_confirm", "no", "yes"]).subscribe(values => {
        this.alertCtrl.create({
          header: values["pill_reminder"],
          message: values["pill_reminder_confirm"],
          buttons: [{
            text: values["no"],
            handler: () => {
              this.navCtrl.pop();
            }
          }, {
            text: values["yes"],
            handler: () => {
              this.scheduleNotifications();
            }
          }]
        }).then(alert => alert.present());
      });
    }
  }

  scheduleNotifications() {
    let myReminder = new Reminder();
    myReminder.title = this.pillTitle;
    myReminder.body = "";
    myReminder.subTitle = "";
    let time_pill = this.translate.instant("time_pill");
    let times = new Array<string>();
    for (let time of this.pillTimes) if (!times.includes(time.dateIso)) { times.push(time.dateIso); myReminder.body += (moment(time.dateIso).format("HH:mm") + ", "); }

    // for (let weekDay of this.pillDays) {
    //   let dayNum = 0; //0 = sunday
    //   switch (weekDay) {
    //     case "sun":
    //       myReminder.subTitle += "Sun, ";
    //       dayNum = 0;
    //       break;
    //     case "mon":
    //       myReminder.subTitle += "Mon, ";
    //       dayNum = 1;
    //       break;
    //     case "tue":
    //       myReminder.subTitle += "Tue, ";
    //       dayNum = 2;
    //       break;
    //     case "wed":
    //       myReminder.subTitle += "Wed, ";
    //       dayNum = 3;
    //       break;
    //     case "thu":
    //       myReminder.subTitle += "Thu, ";
    //       dayNum = 4;
    //       break;
    //     case "fri":
    //       myReminder.subTitle += "Fri, ";
    //       dayNum = 5;
    //       break;
    //     case "sat":
    //       myReminder.subTitle += "Sat, ";
    //       dayNum = 6;
    //       break;
    //   }

    //   let notifications = [];
    //   for (let time of times) {
    //     this.lastNotiID += 1;
    //     notifications.push({
    //       id: Number(0 + this.lastNotiID),
    //       title: this.pillTitle,
    //       text: time_pill,
    //       trigger: { every: { weekday: dayNum, hour: Number(moment(time).format("HH")), minute: Number(moment(time).format("mm")) } }
    //     });
    //     myReminder.notificationIds.push(Number(0 + this.lastNotiID));
    //   }
    //   this.localNotifications.schedule(notifications);
    // }

    let dayNum = 0; //0 = sunday
    switch (this.pillDay) {
      case "sun":
        myReminder.subTitle += "Sun, ";
        dayNum = 0;
        break;
      case "mon":
        myReminder.subTitle += "Mon, ";
        dayNum = 1;
        break;
      case "tue":
        myReminder.subTitle += "Tue, ";
        dayNum = 2;
        break;
      case "wed":
        myReminder.subTitle += "Wed, ";
        dayNum = 3;
        break;
      case "thu":
        myReminder.subTitle += "Thu, ";
        dayNum = 4;
        break;
      case "fri":
        myReminder.subTitle += "Fri, ";
        dayNum = 5;
        break;
      case "sat":
        myReminder.subTitle += "Sat, ";
        dayNum = 6;
        break;
    }

    for (let time of times) {
      this.lastNotiID += 1;
      this.localNotifications.schedule({
        id: Number(0 + this.lastNotiID),
        title: this.pillTitle,
        text: time_pill,
        trigger: {
          every: { weekday: dayNum, hour: Number(moment(time).format("HH")), minute: Number(moment(time).format("mm")) },
          count: 1
        }
      });
      myReminder.notificationIds.push(Number(0 + this.lastNotiID));
    }
    myReminder.subTitle = myReminder.subTitle.substring(0, myReminder.subTitle.length - 2);
    myReminder.body = myReminder.body.substring(0, myReminder.body.length - 2);
    Helper.saveReminder(myReminder);
    Helper.setLastReminderID(this.lastNotiID);
    this.translate.get("reminder_added").subscribe(value => this.uiElementService.presentToast(value));
    this.navCtrl.pop();
  }

}
