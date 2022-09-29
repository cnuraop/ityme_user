import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpressItemsPage } from './express-items.page';

describe('ExpressItemsPage', () => {
  let component: ExpressItemsPage;
  let fixture: ComponentFixture<ExpressItemsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpressItemsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
