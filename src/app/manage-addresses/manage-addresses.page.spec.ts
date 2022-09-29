import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManageAddressesPage } from './manage-addresses.page';

describe('ManageAddressesPage', () => {
  let component: ManageAddressesPage;
  let fixture: ComponentFixture<ManageAddressesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAddressesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageAddressesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
