import {Item} from './0-Item.js'

export class ObjectDocument extends Item {
  constructor() {
    super();
  }
  itemType = 'objectDocument';
  serverRef;
  Class;
  data = {};
  innerFieldsInData = {
    _itemType: 'objectDocument',
    _id: '',
    _createdDateTime: '',
    _author: '',
    _lastModifiedDateTime: '',
    _lastModifiedAuthor: '',
    _version: '',
    _reference: '',
    _path: ''
  }
  notExistOnServer;
  async getData() {
    const doc = await this.serverRef.get();
    this.data = doc.data();
  }
  get designJson() {
    return this.Class.objectDocumentDesignJson;
  }
  async saveData(data) {
    if (this.notExistOnServer) {
      this.serverRef = this.Class.serverRef.collection('ObjectDocuments').doc();
      await this.serverRef.set({
        ...this.data,
        _id: this.serverRef.id,
        _reference: this.serverRef,
        _path: this.serverRef.path,
        _itemType: 'objectDocument',
        _createdDateTime: new Date().toLocaleString(), //TODO даты сделать
        _author: this.user.email,
        _lastModifiedDateTime: new Date().toLocaleString(),
        _lastModifiedAuthor: this.user.email,
        _version: 1,
      })
    } else {
      await this.serverRef.update(data);
    }
  }
  async saveDesignJson(designJson) {
    await this.Class.saveObjectDocumentDesignJson(designJson);
  }
};
