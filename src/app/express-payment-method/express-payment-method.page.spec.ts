import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpressPaymentMethodPage } from './express-payment-method.page';

describe('ExpressPaymentMethodPage', () => {
  let component: ExpressPaymentMethodPage;
  let fixture: ComponentFixture<ExpressPaymentMethodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpressPaymentMethodPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressPaymentMethodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
