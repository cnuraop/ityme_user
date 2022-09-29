import { Component, OnInit } from '@angular/core';
import { Helper } from 'src/models/helper.models';
import { appCommonMethods } from '../services/common/appCommonMethods';

@Component({
  selector: 'app-tnc',
  templateUrl: './tnc.page.html',
  styleUrls: ['./tnc.page.scss']
})
export class TncPage implements OnInit {
  privacy_policy: string;

  constructor(public appCommonMethods: appCommonMethods) { }

  ngOnInit() {
    this.appCommonMethods.disableMenuSwiper();
    this.privacy_policy = Helper.getSetting("terms");
  }

}
