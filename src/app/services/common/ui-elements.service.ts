import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UiElementsService {
  private overlay: any;

  constructor(private toastController: ToastController, private loadingController: LoadingController,
    private alertCtrl: AlertController, private translateService: TranslateService) { }

  presentToast(body: string, position?: string, duration?: number) {
    this.toastController.create({
      message: body,
      duration: (duration && duration > 0) ? duration : 1500,
      color:"success",
      position: (position && (position == "top" || position == "middle")) ? position : "bottom"
    }).then(toast => toast.present());
  }

  presentErrorAlert(msg: string, headingText?: string, actionText?: string) {
    this.translateService.get(["error", "dismiss"]).subscribe(values => {
      this.alertCtrl.create({
        header: (headingText ? headingText : values["error"]),
        message: msg,
        buttons: [(actionText ? actionText : values["dismiss"])]
      }).then(alert => alert.present());
    });
  }

  async presentLoading(body: string): Promise<boolean> {
    console.log('present loading', this.overlay)
    if (!this.overlay) {
      this.overlay = await this.loadingController.create({ 
        message: body,       
        duration: 2000
      });
     await this.overlay.present();
      return true;
    } else {
      this.overlay.message = body;
      return false;
    }
  }

  // presentLoading(body: string): boolean {
  //   if (!this.overlay) {
  //     this.overlay = this.loadingController.create({ message: body });
  //     this.overlay.present();
  //     return true;
  //   } else {
  //     this.overlay.message = body;
  //     return false;
  //   }
  // }


  async dismissLoading(): Promise<boolean> {
    //console.log('dismiss loading' + this.overlay);
    if (this.overlay) {
     // console.log('awaiting');
     this.overlay.dismiss();
     // console.log('awaited');
      this.overlay = null;
     // console.log('marked null');
      return true;
    } else {
      return false;
    }
  }

  alertCartConflict() {
    return new Promise((resolve, reject) => {
      this.translateService.get(["cart_conflict_title", "cart_conflict_message", "no", "yes"]).subscribe(values => {
        this.alertCtrl.create({
          header: values["cart_conflict_title"],
          message: values["cart_conflict_message"],
          buttons: [{
            text: values["no"],
            handler: () => resolve(false)
          }, {
            text: values["yes"],
            handler: () => resolve(true)
          }]
        }).then(alert => { alert.present(); alert.onDidDismiss().finally(() => reject(false)); });
      });
    });
  }

}
