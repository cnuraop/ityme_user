import { Category } from './category.models';
import { ProductVendor } from './vendor-product.models';

export class SeasonalProduct {
    
    title: string;
    detail: string;
    imageUrl:any;
    meta: Array<SeasonalProductMeta>;
    price:number;
    sale_price:number;
    stock_quantity:number;
    id:number;
    week:string;
    categories: Array<Category>;
}

export class SeasonalProductMeta
{
    id:number;
    week:string;
    stock_quantity:number;
    price:number;
    sale_price:number;

}