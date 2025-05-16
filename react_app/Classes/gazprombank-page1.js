import { redirect } from "react-router-dom";

export default class {
  static id = 'QStTd7nQGF9YQjrVkpRP';
  static name = 'Газпромбанк (стр.1)';
  static Host; // инициализируется в момент соединения с классом
  static methods = {
    'Подтвердить данные': async ($objectDocument) => {
      console.log('Подтвердить данные успех', this.Host);
      let stopNavigate;
      if (!$objectDocument['fieldRef_Фамилия Имя Отчество'].state._value) {
        $objectDocument['fieldRef_Фамилия Имя Отчество'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Мобильный телефон'].state._value) {
        $objectDocument['fieldRef_Мобильный телефон'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Email'].state._value) {
        $objectDocument['fieldRef_Email'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!stopNavigate) {
        this.Host.navigate('/gaz2');
      }
      // redirect('/gaz2');
      // $objectDocument.closeWithoutSave();
      // this.Host.$hostElement.setState({ selectedTreeItem: await this.Host.getClassByName('Сотрудники') })
    }
  };
}