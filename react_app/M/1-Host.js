import {Item} from './0-Item.js';
import {Class} from './3-Class.js';
import {Domain} from './2-Domain.js';

export class Host extends Item {
  constructor(hostElement) {
    super();
    this.$hostElement = hostElement;
    this.firebase.initializeApp(this.firebaseConfig);
    this.db = this.firebase.firestore();
    this.storageRoot = this.firebase.storage().ref();
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
  get FieldValue() {
    return this.firebase.firestore.FieldValue;
  }
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
  storageRoot;
  auth;
  config;
  async getConfig() {
    const rootDomainsSnap = await this.db.collection('Domains').get();
    this.config = rootDomainsSnap.docs.map(doc => doc.data());
    return this.config;
  }
  getClass(clsRef) {
    const cls = new Class({serverRef: clsRef, Host: this, Domain: null});
    return cls
  }
  getDomain(dmnRef, id) {
    const domain = new Domain({serverRef: dmnRef, Host: this, id});
    return domain
  }

  getClassByName(name) {
    const classData = this.findDeepObjInItemsBy({name: name}, {items: this.config});
    let classItem;
    if (classData) {
      classItem = new Class({serverRef: classData.reference, Host: this});
    }
    return classItem;
  }

  getClassById(id) {
    const classData = this.findDeepObjInItemsBy({id: id}, {items: this.config});
    let classItem;
    if (classData) {
      classItem = new Class({serverRef: classData.reference, Host: this});
    }
    return classItem;
  }

};
