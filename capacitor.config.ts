import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'doctoWorld',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      'android-targetSdkVersion': '30',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      ShowSplashScreenSpinner: 'false',
      FadeSplashScreen: 'true',
      AutoHideSplashScreen: 'true',
      orientation: 'portrait'
    }
  }
};

export default config;
