import {Item} from './0-Item.js'

export class Domain extends Item {
  constructor({serverRef, Host}) {
    super();
    this.serverRef = serverRef;
    this.id = serverRef.id;
    this.Host = Host;
  }
  itemType = 'domain'
  serverRef;
  id;
  Host;

  async createClass(className) {
    const newClass = this.serverRef.collection('Classes').doc();
    const classInitData = {
      id: newClass.id,
      name: className,
      reference: newClass,
      path: newClass.path,
      itemType: 'class',
      createdDateTime: new Date().toLocaleString(), //TODO даты сделать
      author: this.user.email,
      lastModifiedDateTime: new Date().toLocaleString(),
      lastModifiedAuthor: this.user.email,
      version: 1,
    };
    await newClass.set(classInitData);
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceData = workspaceDoc.data();
    const domainInItems = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceData.items});
    domainInItems.items.push(classInitData);
    await workspaceDocRef.update({items: workspaceData.items});
  }
}
