import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { UiElementsService } from '../services/common/ui-elements.service';
import { ApiService } from '../services/network/api.service';
import { Category } from 'src/models/category.models';
import { Subscription } from 'rxjs';
import { Constants } from 'src/models/constants.models';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss']
})
export class CategoriesPage implements OnInit {
  private subscriptions = new Array<Subscription>();
  categories: Array<Category>;
  categoriesSub = new Array<Category>();
  category_id: number;
  isLoading = true;
  tab: string = "otc";

  constructor(private router: Router, private navCtrl: NavController, private translate: TranslateService,
    private uiElementService: UiElementsService, private apiService: ApiService) {
    console.log("getCurrentNavigation", this.router.getCurrentNavigation().extras.state);
    if (this.router.getCurrentNavigation().extras.state) {
      this.categories = this.router.getCurrentNavigation().extras.state.categories;
      this.category_id = this.router.getCurrentNavigation().extras.state.category_id;

      this.translate.get("loading").subscribe(value => { this.uiElementService.presentLoading(value); this.loadSubCategories(); });
    }
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    for (let sub of this.subscriptions) sub.unsubscribe();
    this.uiElementService.dismissLoading();
  }

  segmentChanged(event) {
    this.categoriesSub = [];
    this.translate.get("loading").subscribe(value => { console.log(value); this.uiElementService.presentLoading(value); this.loadSubCategories(); });
  }

  loadSubCategories() {
    this.subscriptions.push(this.apiService.getCategoriesSub(this.category_id).subscribe(res => {
      console.log('load sub categories loading', this.category_id);
      this.categoriesSub = res;
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }, err => {
      console.log("getCategoriesSub", err);
      this.uiElementService.dismissLoading();
      this.isLoading = false;
    }));
  }

  listProducts(cat: Category) {
    let navigationExtras: NavigationExtras = { state: { category: cat } };
    this.navCtrl.navigateForward(['./product-list'], navigationExtras);
  }

}
