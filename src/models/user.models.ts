export class User {
    id: string;
    active: number;
    confirmed: number;
    mobile_verified: number;
    fcm_registration_id: string;
    name: string;
    email: string;
    mobile_number: string;
    language: string;
    mediaurls: { images: Array<any> };
    pincode: string;
    image_url: string;
    referral_code:string;
}