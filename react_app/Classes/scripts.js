export default class { // Тестовый эксперимент
  static id = 'pseBLMv2l8UtBtbwEc7n';
  static name = 'Скрипты';
  static Host;
  static methods = {
    'Выполнить': async ($objectDocument) => {     
      
      const friendsClassItem = this.Host.getClassByName('Друзья');
      const objDocs = await friendsClassItem.getObjectDocuments();
      objDocs.forEach((o, idx) => {
        const objDocItem = this.Host.getObjectDocumentByReference(o.reference);
        objDocItem.deleteObjectDocument();
      });
      console.log('Объекты отправлены на удаление');
    }
  };
}