---
title: "DoctoWorld Installation Documentation"
keywords: 
sidebar: 
hide_sidebar: true
toc: false
search: false
permalink: index.html
summary: Technical information to help you setup mobile application of DoctoWorld - doctors appointment / medi shop Delivery App.
---
<div class="row">
  <div class="col-md-6 section-col">
    <h2 id="mobile-title" class="section-title">Instructions for building android mobile app</h2>
    <p>Following section explains how to connect Andrioid App to server and built it properly</p>
  </div>
  <div class="col-md-6">
    <section id="footer-cta" class="hasAnim on" data-offset="100">
      <div class="bg-wrap">
        <div class="background cn basic-scaler">
          <!-- animations -->

          <div class="blob part" data-num="1"><img src="https://cognitohq.com/wp-content/themes/cognito/images/parts/footer-blob1.svg"></div>

          <div class="part main"><img src="https://cognitohq.com/wp-content/themes/cognito/images/parts/footer-cta.svg"></div>      

          <div class="part main"><img src="https://cognitohq.com/wp-content/themes/cognito/images/parts/footer-girl@2x.png"></div>

          <div class="blob part" data-num="2"><img src="https://cognitohq.com/wp-content/themes/cognito/images/parts/footer-blob2.svg"></div>
          <div class="man part"><img src="https://cognitohq.com/wp-content/themes/cognito/images/parts/footer-man@2x.png"></div>

          <!-- end animations -->
        </div>
      </div>    
    </section>
  </div>  
