import {Item} from './0-Item.js';
import {Class} from './3-Class.js';
import { Domain } from './2-Domain.js';
import { ObjectDocument } from './4-ObjectDocument.js';

import vkBridge from '@vkontakte/vk-bridge';



export class Host extends Item {
  constructor(hostElement) {
    super();
    Item.Host = this;
    this.$hostElement = hostElement;
    this.firebase.initializeApp(this.firebaseConfig);
    this.db = this.firebase.firestore();
    this.storageRoot = this.firebase.storage().ref();
    this.auth = this.firebase.auth();    
    this.auth.onAuthStateChanged((user) => {
      console.log('Host firebase.auth onAuthStateChanged user:', user);
      // if (window.vk_app === true) return;
      if (user) {
        // this.user = user;
        Item.user = user;
      } else {
        // this.user = null;
        Item.user = null;
      }
      this.fire('user-state-changed', user);
    });
    
    if (window.vk_app === true) {
      this.auth.signInWithEmailAndPassword('arta.vision.constructor@gmail.com', 'Hunters8alL').then(() => {
        // vkBridge.send('VKWebAppInit');
        // console.log('vkBridge VKWebAppInit');
        new Promise(async (res, rej) => {
          const vkUser = await vkBridge.send('VKWebAppGetUserInfo');
          res(vkUser)
        }).then(vkUser => {
          console.log('vkBridge VKWebAppGetUserInfo vkUser:', vkUser);
          if (vkUser) {
            // this.user = user;
            Item.vkUser = vkUser;
          } else {
            // this.user = null;
            Item.vkUser = null;
          }
          // this.fire('user-state-changed', vkUser);
        })
      });
    }
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
  preloadedObjectDocuments = [];
  async getConfig() {
    console.log('Host.getConfig()');
    const rootDomainsSnap = await this.db.collection('Domains').get();
    this.config = rootDomainsSnap.docs.map(doc => doc.data());
    return this.config;
  }
  getClass(clsRef, name) {
    const cls = new Class({serverRef: clsRef, Domain: null, name});
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

  getClassByName(name, domainId) {
    let classData;
    if (domainId) {
      const appUserDomainInConfig = this.findDeepObjInItemsBy({ id: domainId, itemType: 'domain' }, { items: this.config });
      classData = this.findDeepObjInItemsBy({ name: name }, { items: appUserDomainInConfig.items });
    } else {
      classData = this.findDeepObjInItemsBy({ name: name }, { items: this.config });
    }
    let classItem;
    if (classData) {
      classItem = new Class({serverRef: classData.reference, name});
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
    const preloadedObjDoc = this.preloadedObjectDocuments.find(o => o.path === path);
    if (preloadedObjDoc) {
      console.log('Host.getObjectDocumentByPath(path), found preloadedObjDoc:', preloadedObjDoc);
      return preloadedObjDoc;
    }
    const objRef = this.db.doc(path);
    const objectDocument = new ObjectDocument({serverRef: objRef});
    return objectDocument;

  }
  
  getObjectDocumentByReference(serverRef) {
    const objectDocument = new ObjectDocument({ serverRef });
    return objectDocument;

  }
  
  navigate(...params) {
    console.log('Host.navigate(...params), params:', params);
    this.$hostElement.props.appRef.state.router.navigate(...params);
  }

  subscribe(...params) {
    console.log('Host.subscribe(...params), params:', params);
    this.$hostElement.props.appRef.state.router.subscribe(...params);
  }
  
  get router() {
    return this.$hostElement.props.appRef.state.router;
  }
  
  get location() {
    return this.$hostElement.props.appRef.state.router.state.location;
  }
  
  get trailPathname() {
    const pathArr = this.location.pathname.split('/');
    const trailPathname = '/' + pathArr[pathArr.length - 1];
    return trailPathname;
  }
  
  // dispose(...params) {
  //   this.$hostElement.props.appRef.state.router.dispose(...params);
  // }
  
  async preloadObjectDocumentsByClassReference(serverRef) {
    const classItem = this.getClass(serverRef);
    const fieldDescriptors = await classItem.getFieldDescriptors();
    const objectDocuments = await classItem.getObjectDocuments();
    const objDocsItems = objectDocuments.map(o => {
      return new ObjectDocument({ serverRef: o.reference, path: o.path, data: o, preloaded: true, Class: classItem })
    });
    this.preloadedObjectDocuments = [...this.preloadedObjectDocuments, ...objDocsItems];
    console.log('finished async preloadObjectDocumentsByClassReference(serverRef), preloadedObjectDocuments:', this.preloadedObjectDocuments);
  }

};
