export class SupportRequest {
    name: string;
    email: string;
    message: string;
    user_id: string;
    mobile_number: string;
    report_category: string;
    constructor(name: string, email: string, user_id: string, mobile_number: string, report_category: string) {
        this.name = name;
        this.email = email;
        this.message = "";
        this.user_id = user_id;
        this.report_category = report_category;
        this.mobile_number = mobile_number;
    }
}