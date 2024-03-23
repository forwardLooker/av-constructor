import {Item} from './0-Item.js';
import {Class} from './3-Class.js';
import {Domain} from './2-Domain.js';

export class Host extends Item {
  constructor(hostElement) {
    super();
    this.$hostElement = hostElement;
    this.firebase.initializeApp(this.firebaseConfig);
    this.db = this.firebase.firestore();
    this.auth = this.firebase.auth()
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        // this.user = user;
        Item.user = user;
      } else {
        // this.user = null;
        Item.user = null;
      }
      this.fire('user-state-changed', user);
    });
  }
  itemType = 'host';
  $hostElement;
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
  auth;
  async getConfig() {
    const rootDomainsSnap = await this.db.collection('Domains').get();
    const config = rootDomainsSnap.docs.map(doc => doc.data());
    return config;
  }
  getClass(clsRef) {
    const cls = new Class({serverRef: clsRef, Host: this});
    return cls
  }
  getDomain(dmnRef) {
    const domain = new Domain({serverRef: dmnRef, Host: this});
    return domain
  }

  async getClassByName(name) {
    const clsInDictAndDocsSnapArr = await Promise.all(
      [
        this.db.collection('Domains/workspace/Domains/dictionaries/Classes').where('name', '==', name).get(),
        this.db.collection('Domains/workspace/Domains/documents/Classes').where('name', '==', name).get()
      ]
    );
    const clsInDictAndDocsArr = clsInDictAndDocsSnapArr.map(snap => snap.docs.map(d => d.data()));
    const clsInDict = clsInDictAndDocsArr[0];
    const clsInDocs = clsInDictAndDocsArr[1];
    const clsData = clsInDict[0] || clsInDocs[0];
    let classItem;
    if (clsData) {
      classItem = new Class({serverRef: clsData.reference, Host: this});
    }
    return classItem;
  }
};
