export class PaymentMethod {
    id: number;
    enabled: number;
    slug: string;
    title: string;
    created_at: string;
    updated_at: string;
    meta: any;
    sr_no: number;
}

export class RazorPayment {
    id: number;
    amount:string;
    razorpay_signature: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
}