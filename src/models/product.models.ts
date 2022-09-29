import { Category } from './category.models';
import { ProductVendor } from './vendor-product.models';

export class Product {
    id: number;
    title: string;
    detail: string;
    meta: any;
    price: number;
    sale_price: number;
    ratings: number;
    ratings_count: number;
    owner: string; //admin,vendor
    parent_id: number;
    attribute_term_id: number;
    mediaurls: { images: Array<any> };
    created_at: string;
    updated_at: string;
    categories: Array<Category>;
    vendor_products: Array<ProductVendor>;
    is_favourite: boolean;
    promotion : string;
    priceToShow: string;
    sale_priceToShow: string;
    images: string[];
    prescription_required: boolean;
    reviewed: boolean;
    vendorText: string;
    stock_quantity: number;
    week:string;
    express: number;
    delivery_type: string;
}