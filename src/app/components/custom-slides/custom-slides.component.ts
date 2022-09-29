import {Component, Input} from '@angular/core';

@Component({
    selector: 'custom-slides',
    templateUrl: './custom-slides.component.html',
    styleUrls: ['./custom-slides.component.scss'],
})
export class CustomSlidesComponent {
    @Input() option: any;
    @Input() list: any;

    constructor() {
    }

}
