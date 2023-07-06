import {Item} from './0-Item.js'

export class ObjectDocument extends Item {
  constructor() {
    super();
  }
  itemType = 'objectDocument';
  serverRef;
  data;
  innerFieldsInData = {
    _itemType: 'objectDocument',
    _id: '',
    _createdDateTime: '',
    _author: '',
    _lastModifiedDateTime: '',
    _lastModifiedAuthor: '',
    _version: '',
    _reference: ''
  }
  notExistOnServer;
  async getData() {
    const doc = await this.serverRef.get();
    this.data = doc.data();
  }
  async saveData(data) {
    if (this.notExistOnServer) {

    } else {
      await this.serverRef.update(data);
    }
  }
};
