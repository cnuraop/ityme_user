export class OrderRequestNew {
    address_id: number;
    payment_method_id: number;
    payment_method_slug: string;
    coupon_code: string;
    delivery_date: string;
    express:number;
    seasonal:number;
    products: Array<{ id: number; quantity: number; dispatch_week:string; }>;
    meta: string;
    name: string;
    email:string;
    mobile_number:string;

    constructor() {
        this.products = new Array<{ id: number; quantity: number;dispatch_week:string; }>();
    }
}