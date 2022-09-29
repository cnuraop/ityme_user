import { Helper } from "./helper.models";

export class DeliverySlot {
    delivery_time: string;
    isExpress: boolean;
    pincode: string;
    slot1: Date;
    slot2: Date;
    title: string;
    order_end_date:Date;
    order_end_time:number;
    whatshappening:string;
}

export class DeliverySlotListResponse {   
    data: Array<any>;
}