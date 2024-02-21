export default class {
  static id = 'users';
  static name = 'Пользователи';
  static methods = {
    'Перейти к Иванову': ($objectDocument) => {
      console.log('Перейти к Иванову');
      $objectDocument.closeWithoutSave();
    }
  };
}