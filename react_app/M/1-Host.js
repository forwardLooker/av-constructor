import {Item} from './0-Item.js';
import {Class} from './3-Class.js';
import { Domain } from './2-Domain.js';
import { ObjectDocument } from './4-ObjectDocument.js';


export class Host extends Item {
  constructor(hostElement) {
    super();
    Item.Host = this;
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
  get FieldValue() { // для удаления лишних полей объекта в базе данных
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
    const cls = new Class({serverRef: clsRef, Domain: null});
    return cls
  }
  getDomain(dmnRef, id) {
    const domain = new Domain({serverRef: dmnRef, id});
    return domain
  }
    
  getClassByPath(path) {
    const clsRef = this.db.doc(path);
    const classItem = new Class({serverRef: clsRef});
    return classItem;
  }

  getClassByName(name) {
    const classData = this.findDeepObjInItemsBy({name: name}, {items: this.config});
    let classItem;
    if (classData) {
      classItem = new Class({serverRef: classData.reference});
    }
    return classItem;
  }

  getClassById(id) {
    const classData = this.findDeepObjInItemsBy({id: id}, {items: this.config});
    let classItem;
    if (classData) {
      classItem = new Class({serverRef: classData.reference});
    }
    return classItem;
  }

  getObjectDocumentByPath(path) {
    const objRef = this.db.doc(path);
    const objectDocument = new ObjectDocument({serverRef: objRef});
    return objectDocument;

  }
  
  getObjectDocumentByReference(serverRef) {
    const objectDocument = new ObjectDocument({ serverRef });
    return objectDocument;

  }
  
  navigate(...params) {
    this.$hostElement.props.appRef.state.router.navigate(...params);
  }

};
