import {Item} from './0-Item.js'

export class ObjectDocument extends Item {
  constructor() {
    super();
  }
  itemType = 'objectDocument';
  serverRef;
  get id() {
    return this.serverRef.id;
  }
  Class;
  Domain;
  data = {};
  innerFieldsInData = {
    itemType: 'objectDocument',
    id: '',
    createdDateTime: '',
    author: '',
    lastModifiedDateTime: '',
    lastModifiedAuthor: '',
    version: '',
    reference: '',
    path: ''
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
        ...data,
        id: this.serverRef.id,
        reference: this.serverRef,
        path: this.serverRef.path,
        itemType: 'objectDocument',
        createdDateTime: new Date().toLocaleString(), //TODO даты сделать
        author: this.user.email,
        lastModifiedDateTime: new Date().toLocaleString(),
        lastModifiedAuthor: this.user.email,
        version: 1,
      });
      this.notExistOnServer = false;
    } else {
      await this.serverRef.update(data);
    }
  }
  async saveDesignJson(designJson) {
    await this.Class.saveObjectDocumentDesignJson(designJson);
  }

  async deleteObjectDocument() {
    await this.serverRef.delete();
  }
};
