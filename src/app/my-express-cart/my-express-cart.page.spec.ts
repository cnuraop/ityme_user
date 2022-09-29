import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyExpressCartPage } from './my-express-cart.page';

describe('MyExpressCartPage', () => {
  let component: MyExpressCartPage;
  let fixture: ComponentFixture<MyExpressCartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyExpressCartPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyExpressCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
