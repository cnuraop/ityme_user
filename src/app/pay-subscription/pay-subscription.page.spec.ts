import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaySubscriptionPage } from './pay-subscription.page';

describe('PaySubscriptionPage', () => {
  let component: PaySubscriptionPage;
  let fixture: ComponentFixture<PaySubscriptionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaySubscriptionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PaySubscriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
