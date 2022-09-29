import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckDeliveryPage } from './check-delivery.page';

describe('CheckDeliveryPage', () => {
  let component: CheckDeliveryPage;
  let fixture: ComponentFixture<CheckDeliveryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckDeliveryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckDeliveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