</div>
<div markdown="1">
1. ### Setup Firebase and Api keys
    - Login to http://console.firebase.google.com
    - Click on "Add project" to add new project -> provide project name as you like and hit Create Project.
    - Now you have to Register apps in this project. Click "Add app" -> choose platform Android
    - Each app has its unique ID known as "Package name" or "ApplicationId" (sane as `config.xml` line no 2 i.e.`id`). For more info on how to name one visit [https://developer.android.com/studio/build/application-id](https://developer.android.com/studio/build/application-id)
    - Enter package name as asked on firebase console(once for User app, Doctor app, Seller app and Delivery app. ps-sequence doesnt matter).
    - Set a nickname(optional, but we'll add total of three apps so..)
    - Enter your app signing certificate(Optional but important in order to make features work like social login and otp verification. here is how to have one -> https://developers.google.com/android/guides/client-auth)
    - Click Register app. Upon succesful registration of app you'll be provided with your configuration file(google-services.json) for that app.
    - `SHA-1` keys - Enter your debug or release SHA-1 key depending on your build type(debug or release). Refer [https://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate](https://stackoverflow.com/questions/15727912/sha-1-fingerprint-of-keystore-certificate) for help.
    - Next click continue or skip to proceed and Repeat this step 2 more times to register app for Doctor application, Seller application and Delivery application
    - Upon registering 4 applications in your firebase project you should have 4 applicationIds and 4 configuration files(google-services.json).
    - `Authentication` - To select tab `Sign-in method`, to Enable `Phone, Google and facebook` auth from Authentication in side menu.
    - `Facebook` - To setup `Facebook` and enable in firebase Authentication. refer [https://ionicframework.com/docs/native/facebook](https://ionicframework.com/docs/native/facebook).
    - `Realtime Database` - Enable `Realtime Database` in Test Mode from Realtime Database in side menu. We recommend that you enter some random value in here so that i doesn't reset.
    - `Storage` - Enable Storage from from side menu. When asked for databse rules enter following.
    ``````````````````````````````
      rules_version = '2';
      service firebase.storage {
        match /b/{bucket}/o {
          match /{allPaths=**} {
            allow read, write;
          }
        }
      }
      
    ``````````````````````````````
    - if any issue for firebase setup visit [https://medium.com/better-programming/how-to-set-up-a-database-with-firebase-firestore-to-use-with-android-architecture-components-992ab5df8223](https://medium.com/better-programming/how-to-set-up-a-database-with-firebase-firestore-to-use-with-android-architecture-components-992ab5df8223)
    - Now for api keys visit [https://console.cloud.google.com/cloud-resource-manager](https://console.cloud.google.com/cloud-resource-manager).
    - Select the project you just created in firebase
    - Navigate to "Api and Services" section and click "Library"
    - Now Search and Enable 4 apis -> maps javascript api, places api, directions api and geocoding api.
2. ### Download/Setup NodeJs and Ionic
    - Install Node.js version 13.14.0 on your system [https://nodejs.org/en/blog/release/v13.14.0/](https://nodejs.org/en/blog/release/v13.14.0/). Verify installattion by running `node -v` you should see version 13.14.0 output.
    - Install ionic 5.4.16 -> `npm install -g ionic@5.4.16`
    - Install cordova for platform builds -> `npm install -g cordova@10.0.0`
3. ### Setup/Run project
    - Add configuration files(google-services.json) aquired from step 1 into respective project's app folder.
    - Basic configuration requires 3 files to be edited. -> `config.xml`, `src/app/app.config.ts` and `package.json`.
    - `config.xml` has two values. Your application's package name/application id in id parameter in line no. 2. and application name in line number 3.
    - `app.config.ts` includes all other necessary variables. Let's look at each of them.

      - `appName` Here you put in your app name, this one is used to display app's name inside the app.
      - `apiBase` Here comes your backend/server/api integration. Fill in your api base url. For example -> `apiBase: "https://yourdomain.com/"`
      - `googleApiKey` This is used for google maps services. Go to your Project in firebase console. Go to settings - General tab and copy `Web API Key` and paste in here.
      - `oneSignalAppId` Register your apps here [https://app.onesignal.com/](https://app.onesignal.com/) (3 - user's, store's and delivery guy's application). Get respective OneSignal app ID's to copy in here.
      - `oneSignalGPSenderId` This is used for google maps services. Go to your Project in firebase console. Go to settings - Cloud Messaging tab and copy `Sender ID` and paste in here.
      - `firebaseConfig` Used for firebase realtime database, google authentication and phone authentication. See this for setup instructions [https://firebase.google.com/docs/web/setup#config-object](https://firebase.google.com/docs/web/setup#config-object).

   - `package.json` includes all other necessary veriables. let's look this.
      - `cordova-plugin-googleplus` has two values. Your googleplus `WEB_APPLICATION_CLIENT_ID` same as `webApplicationId` from `src/app/app.config.ts`. and `REVERSED_CLIENT_ID` reverse of `WEB_APPLICATION_CLIENT_ID`.
      - `cordova-plugin-facebook4` has two values. Your facebook APP_ID (copy your app ID) and APP_NAME (copy your Display Name). refer [https://ionicframework.com/docs/native/facebook](https://ionicframework.com/docs/native/facebook).
   
4. ### Running Project
    - **Requires Step 2: Download/Setup NodeJs and Ionic**
    - Open your desired terminal and navigate to the source folder.
    - run `npm install` to install project dependencies.
    - then run `ionic serve` to run your project in browser.
5. ### Android Builds
    - Download and install Java here: [https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)
    - Android SDK setup. We recommend installing `Android Studio` for easy setup. [https://developer.android.com/studio/](https://developer.android.com/studio/)
    - To add platform run `ionic cordova add platform android`
    - To prepare platform run `ionic cordova prepare android`
    - To build debuggable .apk file run `ionic cordova build android --prod`
    - To build release unsigned .apk file run `ionic cordova build android --prod --release`
    - To generate a `Keystore` refer this. [https://stackoverflow.com/questions/11446121/how-do-i-generate-a-keystore-for-google-play](https://stackoverflow.com/questions/11446121/how-do-i-generate-a-keystore-for-google-play)
    - To sign builds and publishing refer this. [https://ionicframework.com/docs/deployment/play-store](https://ionicframework.com/docs/deployment/play-store)
6. ### Deploy App
    Deploying apps on Google Play Store and Apple App Store is out of the scope of this document.
    Kindly refer to this [guide](https://ionicframework.com/docs/intro/deploying/) for further instructions.

**Note: If you are unable to understand any topic or find any topic needs more elaboration. 
Please raise an issue ticket at this link [https://opuslabs.freshdesk.com](https://opuslabs.freshdesk.com)**
</div>