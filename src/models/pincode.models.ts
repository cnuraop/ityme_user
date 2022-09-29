export class MyPincode {
    id: number;
    pincode: string;
    user_id: number;
    title: string;
    address1: string;
    address2: string;
    formatted_address: string;
    longitude: string;
    latitude: string;

    static getPincodeToShow(myPincode: MyPincode): string {
        let toReturn = "";
        // if (myAddress.address1 && myAddress.address1.length) toReturn += myAddress.address1;
        // toReturn += " ";
        // if (myAddress.address2 && myAddress.address2.length) toReturn += myAddress.address2;
        // toReturn += " ";
        // if (myAddress.formatted_address && myAddress.formatted_address.length) toReturn += myAddress.formatted_address;
        if (myPincode.pincode && myPincode.pincode.length) toReturn += myPincode.pincode + " - " + myPincode.title;
        return toReturn.trim();
    }

    static testPincode(): MyPincode {
        let toReturn = new MyPincode();
        toReturn.latitude = "29.3036874";
        toReturn.longitude = "78.493881";
        return toReturn;
    }
}