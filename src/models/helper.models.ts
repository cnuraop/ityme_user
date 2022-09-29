import { Constants } from './constants.models';
import { MyNotification } from './notification.models';
import { AuthResponse } from './auth-response.models';
import { MyMeta } from './meta.models';
import { MyAddress } from './address.models';
import { MyPincode } from './pincode.models';
import { User } from './user.models';
import { Category } from './category.models';
import { Reminder } from './reminder.models';
import * as moment from 'moment';
import { DeliverySlot } from './delivery-slot.models';

export class Helper {
    static setRegularPincode(deliverySlot: DeliverySlot) {
        window.localStorage.setItem(Constants.KEY_REGULAR, JSON.stringify(deliverySlot));
    }
    static setExpressPincode(deliverySlot: DeliverySlot) {
        window.localStorage.setItem(Constants.KEY_EXPRESS, JSON.stringify(deliverySlot));
    }

    static getRegularPincode() {
        let deliverySlot: DeliverySlot = JSON.parse(window.localStorage.getItem(Constants.KEY_REGULAR));
        return deliverySlot;
    }
    static getExpressPincode() {
        let deliverySlot: DeliverySlot = JSON.parse(window.localStorage.getItem(Constants.KEY_EXPRESS));
        return deliverySlot;
    }
    static getAgoraChannelId(id1: string, id2: string) {
        return id1 > id2 ? id1 + "_" + id2 : id2 + "_" + id1;
    }
    static formatPhone(phone: string): string {
        let toReturn = phone.replace(/\s/g, '');
        while (toReturn.startsWith("0")) toReturn = toReturn.substring(1);
        return toReturn;
    }
    static formatDistance(distance: number, distanceMetric: string): string {
        if (!distance) distance = 0;
        let divider: number = (distanceMetric == "km") ? 1000 : 1609.34;
        return Number(distance / divider).toFixed(2) + distanceMetric;
    }
    static setSearchHistory(sh: Array<string>, key: string) {
        window.localStorage.setItem((Constants.KEY_SEARCH_HISTORY + key), JSON.stringify(sh));
    }
    static getSearchHistory(key: string): Array<string> {
        let adl: Array<string> = JSON.parse(window.localStorage.getItem((Constants.KEY_SEARCH_HISTORY + key)));
        return (adl && adl.length) ? adl : new Array<string>();
    }
    static getReviewedProductIds(): Array<string> {
        let adl: Array<string> = JSON.parse(window.localStorage.getItem(Constants.KEY_REVIEWED_PRODUCTS));
        return (adl && adl.length) ? adl : new Array<string>();
    }
    static addReviewedProductId(id: string) {
        let adl: Array<string> = this.getReviewedProductIds();
        adl.push(id);
        window.localStorage.setItem(Constants.KEY_REVIEWED_PRODUCTS, JSON.stringify(adl));
    }
    static getReminders(): Array<Reminder> {
        let adl: Array<Reminder> = JSON.parse(window.localStorage.getItem(Constants.KEY_REMINDERS));
        return (adl && adl.length) ? adl : new Array<Reminder>();
    }
    static removeReminder(reminder: Reminder): Array<Reminder> {
        let reminders = this.getReminders();
        for (let i = 0; i < reminders.length; i++) {
            if (String(reminders[i].notificationIds) == String(reminder.notificationIds)) {
                reminders.splice(i, 1);
                break;
            }
        }
        window.localStorage.setItem(Constants.KEY_REMINDERS, JSON.stringify(reminders));
        return reminders;
    }
    static saveReminder(reminder: Reminder) {
        let reminders = this.getReminders();
        reminders.push(reminder);
        window.localStorage.setItem(Constants.KEY_REMINDERS, JSON.stringify(reminders));
    }
    static getLastReminderID(): number {
        let notiId = window.localStorage.getItem(Constants.KEY_REMINDER_LASTID);
        return (notiId != null) ? Number(notiId) : 0;
    }
    static setLastReminderID(latRemId: number) {
        window.localStorage.setItem(Constants.KEY_REMINDER_LASTID, String(latRemId));
    }
    static getCategoriesParent(): Array<Category> {
        let adl: Array<Category> = JSON.parse(window.localStorage.getItem(Constants.KEY_CATEGORIES_PARENT));
        return (adl && adl.length) ? adl : new Array<Category>();
    }
    static setCategoriesParent(cats: Array<Category>) {
        window.localStorage.setItem(Constants.KEY_CATEGORIES_PARENT, JSON.stringify(cats));
    }
    static setAddresses(addresses: Array<MyAddress>) {
        window.localStorage.setItem(Constants.KEY_ADDRESSES, JSON.stringify(addresses));
    }
    static getAddresses(): Array<MyAddress> {
        let adl: Array<MyAddress> = JSON.parse(window.localStorage.getItem(Constants.KEY_ADDRESSES));
        return (adl && adl.length) ? adl : new Array<MyAddress>();
    }
    static setSettings(settings: Array<MyMeta>) {
        window.localStorage.setItem(Constants.KEY_SETTINGS, JSON.stringify(settings));
    }
    static getSettings(): Array<MyMeta> {
        return JSON.parse(window.localStorage.getItem(Constants.KEY_SETTINGS));
    }
    static setLoggedInUser(user: User) {
        window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(user));
    }
    static setLoggedInUserResponse(authRes: AuthResponse) {
        window.localStorage.removeItem(Constants.KEY_USER);
        window.localStorage.removeItem(Constants.KEY_TOKEN);
        window.localStorage.removeItem(Constants.KEY_ADDRESS);
        window.localStorage.removeItem(Constants.KEY_DELIVERY_AVAILABILITY);
        window.localStorage.removeItem(Constants.KEY_ADDRESSES);
        window.localStorage.removeItem(Constants.KEY_NOTIFICATIONS);

        if (authRes && authRes.user && authRes.token) {
            window.localStorage.setItem(Constants.KEY_USER, JSON.stringify(authRes.user));
            window.localStorage.setItem(Constants.KEY_TOKEN, authRes.token);
        }
    }
    static getToken() {
        return window.localStorage.getItem(Constants.KEY_TOKEN);
    }
    static getLoggedInUser(): User {
        return JSON.parse(window.localStorage.getItem(Constants.KEY_USER));
    }
    static getAddressSelected(): MyAddress {
        return JSON.parse(window.localStorage.getItem(Constants.KEY_ADDRESS));
    }
    static getDeliveryAvailability(): string {
        let sl = window.localStorage.getItem(Constants.KEY_DELIVERY_AVAILABILITY);
        // if (sl == null || sl == "" || sl == undefined) {
        //     sl = "false";
        // }
        return sl;
    }
    static getLocale(): string {
        let sl = window.localStorage.getItem(Constants.KEY_LOCALE);
        return sl && sl.length ? sl : "en";
    }
    static getLanguageDefault(): string {
        return window.localStorage.getItem(Constants.KEY_DEFAULT_LANGUAGE);
    }
    static setLanguageDefault(language: string) {
        window.localStorage.setItem(Constants.KEY_DEFAULT_LANGUAGE, language);
    }
    static setLocale(lc) {
        window.localStorage.setItem(Constants.KEY_LOCALE, lc);
    }
    static setAddressSelected(location: MyAddress) {
        window.localStorage.setItem(Constants.KEY_ADDRESS, JSON.stringify(location));
    }
    static setDeliveryAvailability(data: string) {
        window.localStorage.setItem(Constants.KEY_DELIVERY_AVAILABILITY, data);
    }
    static getSetting(settingKey: string) {
        let settings: Array<MyMeta> = this.getSettings();
        let toReturn: string;
        if (settings) {
            for (let s of settings) {
                if (s.key == settingKey) {
                    toReturn = s.value;
                    break;
                }
            }
        }
        if (!toReturn) toReturn = "";
        return toReturn;
    }
    static getChatChild(userId: string, myId: string) {
        //example: userId="9" and myId="5" -->> chat child = "5-9"
        let values = [userId, myId];
        values.sort((one, two) => (one > two ? -1 : 1));
        return values[0] + "-" + values[1];
    }
    static saveNotification(notiTitle: string, notiBody: string, notiTime: string) {
        let notifications: Array<MyNotification> = JSON.parse(window.localStorage.getItem(Constants.KEY_NOTIFICATIONS));
        if (!notifications) notifications = new Array<MyNotification>();
        notifications.push(new MyNotification(notiTitle, notiBody, notiTime));
        window.localStorage.setItem(Constants.KEY_NOTIFICATIONS, JSON.stringify(notifications));
    }
    static formatMillisDateTimeWOYear(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("Do MMM, HH:mm");
    }
    static formatMillisDateTime(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("Do MMM YYYY, HH:mm");
    }
    static formatTimestampDateTime(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("Do MMM YYYY, HH:mm");
    }
    static formatMillisDate(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("Do MMM YYYY");
    }
    static formatTimestampDate(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("Do MMM YYYY");
    }
    static formatMillisTime(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("HH:mm");
    }
    static formatTimestampTime(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("HH:mm");
    }
}