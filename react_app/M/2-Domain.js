import {Item} from './0-Item.js'

export class Domain extends Item {
  constructor({serverRef, id}) {
    super();
    this.serverRef = serverRef;
    this.id = id || serverRef.id;
  }
  itemType = 'domain'
  serverRef;
  id;
  async createClass(className) {
    const newClass = this.serverRef.collection('Classes').doc();
    const classInitData = {
      id: newClass.id,
      domainId: this.id,
      domainReference: this.serverRef,
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
    if (this.serverRef.id === 'system') {
      const systemDoc = await this.serverRef.get();
      const systemConfig = systemDoc.data();
      systemConfig.items.push(classInitData);
      await this.serverRef.update({ items: systemConfig.items });
      return;
    }
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

  async createClassCopyFromReference(reference) {
    const classItemDoc = await reference.get();
    const classItemData = classItemDoc.data();
    const newClass = this.serverRef.collection('Classes').doc();
    const classInitData = {
      ...classItemData,
      id: newClass.id,
      domainId: this.id,
      domainReference: this.serverRef,
      reference: newClass,
      path: newClass.path,
      itemType: 'class',
      createdDateTime: new Date().toLocaleString(), //TODO даты сделать
      author: this.user.email,
      lastModifiedDateTime: new Date().toLocaleString(),
      lastModifiedAuthor: this.user.email,
    };
    await newClass.set(classInitData);
    console.log('Domain.js createClassCopyFromReference newClass from Copy set in Database');
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
    let classInitDataInConfig = { ...classInitData };
    // delete classInitDataInConfig.fieldDescriptors;
    delete classInitDataInConfig.objectDocumentDesignJson;
    if (Array.isArray(targetDomainToAddNewClass.items)) {
      targetDomainToAddNewClass.items.push(classInitDataInConfig);
    } else {
      targetDomainToAddNewClass.items = [classInitDataInConfig]
    }
    console.log('targetDomainToAddNewClass', targetDomainToAddNewClass);
    await workspaceDocRef.update({ items: workspaceConfig.items });
    console.log('Domain.createClassCopyFromReference() finished, newClass from Copy updated in Config');

  }

  async createClassCopyFromReferenceWithData(reference) {
    const classItemDoc = await reference.get();
    const classItemData = classItemDoc.data();
    const newClass = this.serverRef.collection('Classes').doc();
    const classInitData = {
      ...classItemData,
      id: newClass.id,
      domainId: this.id,
      domainReference: this.serverRef,
      reference: newClass,
      path: newClass.path,
      itemType: 'class',
      createdDateTime: new Date().toLocaleString(), //TODO даты сделать
      author: this.user.email,
      lastModifiedDateTime: new Date().toLocaleString(),
      lastModifiedAuthor: this.user.email,
    };
    await newClass.set(classInitData);
    console.log('Domain.js createClassCopyFromReference newClass from Copy set in Database');

    // Скопировать данные
    const objectsSnap = await reference.collection('ObjectDocuments').get();
    const sourceObjectsArray = objectsSnap.docs.map(doc => {
      return doc.data();
    });
    const newClassItem = this.Host.getClass(newClass);
    sourceObjectsArray.forEach(obj => {
      newClassItem.createObjectDocument(obj);
    })

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
    let classInitDataInConfig = { ...classInitData };
    delete classInitDataInConfig.fieldDescriptors;
    delete classInitDataInConfig.objectDocumentDesignJson;
    if (Array.isArray(targetDomainToAddNewClass.items)) {
      targetDomainToAddNewClass.items.push(classInitDataInConfig);
    } else {
      targetDomainToAddNewClass.items = [classInitDataInConfig]
    }
    await workspaceDocRef.update({ items: workspaceConfig.items });
    console.log('Domain.js createClassCopyFromReference newClass from Copy updated in Config');

  }

  async createDomain(domain) {
    const newDomain = this.serverRef.collection('Domains').doc();
    const domainInitData = {
      id: newDomain.id,
      domainId: this.id,
      domainReference: this.serverRef,
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
    await workspaceDocRef.update({ items: workspaceConfig.items });
    return this.Host.getDomain(newDomain);
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

    await this.serverRef.delete();
    // update config
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToDeleteDomain = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});;
    targetDomainToDeleteDomain.items.splice(targetDomainToDeleteDomain.items.findIndex(i => i.id === this.id), 1)
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async moveDomainUpInConfig() {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    const targetDomainToMoveDomain = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});
    if (Array.isArray(targetDomainToMoveDomain.items)) {
      const domainItem = this.findDeepObjInItemsBy({id: this.id}, {items: targetDomainToMoveDomain.items});
      const currentIndex = targetDomainToMoveDomain.items.findIndex(i => i === domainItem);
      if (currentIndex !== 0) {
        targetDomainToMoveDomain.items.splice(currentIndex, 1);
        targetDomainToMoveDomain.items.splice((currentIndex-1), 0, domainItem);
        await workspaceDocRef.update({items: workspaceConfig.items});
      }
    }
  }

