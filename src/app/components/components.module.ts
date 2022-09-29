import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomSlidesComponent} from './custom-slides/custom-slides.component'

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot(),
        RouterModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        CustomSlidesComponent
    ],
    exports: [
        
        CustomSlidesComponent
       
    ],
    entryComponents: [],
})
export class ComponentsModule {
}
