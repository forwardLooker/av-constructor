import {Item} from './0-Item.js'

export class ObjectDocument extends Item {
  constructor() {
    super();
  }
  itemType = 'objectDocument';
  serverRef;
  data;
  async getData() {
    const doc = await this.serverRef.get();
    this.data = doc.data();
  }
  async saveData(data) {
    await this.serverRef.update(data);
  }
};
