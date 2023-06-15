import {Item} from './0-Item.js'

export class Host extends Item {
  firebase = firebase;
  firebaseConfig = {
    apiKey: "AIzaSyCygBNBbRUdhXGIwsOnZiDKAGZx4PIDc6I",
    authDomain: "arta-vision-constructor.firebaseapp.com",
    projectId: "arta-vision-constructor",
    storageBucket: "arta-vision-constructor.appspot.com",
    messagingSenderId: "80353020616",
    appId: "1:80353020616:web:27f6d324e8f2624bf433fd",
    measurementId: "G-ZRVD2Z59JF"
  };
  db;
  constructor() {
    super();
    this.firebase.initializeApp(this.firebaseConfig);
    this.db = this.firebase.firestore();
    this.auth = this.firebase.auth()
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
      this.fire('user-state-changed', user);
    });
  }
  async getConfig() {
    const rootDomainsSnap = await this.db.collection('Domains').get();
    return rootDomainsSnap.docs;
  }
};
