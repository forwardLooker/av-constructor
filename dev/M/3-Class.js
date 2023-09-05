import {Item} from './0-Item.js'
import {ObjectDocument} from './4-ObjectDocument.js'

export class Class extends Item {
  constructor() {
    super();
  }
  itemType = 'class';
  data = {};
  serverRef;
  eventNames = [
    'openNewObjectDocument'
  ];
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
    return this.data.fieldDescriptors;
  }

  async saveFieldDescriptors(fieldDescriptors) {
    this.serverRef.update({fieldDescriptors})
  }

  get objectDocumentDesignJson() {
    return this.data.objectDocumentDesignJson;
  }

  async saveObjectDocumentDesignJson(objectDocumentDesignJson) {
    await this.serverRef.update({objectDocumentDesignJson});
    this.data.objectDocumentDesignJson = objectDocumentDesignJson;
  }

  getViewsList() {
    return ['Grid', 'Configurator'];
  }

  get defaultViewName() {
    return 'Grid'
  }

  async getObjectDocument(objectServerRef) {
    const obj = new ObjectDocument();
    obj.serverRef = objectServerRef;
    obj.Class = this;
    await obj.getData();
    return obj;
  }

  getNewObjectDocument() {
    const obj = new ObjectDocument();
    obj.notExistOnServer = true;
    obj.Class = this;
    return obj;
  }
};
