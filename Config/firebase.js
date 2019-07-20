import * as firebase from "firebase";

var config = {
    apiKey: "AIzaSyB0374ITlSmhQ-gzt6iZXzfWB62AWkIezg",
    authDomain: "family-gps-tracker-18253.firebaseapp.com",
    databaseURL: "https://family-gps-tracker-18253.firebaseio.com",
    projectId: "family-gps-tracker-18253",
    storageBucket: "family-gps-tracker-18253.appspot.com",
    messagingSenderId: "880686802205"
};
firebase.initializeApp(config);

export default firebase