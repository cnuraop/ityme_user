import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs'; // For rxjs 6
import { User } from 'src/models/user.models';
import { MyAddress } from 'src/models/address.models';
import { MyPincode } from 'src/models/pincode.models';

@Injectable({
    providedIn: 'root'
})
export class MyEventsService {
    private customEvent = new Subject<string>();
    private selectedLanguage = new Subject<string>();
    private currentUser = new Subject<User>();
    private currentLocation = new Subject<MyAddress>();
    private currentPincode = new Subject<MyPincode>();
    private walletData = new Subject<string>();

    constructor() { }

    public getLanguageObservable(): Observable<string> {
        return this.selectedLanguage.asObservable();
    }

    public setLanguageData(data) {
        this.selectedLanguage.next(data);
    }

    public getUserMeObservable(): Observable<User> {
        return this.currentUser.asObservable();
    }

    public setUserMeData(data) {
        this.currentUser.next(data);
    }

    public setAddressData(data) {
        this.currentLocation.next(data);
    }

    public getAddressObservable(): Observable<MyAddress> {
        return this.currentLocation.asObservable();
    }

    public setCustomEventData(data: string) {
        this.customEvent.next(data);
    }

    public getCustomEventObservable(): Observable<string> {
        return this.customEvent.asObservable();
    }

    public setPincodeData(data) {
        this.currentPincode.next(data);
    }

    public getPincodeObservable(): Observable<MyPincode> {
        return this.currentPincode.asObservable();
    }

    public getWalletObservable(): Observable<string> {
        return this.walletData.asObservable();
    }

    public setWalletData(data) {
        this.walletData.next(data);
    }
}
