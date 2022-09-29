import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RegularShopPage } from './regular-shop.page';

describe('RegularShopPage', () => {
  let component: RegularShopPage;
  let fixture: ComponentFixture<RegularShopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegularShopPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RegularShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
