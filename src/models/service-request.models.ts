// export class Apr{
//     amount: number;
//     date: string;
//     time_from: string;
//     time_to: string;
//     address: string;
//     latitude: number;
//     longitude: number;    
// }

// export class meta{
//     reason: string;
//     records: 
// }

export class ServiceRequest {
    doctor_id: number;
    appointment_id: number;
    payment_method_id: number;
    payment_method_slug: string;
    coupon_code: string;    
    meta: string;
    apr: {
        amount: number;
        date: string;
        time_from: string;
        time_to: string;
        address: string;
        latitude: string;
        longitude: string;
        meta: string;   
    };

    constructor() {
        
    }
}