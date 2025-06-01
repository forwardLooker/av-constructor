import { redirect } from "react-router-dom";

export default class {
  static id = 'QStTd7nQGF9YQjrVkpRP';
  static name = 'Газпромбанк (стр.1)';
  static Host; // инициализируется в момент соединения с классом
  static onComponentDidMount = async ($objectDocument) => {
    if (!$objectDocument.state._newData['Я налоговый резидент только РФ']) {
      if (!$objectDocument.state.presentationGroupsHidden.includes('nalogResidentNo')) {
        $objectDocument.state.presentationGroupsHidden.push('nalogResidentNo');
        $objectDocument.forceUpdate();
      }
    }
  }
  static on_newDataChange = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Предоставляю указанные ниже согласия') {
      $objectDocument.setState(state => ({...state, _newData: {
        ...state._newData,
        'Я подтверждаю заявку и даю согласие на обработку персональных данных': value,
        'Я даю согласие на передачу третьим лицам персональных данных': value,
        'Я даю согласие на получение Банком информации из БКИ': value,
        'Я согласен получать предложения, информацию о продуктах, услугах Банка и его партнеров': value,
        'Я даю согласие на передачу персональных данных партнёрам Банка': value,
      }}))
    }
    if (fieldItemName === 'Я налоговый резидент только РФ') {
      if (value === 'Нет') {
        if (!$objectDocument.state.presentationGroupsHidden.includes('nalogResidentYes')) {
          $objectDocument.state.presentationGroupsHidden.push('nalogResidentYes');
          $objectDocument.forceUpdate();
        }
        if ($objectDocument.state.presentationGroupsHidden.includes('nalogResidentNo')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'nalogResidentNo');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
      }
      if (value === 'Да') {
        if ($objectDocument.state.presentationGroupsHidden.includes('nalogResidentYes')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'nalogResidentYes');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('nalogResidentNo')) {
          $objectDocument.state.presentationGroupsHidden.push('nalogResidentNo');
          $objectDocument.forceUpdate();
        }
      }
    }
  }
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
      // проверки чекбоксов
      if (!$objectDocument['fieldRef_Я подтверждаю заявку и даю согласие на обработку персональных данных'].state._value) {
        $objectDocument['fieldRef_Я подтверждаю заявку и даю согласие на обработку персональных данных'].setState({
          isInvalidState: true,
          isInvalidMessageRendered: true,
          invalidMessage: 'Заявка не может быть обработана без вашего согласия',
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Я даю согласие на передачу третьим лицам персональных данных'].state._value) {
        $objectDocument['fieldRef_Я даю согласие на передачу третьим лицам персональных данных'].setState({
          isInvalidState: true,
          isInvalidMessageRendered: true,
          invalidMessage: 'Заявка не может быть обработана без вашего согласия',
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Я даю согласие на получение Банком информации из БКИ'].state._value) {
        $objectDocument['fieldRef_Я даю согласие на получение Банком информации из БКИ'].setState({
          isInvalidState: true,
          isInvalidMessageRendered: true,
          invalidMessage: 'Заявка не может быть обработана без вашего согласия',
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