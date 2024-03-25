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
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToAddNewClass;
    if (workspaceDocRef.id === this.id) {
      targetDomainToAddNewClass = workspaceConfig
    } else {
      targetDomainToAddNewClass = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToAddNewClass.items)) {
      targetDomainToAddNewClass.items.push(classInitData);
    } else {
      targetDomainToAddNewClass.items = [classInitData]
    }
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async createDomain(domain) {
    const newDomain = this.serverRef.collection('Domains').doc();
    const domainInitData = {
      id: newDomain.id,
      name: domain,
      reference: newDomain,
      path: newDomain.path,
      itemType: 'domain',
      createdDateTime: new Date().toLocaleString(), //TODO даты сделать
      author: this.user.email,
      lastModifiedDateTime: new Date().toLocaleString(),
      lastModifiedAuthor: this.user.email,
      version: 1,
    };
    await newDomain.set(domainInitData);
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToAddNewDomain;
    if (workspaceDocRef.id === this.id) {
      targetDomainToAddNewDomain = workspaceConfig
    } else {
      targetDomainToAddNewDomain = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToAddNewDomain.items)) {
      targetDomainToAddNewDomain.items.push(domainInitData);
    } else {
      targetDomainToAddNewDomain.items = [domainInitData]
    }
    await workspaceDocRef.update({items: workspaceConfig.items});
  }

  async renameDomain(newDomainName) {
    await this.serverRef.update({name: newDomainName});
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetClassToRename = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    targetClassToRename.name = newDomainName;
    await workspaceDocRef.update({items: workspaceConfig.items});
  }

  async deleteDomain() {
    // for safe
    if (this.serverRef.id === 'workspace') {
      return;
    }

    this.serverRef.delete();
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToDeleteDomain = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});;
    targetDomainToDeleteDomain.items.splice(targetDomainToDeleteDomain.items.findIndex(i => i.id === this.id), 1)
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

}
