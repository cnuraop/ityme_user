import { OrderPayment } from './order-payment.models';
import { User } from './user.models';
export class MembershipModel {
    id:number;
    plan_start_date:Date;
    plan_end_date:Date;  
    status: string;
    membershipPlan:Membership;
    payment:OrderPayment;
    user: User;
}

export class Membership {
    id:number;
    title: string;
    detail: string;
    image: string;
    free_delivery_express: number;
    reward:number;
    free_delivery_regular: number;
    discounts_regular: number;
    discounts_express: number;
    days: number;
    price: number;
}

export class MembershipObject{
    membership: MembershipModel;
}
