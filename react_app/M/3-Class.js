import {Item} from './0-Item.js'
import {ObjectDocument} from './4-ObjectDocument.js';
import usersClass from '../Classes/users.js';
import gazprombankPage1Class from '../Classes/gazprombank-page1.js';
import gazprombankPage2Class from '../Classes/gazprombank-page2.js';
import gazprombankPage3Class from '../Classes/gazprombank-page3.js';
import gazprombankPage4Class from '../Classes/gazprombank-page4.js';
import gazprombankMainPageClass from '../Classes/gazprombank-main-page.jsx';


import scriptsClass from '../Classes/scripts.js';

import {Accounting} from './Services/Accounting.jsx';


export class Class extends Item {
  constructor({serverRef, name}) {
    super();
    this.serverRef = serverRef;
    this.id = serverRef.id;
    this._name = name;
    this.classModuleDefinitions.forEach(clsDef => {
      clsDef.Host = this.Host;
    })
    this.classServiceDefinitions.forEach(srvDef => {
      srvDef.Host = this.Host;
    })

  }
  itemType = 'class';
  _name;
  get name() {
    return this._name || this.metadata.name
  }
  metadata = {};
  data = [];
  serverRef;
  id; // TODO может сделать getter?
  Domain;
  classModuleDefinitions = [
    usersClass,
    gazprombankPage1Class,
    gazprombankPage2Class,
    gazprombankPage3Class,
    gazprombankPage4Class,
    gazprombankMainPageClass,
    scriptsClass,
  ];
  classServiceDefinitions = [Accounting];
  async getObjectDocuments() {
    if (this.serverRef) {
      console.log('Class.getObjectDocuments()');
      const objectsSnap = await this.serverRef.collection('ObjectDocuments').get();
      const objectsData = objectsSnap.docs.map(doc => {
        return doc.data();
      });
      this.data = objectsData;
      return objectsData;
    }
  }

  async getFieldDescriptors() {
    console.log('Class.getFieldDescriptors()');
    const doc = await this.serverRef.get();
    this.metadata = doc.data();
    return this.metadata.fieldDescriptors || [];
  }
  
  getViewsList() {
    let views = ['Grid', 'Configurator', 'JSON', 'Charts', 'Корректировка'];
    this.classServiceDefinitions.forEach(srv => {
      if (srv.views) {
        srv.views.forEach(v => {
          if (v.className === this.metadata.name) {
            views.push(v.viewName)
          }
        })
      }
    });
    return views;
  }
  
  get defaultViewName() {
    if (this.notEmpty(this.metadata.viewsOptions)) {
      const defaultViewOption = this.metadata.viewsOptions.find(vOpt => vOpt.name === 'defaultViewName');
      if (defaultViewOption && defaultViewOption.value) {
        return defaultViewOption.value
      }
    }
    return 'Grid'
  }
  
  getViewComponentByName(viewName, $Class) {
    let viewComponent;
    this.classServiceDefinitions.forEach(srv => {
      if (srv.views) {
        srv.views.forEach(v => {
          if (v.viewName === viewName) {
            viewComponent = v.viewComponent
          }
        })
      }
    });
    if (viewComponent) {
      return viewComponent(this, $Class)
    } else {
      return null
    }
  }

  async getViewsOptions() {
    // TODO разрулить
    return this.metadata.viewsOptions || [{name: 'defaultViewName'}]
  }
  
  async getObjectDocument(objectServerRef) {
    console.log('Class.getObjectDocument(objectServerRef), objectServerRef:', objectServerRef);
    const obj = new ObjectDocument();
    obj.serverRef = objectServerRef;
    obj.Class = this;
    obj.Domain = this.Domain;
    await obj.getData();
    return obj;
  }
  
  getObjectDocumentByData(data) {
    console.log('Class.getObjectDocumentByData(data), data:', data);
    const obj = new ObjectDocument();
    obj.serverRef = data.reference;
    obj.Class = this;
    obj.Domain = this.Domain;
    obj.data = data;
    return obj;
  }


  getNewObjectDocument() {
    const obj = new ObjectDocument();
    obj.notExistOnServer = true;
    obj.Class = this;
    obj.Domain = this.Domain;
    return obj;
  }

  async createObjectDocument(objDocData) { // для создания не с вьюхи Грида, а программно с других сервисов
    console.log('Class.createObjectDocument(objDocData), objDocData:', objDocData);
    const obj = new ObjectDocument();
    obj.notExistOnServer = true;
    obj.Class = this;
    await obj.saveData(objDocData);
    return obj;
  }
  
  get objectDocumentDesignJson() {
    return this.metadata.objectDocumentDesignJson;
  }

  async saveObjectDocumentDesignJson(objectDocumentDesignJson) {
    await this.serverRef.update({ objectDocumentDesignJson });
    this.metadata.objectDocumentDesignJson = objectDocumentDesignJson;
  }

