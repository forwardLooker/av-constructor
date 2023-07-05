import {Item} from './0-Item.js'

export class Class extends Item {
  constructor() {
    super();
  }
  itemType = 'class';
  classServerRef;
  async getObjectDocuments() {
    if (this.classServerRef) {
      const objectsSnap = await this.classServerRef.collection('ObjectDocuments').get();
      return objectsSnap.docs.map(doc => {
        return doc.data();
      })
    }
  }

  async getFieldDescriptors() {
    const doc = await this.classServerRef.get();
    return doc.data().fieldDescriptors;
  }

  getViewsList() {
    return ['Grid', 'Configurator'];
  }

  get defaultViewName() {
    return 'Grid'
  }
};
