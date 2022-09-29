export class MyAddress {
    id: number;
    user_id: number;
    title: string;
    address1: string;
    address2: string;
    formatted_address: string;
    city:string;
    longitude: string;
    latitude: string;
    pincode: string;

    static getAddressToShow(myAddress: MyAddress): string {
        // let toReturn = "Deliver @: ";
        let toReturn = "";
        if (myAddress.pincode !=undefined && myAddress.pincode.length) 
        
        toReturn += myAddress.pincode;
        
        if (myAddress.address2 != undefined && myAddress.address2.length) {toReturn += ": ";
        toReturn += myAddress.address2;}
        
        if (myAddress.city !=undefined && myAddress.city.length){ toReturn += ", " ; toReturn += myAddress.city;
            }
        return toReturn.trim();
    }

    static getDetailedAddressToShow(myAddress: MyAddress): string {
        // let toReturn = "Deliver @: ";
        let toReturn = "";
         if (myAddress.address1 !=undefined && myAddress.address1.length) 
         toReturn += myAddress.address1;
         toReturn += ", ";
         if (myAddress.address2 != undefined && myAddress.address2.length) toReturn += myAddress.address2;
         toReturn += ", ";
         if (myAddress.city !=undefined && myAddress.city.length) toReturn += myAddress.city;
         toReturn += " ";
        if (myAddress.pincode !=undefined && myAddress.pincode.length) 
        toReturn += " "+ myAddress.pincode;
        //console.log(myAddress.latitude);
        //console.log(myAddress.longitude);
        return toReturn.trim();
    }

    static testAddress(): MyAddress {
        let toReturn = new MyAddress();
        toReturn.latitude = "17.4904512";
        toReturn.longitude = "78.3415964";
        toReturn.formatted_address="Hyderabad, Telangana";
        return toReturn;
    }
}