import {Item} from './0-Item.js'

export class Class extends Item {
  constructor() {
    super();
  }
  classRef;
  async getObjects() {
    if (this.classRef) {
      const objectsSnap = await this.classRef.collection('Objects').get();
      return objectsSnap.docs.map(doc => {
        return doc.data();
      })
    }
  }
  async getFieldDescriptors() {
    const doc = await this.classRef.get();
    return doc.data().fieldDescriptors;
  }
};
