import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpressOrderPlacedPage } from './express-order-placed.page';

describe('ExpressOrderPlacedPage', () => {
  let component: ExpressOrderPlacedPage;
  let fixture: ComponentFixture<ExpressOrderPlacedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpressOrderPlacedPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressOrderPlacedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