  async moveDomainDownInConfig() {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    const targetDomainToMoveDomain = this.findDeepContainerInItemsBy({id: this.id}, {items: workspaceConfig.items});
    if (Array.isArray(targetDomainToMoveDomain.items)) {
      const domainItem = this.findDeepObjInItemsBy({id: this.id}, {items: targetDomainToMoveDomain.items});
      const currentIndex = targetDomainToMoveDomain.items.findIndex(i => i === domainItem);
      if (currentIndex !== targetDomainToMoveDomain.items.length) {
        targetDomainToMoveDomain.items.splice(currentIndex, 1);
        targetDomainToMoveDomain.items.splice((currentIndex+1), 0, domainItem);
        await workspaceDocRef.update({items: workspaceConfig.items});
      }
    }
  }



  async createFolderInConfig(folderName) {
    const folderInitData = {
      domainId: this.id,
      domainReference: this.serverRef,
      name: folderName,
      itemType: 'classFolder',
    };

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
      targetDomainToAddNewDomain.items.push(folderInitData);
    } else {
      targetDomainToAddNewDomain.items = [folderInitData]
    }
    await workspaceDocRef.update({items: workspaceConfig.items});
  }

  async renameFolderInConfig(oldFolderName, newFolderName) {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToRenameFolder;
    if (workspaceDocRef.id === this.id) {
      targetDomainToRenameFolder = workspaceConfig
    } else {
      targetDomainToRenameFolder = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToRenameFolder.items)) {
      const folderItem = this.findDeepObjInItemsBy({name: oldFolderName}, {items: targetDomainToRenameFolder.items});
      folderItem.name = newFolderName;
    }
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async disbandFolderInConfig(name) {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();
    let targetDomainToDisbandFolder;
    if (workspaceDocRef.id === this.id) {
      targetDomainToDisbandFolder = workspaceConfig
    } else {
      targetDomainToDisbandFolder = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToDisbandFolder.items)) {
      const folderItem = this.findDeepObjInItemsBy({name: name}, {items: targetDomainToDisbandFolder.items});
      folderItem.items.forEach(classItem => targetDomainToDisbandFolder.items.push(classItem));
      const indexToCut = targetDomainToDisbandFolder.items.findIndex(i => i === folderItem);
      targetDomainToDisbandFolder.items.splice(indexToCut, 1);
    }
    await workspaceDocRef.update({items: workspaceConfig.items});

  }

  async moveFolderUpInConfig(name) {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    let targetDomainToMoveFolder;
    if (workspaceDocRef.id === this.id) {
      targetDomainToMoveFolder = workspaceConfig
    } else {
      targetDomainToMoveFolder = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToMoveFolder.items)) {
      const folderItem = this.findDeepObjInItemsBy({name: name}, {items: targetDomainToMoveFolder.items});
      const currentIndex = targetDomainToMoveFolder.items.findIndex(i => i === folderItem);
      if (currentIndex !== 0) {
        targetDomainToMoveFolder.items.splice(currentIndex, 1);
        targetDomainToMoveFolder.items.splice((currentIndex-1), 0, folderItem);
        await workspaceDocRef.update({items: workspaceConfig.items});
      }
    }
  }

  async moveFolderDownInConfig(name) {
    const workspaceDocRef = this.Host.db.collection('Domains').doc('workspace');
    const workspaceDoc = await workspaceDocRef.get();
    const workspaceConfig = workspaceDoc.data();

    let targetDomainToMoveFolder;
    if (workspaceDocRef.id === this.id) {
      targetDomainToMoveFolder = workspaceConfig
    } else {
      targetDomainToMoveFolder = this.findDeepObjInItemsBy({id: this.id}, {items: workspaceConfig.items});
    }
    if (Array.isArray(targetDomainToMoveFolder.items)) {
      const folderItem = this.findDeepObjInItemsBy({name: name}, {items: targetDomainToMoveFolder.items});
      const currentIndex = targetDomainToMoveFolder.items.findIndex(i => i === folderItem);
      if (currentIndex !== targetDomainToMoveFolder.items.length) {
        targetDomainToMoveFolder.items.splice(currentIndex, 1);
        targetDomainToMoveFolder.items.splice((currentIndex+1), 0, folderItem);
        await workspaceDocRef.update({items: workspaceConfig.items});
      }
    }
  }
}
