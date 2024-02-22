export default class {
  static id = 'users';
  static name = 'Пользователи';
  static Host;
  static methods = {
    'Перейти к Иванову': async ($objectDocument) => {
      console.log('Перейти к Иванову:', this.Host);
      $objectDocument.closeWithoutSave();
      this.Host.$hostElement.setState({selectedTreeItem: await this.Host.getClassByName('Сотрудники')})
    }
  };
}