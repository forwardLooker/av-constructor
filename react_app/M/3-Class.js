import {Item} from './0-Item.js'
import {ObjectDocument} from './4-ObjectDocument.js';
import usersClass from '../Classes/users.js';

import {Accounting} from './Services/Accounting.js';


export class Class extends Item {
  constructor({serverRef, Host}) {
    super();
    this.serverRef = serverRef;
    this.id = serverRef.id;
    this.Host = Host;
    this.classModuleDefinitions.forEach(clsDef => {
      clsDef.Host = this.Host;
    })
    this.classServiceDefinitions.forEach(srvDef => {
      srvDef.Host = this.Host;
    })

  }
  itemType = 'class';
  data = {};
  serverRef;
  id; // TODO может сделать getter?
  Host;
  Domain;
  classModuleDefinitions = [usersClass];
  classServiceDefinitions = [Accounting];
  async getObjectDocuments() {
    if (this.serverRef) {
      const objectsSnap = await this.serverRef.collection('ObjectDocuments').get();
      return objectsSnap.docs.map(doc => {
        return doc.data();
      })
    }
  }

  async getFieldDescriptors() {
    const doc = await this.serverRef.get();
    this.data = doc.data();
    return this.data.fieldDescriptors || [];
  }

  async getViewsOptions() {
    // TODO разрулить
    return this.data.viewsOptions || [{name: 'defaultViewName'}]
  }

  async getConnectedServices() {
    //TODO разрулить
    // const doc = await this.serverRef.get();
    // this.data = doc.data();
    return this.data.connectedServices || [];
  }

  async saveFieldDescriptors(fieldDescriptors) {
    if (fieldDescriptors) {
      await this.serverRef.update({fieldDescriptors})
    }
  }

  async saveMetadata({fieldDescriptors, connectedServices, viewsOptions}) {
    if (fieldDescriptors || connectedServices || viewsOptions) {
      await this.serverRef.update({fieldDescriptors, connectedServices, viewsOptions})
    }
  }

  get objectDocumentDesignJson() {
    return this.data.objectDocumentDesignJson;
  }

  async saveObjectDocumentDesignJson(objectDocumentDesignJson) {
    await this.serverRef.update({objectDocumentDesignJson});
    this.data.objectDocumentDesignJson = objectDocumentDesignJson;
  }

  getViewsList() {
    let views = ['Grid', 'Configurator'];
    this.classServiceDefinitions.forEach(srv => {
      if (srv.views) {
        srv.views.forEach(v => {
          if (v.classId === this.id) {
            views.push(v.viewName)
          }
        })
      }
    });
    return views;
  }

  getViewComponentByName(viewName, $Class) {
    let viewComponent;
    this.classServiceDefinitions.forEach(srv => {
      if (srv.views) {
        srv.views.forEach(v => {
          if (v.classId === this.id && v.viewName === viewName) {
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

  get defaultViewName() {
    if (this.notEmpty(this.data.viewsOptions)) {
      const defaultViewOption = this.data.viewsOptions.find(vOpt => vOpt.name === 'defaultViewName');
      if (defaultViewOption && defaultViewOption.value) {
        return defaultViewOption.value
      }
    }
    return 'Grid'
  }

  async getObjectDocument(objectServerRef) {
    const obj = new ObjectDocument();
    obj.serverRef = objectServerRef;
    obj.Class = this;
    obj.Domain = this.Domain;
    await obj.getData();
    return obj;
  }

  getNewObjectDocument() {
    const obj = new ObjectDocument();
    obj.notExistOnServer = true;
    obj.Class = this;
    obj.Domain = this.Domain;
    return obj;
  }

  async createObjectDocument(objDocData) {
    console.log('createObjectDocument objDocData:', objDocData);
    const obj = new ObjectDocument();
    obj.notExistOnServer = true;
    obj.Class = this;
    await obj.saveData(objDocData);
    return obj;
  }

  async renameClass(newClassName) {
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
    await this.serverRef.delete();
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToDeleteClass = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});;
    targetDomainToDeleteClass.items.splice(targetDomainToDeleteClass.items.findIndex(i => i.id === this.id), 1)
    await workspaceDocRef.update({items: workspaceConfig.items});

  }
};
