import { InjectionToken } from "@angular/core";

export let APP_CONFIG = new InjectionToken<AppConfig>("app.config");

export interface FirebaseConfig {
    apiKey: string,
    authDomain: string,
    databaseURL: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    webApplicationId: string
}

export interface AppConfig {
    appName: string;
    apiBase: string;
    googleApiKey: string;
    oneSignalAppId: string;
    oneSignalGPSenderId: string;
    availableLanguages: Array<{ code: string, name: string }>;
    firebaseConfig: FirebaseConfig;
    defaultLocation: { location: { title: string, latitude: string, longitude: string, pincode: string }, use: boolean };
    defaultPincode: {pincode: {title: string, pincode: string, latitude: string, longitude: string }, use: boolean };
    agoraVideoConfig: { enableAgoraVideo: boolean, agoraAppId: string };
    demoMode: boolean;
}

export const BaseAppConfig: AppConfig = {
    appName: 'Jeevamrut',
    apiBase: 'https://admin.ityme.in/',
    // apiBase: 'http://localhost:8000/',
    googleApiKey: "AIzaSyBnfBcR77n4URrn2dv-vWnJAIiJwtQCX9M",
    oneSignalAppId: "b5616a03-b974-4799-8132-6ab76c32f53e",
    oneSignalGPSenderId: "207933413299",
    agoraVideoConfig: { enableAgoraVideo: true, agoraAppId: "a9981ef6d4bd4fc69399b02db4d2a0fb" },
    defaultLocation: { location: { title: "Telangana, Hyderabad", latitude: "17.4904512", longitude: "78.3415964", pincode: "585414" }, use: true },
    defaultPincode: { pincode: {title: "Telangana, Hyderabad", pincode: "585414",  latitude: "17.863192", longitude: "77.2784364" }, use: true},
    availableLanguages: [{
        code: 'en',
        name: 'English'
    }, {
        code: 'ar',
        name: 'Arabic'
    }, {
        code: 'fr',
        name: 'French'
    }, {
        code: 'es',
        name: 'Spanish'
    }, {
        code: 'id',
        name: 'Indonesian'
    }, {
        code: 'pt',
        name: 'Portuguese'
    }, {
        code: 'tr',
        name: 'Turkish'
    }, {
        code: 'it',
        name: 'Italian'
    }, {
        code: 'sw',
        name: 'Swahili'
    }],
    demoMode: false,
    firebaseConfig: {
        webApplicationId: "207933413299-cmckftj38id0f8urub5tcujtmkb6tr7h.apps.googleusercontent.com",
        apiKey: "AIzaSyBnfBcR77n4URrn2dv-vWnJAIiJwtQCX9M",
        authDomain: "ityme-4f997.firebaseapp.com",
        databaseURL: "https://ityme-4f997-default-rtdb.firebaseio.com",
        projectId: "ityme-4f997",
        storageBucket: "ityme-4f997.appspot.com",
        messagingSenderId: "207933413299"
    }
};