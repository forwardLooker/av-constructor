import { redirect } from "react-router-dom";

export default class {
  static id = 'QStTd7nQGF9YQjrVkpRP';
  static name = 'Газпромбанк (стр.1)';
  static Host; // инициализируется в момент соединения с классом
  static methods = {
    'Подтвердить данные': async ($objectDocument) => {
      console.log('Подтвердить данные успех', this.Host);
      this.Host.navigate('/gaz2');
      // redirect('/gaz2');
      // $objectDocument.closeWithoutSave();
      // this.Host.$hostElement.setState({ selectedTreeItem: await this.Host.getClassByName('Сотрудники') })
    }
  };
}