  async getConnectedServices() {
    //TODO разрулить
    // const doc = await this.serverRef.get();
    // this.data = doc.data();
    return this.metadata.connectedServices || [];
  }

  async saveFieldDescriptors(fieldDescriptors) {
    console.log('Class.saveFieldDescriptors(fieldDescriptors), fieldDescriptors:', fieldDescriptors);
    if (fieldDescriptors) {
      await this.serverRef.update({fieldDescriptors})
    }
  }
  // может работать неправильно надо проверить подключив журнал учёта
  async saveMetadata({ fieldDescriptors, connectedServices, viewsOptions }) {
    console.log('Class.saveMetadata({ fieldDescriptors, connectedServices, viewsOptions }), param:', { fieldDescriptors, connectedServices, viewsOptions });
    if (fieldDescriptors || connectedServices || viewsOptions) {
      await this.serverRef.update({fieldDescriptors, connectedServices, viewsOptions})
    }
  }

  async renameClass(newClassName) {
    console.log('Class.renameClass(newClassName), newClassName:', newClassName);
    await this.serverRef.update({name: newClassName});
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetClassToRename = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    targetClassToRename.name = newClassName;
    await workspaceDocRef.update({items: workspaceConfig.items});
  }

  async deleteClass() {
    console.log('Class.deleteClass()');
    await this.serverRef.delete();
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToDeleteClass = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});;
    targetDomainToDeleteClass.items.splice(targetDomainToDeleteClass.items.findIndex(i => i.id === this.id), 1)
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async moveClassInFolderInConfig(folderName) {
    console.log('Class.moveClassInFolderInConfig(folderName), folderName:', folderName);
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    const targetClassItemInConfig = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    const targetDomainOrFolderItemInConfig = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});
    let targetDomainInConfig;
    if (targetDomainOrFolderItemInConfig.itemType === 'classFolder') {
      targetDomainInConfig = this.findDeepObjInItemsBy({id: targetDomainOrFolderItemInConfig.domainId}, {items: workspaceConfig.items});
      const targetFolderItemInConfig = this.findDeepObjInItemsBy({name: folderName, itemType: 'classFolder'}, {items: targetDomainInConfig.items});
      if (targetFolderItemInConfig) {
        if (Array.isArray(targetFolderItemInConfig.items)) {
          targetFolderItemInConfig.items.push(targetClassItemInConfig);
        } else {
          targetFolderItemInConfig.items = [targetClassItemInConfig]
        }
        const indexToCut = targetDomainOrFolderItemInConfig.items.findIndex(i => i === targetClassItemInConfig);
        targetDomainOrFolderItemInConfig.items.splice(indexToCut, 1);
      }
    } else {
      targetDomainInConfig = targetDomainOrFolderItemInConfig;
      const targetFolderItemInConfig = this.findDeepObjInItemsBy({name: folderName, itemType: 'classFolder'}, {items: targetDomainInConfig.items});
      if (targetFolderItemInConfig) {
        if (Array.isArray(targetFolderItemInConfig.items)) {
          targetFolderItemInConfig.items.push(targetClassItemInConfig);
        } else {
          targetFolderItemInConfig.items = [targetClassItemInConfig]
        }
        const indexToCut = targetDomainInConfig.items.findIndex(i => i === targetClassItemInConfig);
        targetDomainInConfig.items.splice(indexToCut, 1);
      }
    }

    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async moveClassUpInConfig() {
    console.log('Class.moveClassInFolderInConfig()');
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    const targetClassItemInConfig = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    const targetDomainOrFolderItemInConfig = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});

    const currentIndex = targetDomainOrFolderItemInConfig.items.findIndex(i => i === targetClassItemInConfig);
    if (currentIndex !== 0) {
      targetDomainOrFolderItemInConfig.items.splice(currentIndex, 1);
      targetDomainOrFolderItemInConfig.items.splice((currentIndex-1), 0, targetClassItemInConfig);
      await workspaceDocRef.update({items: workspaceConfig.items});
    }
  }

  async moveClassDownInConfig() {
    console.log('Class.moveClassDownInConfig()');
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    const targetClassItemInConfig = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    const targetDomainOrFolderItemInConfig = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});

    const currentIndex = targetDomainOrFolderItemInConfig.items.findIndex(i => i === targetClassItemInConfig);
    if (currentIndex !== targetDomainOrFolderItemInConfig.items.length) {
      targetDomainOrFolderItemInConfig.items.splice(currentIndex, 1);
      targetDomainOrFolderItemInConfig.items.splice((currentIndex+1), 0, targetClassItemInConfig);
      await workspaceDocRef.update({items: workspaceConfig.items});
    }
  }

};
