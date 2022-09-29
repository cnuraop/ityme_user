import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpressShopPage } from './express-shop.page';

describe('ExpressShopPage', () => {
  let component: ExpressShopPage;
  let fixture: ComponentFixture<ExpressShopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExpressShopPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
