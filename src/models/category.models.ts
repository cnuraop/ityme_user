export class Category {
    id: number;
    parent_id: number;
    title: string;
    slug: string;
    meta: any;
    mediaurls: { images: Array<any> };
    reference: string;
    image: string;
    details:string;
}