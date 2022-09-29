import { Injectable } from "@angular/core";
import { MenuController } from "@ionic/angular";

@Injectable()
export class appCommonMethods {
    constructor(public menu: MenuController) { }

    enableMenuSwiper() {
        this.menu.swipeGesture(true);
    }

    disableMenuSwiper() {
        this.menu.swipeGesture(false);
    }
}