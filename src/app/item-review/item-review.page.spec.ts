import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemReviewPage } from './item-review.page';

describe('ItemReviewPage', () => {
  let component: ItemReviewPage;
  let fixture: ComponentFixture<ItemReviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemReviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemReviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
