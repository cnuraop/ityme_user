import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { FirebaseUploaderService } from '../services/network/firebase-uploader.service';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.page.html',
  styleUrls: ['./prescription.page.scss']
})
export class PrescriptionPage implements OnInit {

  constructor(private modalController: ModalController, private alertCtrl: AlertController, private camera: Camera,
    private translate: TranslateService, private cropService: Crop,
    private fireUpService: FirebaseUploaderService, private platform: Platform, private uiElementService: UiElementsService) {
    // setTimeout(() => {
    //   this.modalController.dismiss("https://i.picsum.photos/id/888/200/200.jpg?hmac=k4DxIkJ_O8YKi3TA5I9xxJYJzqpSvx3QmJlgZwHMojo");
    // }, 2000);
  }

  ngOnInit() {
  }

  cancel() {
    this.modalController.dismiss();
  }

  pickPrescription() {
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
    this.translate.get(["uploading_prescription", "uploading_fail"]).subscribe(values => {
      this.uiElementService.presentLoading(values["uploading_prescription"]);
      this.fireUpService.resolveUriAndUpload(imageUri).then(res => {
        console.log("resolveUriAndUpload", res);
        this.uiElementService.dismissLoading();
        let imageUrl = String(res);
        this.modalController.dismiss(imageUrl);
      }, err => {
        console.log("resolveUriAndUpload", err);
        this.uiElementService.dismissLoading();
        this.uiElementService.presentErrorAlert(values["uploading_fail"]);
      });
    });
  }

}
