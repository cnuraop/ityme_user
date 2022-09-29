import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SeasonalItemsPage } from './seasonal-items.page';

describe('SeasonalItemsPage', () => {
  let component: SeasonalItemsPage;
  let fixture: ComponentFixture<SeasonalItemsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonalItemsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonalItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
