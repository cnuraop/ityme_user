import { Component, OnInit } from '@angular/core';
import { User } from 'src/models/user.models';
import { UiElementsService } from '../services/common/ui-elements.service';
import { FirebaseUploaderService } from '../services/network/firebase-uploader.service';
import { ApiService } from '../services/network/api.service';
import { Platform, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { MyEventsService } from '../services/events/my-events.service';
import { Helper } from 'src/models/helper.models';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.page.html',
  styleUrls: ['./my-profile.page.scss']
})
export class MyProfilePage implements OnInit {
  userMe: User;

  constructor(private uiElementService: UiElementsService, private fireUpService: FirebaseUploaderService,
    private apiService: ApiService, private platform: Platform, private cropService: Crop,
    private translate: TranslateService, private alertCtrl: AlertController, private camera: Camera, private myEvent: MyEventsService) {
    // setTimeout(() => {
    //   this.saveMe({ image_url: "https://i.picsum.photos/id/829/200/200.jpg?hmac=UR6WfoHy282eoIXjFzEm86pUeBNLQsX71BUthF-sOvM" });
    // }, 5000);
  }

  ngOnInit() {
    this.userMe = this.apiService.getUserMe();  
    if(this.userMe.email=='newuser@jeevamrut.in')
    this.userMe.email='';  
  }

  pickImage() {
    this.translate.get(["image_pic_header", "image_pic_subheader", "image_pic_camera", "image_pic_gallery"]).subscribe(values => {
      this.alertCtrl.create({
        header: values["image_pic_header"],
        message: values["image_pic_subheader"],
        buttons: [{
          text: values["image_pic_camera"],
          handler: () => {
            this.getImageCamera();
          }
        }, {
          text: values["image_pic_gallery"],
          handler: () => {
            this.getImageGallery();
          }
        }]
      }).then(alert => alert.present());
    });
  }

  getImageGallery() {
    const component = this;
    this.platform.ready().then(() => {
      if (this.platform.is("android")) {
        //{ "mime": "application/pdf" }  // text/plain, image/png, image/jpeg, audio/wav etc
        //(<any>window).fileChooser.open({ "mime": component.uploadType == 1 ? "image/jpeg" : "application/*" }, (uri) => component.resolveUri(uri), (err) => console.log("fileChooser", err)); // with mime filter
        (<any>window).fileChooser.open({ "mime": "image/*" }, (uri) => component.reduceImages(uri), (err) => console.log("fileChooser", err)); // with mime filter
      } else {
        let gpr = { maximumImagesCount: 1, disable_popover: 1 };
        (<any>window).imagePicker.getPictures(gpr).then((results) => {
          if (results && results[0]) this.reduceImages(results[0]);
        }, (err) => {
          console.log("getPictures", JSON.stringify(err));
        });
      }
    });
  }

  profilUpdate() {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (this.userMe.name.length < 6) {
      this.translate.get("err_valid_name").subscribe(value => this.uiElementService.presentToast(value));
     }
    else if (this.userMe.email.length <= 5 || !reg.test(this.userMe.email)) {
      this.translate.get("err_valid_email").subscribe(value => this.uiElementService.presentToast(value));
    } 
     else {
       this.saveMe();
     }
  }

  reduceImages(selected_pictures: string) {
    // return selected_pictures.reduce((promise: any, item: any) => {
    //   return promise.then((result) => {
    //     return this.cropService.crop(item, { quality: 100 }).then(cropped_image => this.uploadImage(cropped_image));
    //   });
    // }, Promise.resolve());
    this.cropService.crop(selected_pictures, { quality: 100 }).then(cropped_image => this.uploadImage(cropped_image));
  }

  getImageCamera() {
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.platform.is("android") ? this.camera.DestinationType.FILE_URI : this.camera.DestinationType.NATIVE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => this.reduceImages(imageData), (err) => {
      this.translate.get('camera_err').subscribe(value => this.uiElementService.presentToast(value, "top"));
      console.log("getPicture", JSON.stringify(err));
    });
  }

  uploadImage(imageUri) {
    this.translate.get(["uploading_image", "uploading_fail"]).subscribe(values => {
      this.uiElementService.presentLoading(values["uploading_image"]);
      this.fireUpService.resolveUriAndUpload(imageUri).then(res => {
        console.log("resolveUriAndUpload", res);
        this.uiElementService.dismissLoading();
        this.saveMe({ image_url: String(res) });
      }, err => {
        console.log("resolveUriAndUpload", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["uploading_fail"]);
      });
    });
  }

  saveMe(updateRequestIn?: any) {
    let uur = updateRequestIn != null ? updateRequestIn : { name: this.userMe.name, email:this.userMe.email };
    this.translate.get(["saving", "something_wrong"]).subscribe(values => {
      this.uiElementService.presentLoading(values["saving"]);

      this.apiService.updateUser(uur).subscribe(res => {
        this.uiElementService.dismissLoading();
        Helper.setLoggedInUser(res);
        this.myEvent.setUserMeData(res);
      }, err => {
        console.log("updateUser", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["something_wrong"]);
      });
    });
  }

}