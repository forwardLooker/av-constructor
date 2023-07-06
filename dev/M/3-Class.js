import {Item} from './0-Item.js'
import {ObjectDocument} from './4-ObjectDocument.js'

export class Class extends Item {
  constructor() {
    super();
  }
  itemType = 'class';
  serverRef;
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
    return doc.data().fieldDescriptors;
  }

  async saveFieldDescriptors(fieldDescriptors) {
    this.serverRef.update({fieldDescriptors})
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
    await obj.getData();
    return obj;
  }
};
