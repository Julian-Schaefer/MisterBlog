// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://localhost:4999",
  firebase: {
    apiKey: "AIzaSyDLY466XtHAJhe3aX89RbueINfryvSQS-c",
    authDomain: "auth.misterblog.me",
    databaseURL: "https://blogify-cdb97.firebaseio.com",
    projectId: "blogify-cdb97",
    storageBucket: "blogify-cdb97.appspot.com",
    messagingSenderId: "797738042746",
    appId: "1:797738042746:web:f79a733cfc9cbad72802c3",
    measurementId: "G-V0GCNMMWW7"
  },
  domain: "localhost",
  gaTrackingCode: ''
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
