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
    $objectDocument.state.presentationGroupsHidden.push('confirmSMS');
    $objectDocument.state.presentationGroupsHidden.push('ФИО по отдельности');
    $objectDocument.forceUpdate();
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
    
    let checkboxArr = ['Я подтверждаю заявку и даю согласие на обработку персональных данных',
      'Я даю согласие на передачу третьим лицам персональных данных',
      'Я даю согласие на получение Банком информации из БКИ',
      'Я согласен получать предложения, информацию о продуктах, услугах Банка и его партнеров',
      'Я даю согласие на передачу персональных данных партнёрам Банка',];
    let valuesFromCheckboxArr = [
      $objectDocument.state._newData['Я подтверждаю заявку и даю согласие на обработку персональных данных'],
      $objectDocument.state._newData['Я даю согласие на передачу третьим лицам персональных данных'],
      $objectDocument.state._newData['Я даю согласие на получение Банком информации из БКИ'],
      $objectDocument.state._newData['Я согласен получать предложения, информацию о продуктах, услугах Банка и его партнеров'],
      $objectDocument.state._newData['Я даю согласие на передачу персональных данных партнёрам Банка'],
    ];
    if (checkboxArr.some(name => name === fieldItemName) && value && valuesFromCheckboxArr.some(value => !value)) {
      $objectDocument.state._newData['Предоставляю указанные ниже согласия'] = 'middleLine';
      $objectDocument.forceUpdate();
    } else if (checkboxArr.some(name => name === fieldItemName) && !value && valuesFromCheckboxArr.some(value => value)) {
      $objectDocument.state._newData['Предоставляю указанные ниже согласия'] = 'middleLine';
      $objectDocument.forceUpdate();
    } else if (checkboxArr.some(name => name === fieldItemName)  && valuesFromCheckboxArr.every(value => !value)) {
      $objectDocument.state._newData['Предоставляю указанные ниже согласия'] = false;
      $objectDocument.forceUpdate();
    } else if (checkboxArr.some(name => name === fieldItemName)) {
      $objectDocument.state._newData['Предоставляю указанные ниже согласия'] = true;
      $objectDocument.forceUpdate();
    }
      
    if (fieldItemName === 'Я налоговый резидент только РФ') {
      if (value === 'Нет') {
        if (!$objectDocument.state.presentationGroupsHidden.includes('nalogResidentYes')) {
          $objectDocument.state.presentationGroupsHidden.push('nalogResidentYes');
          $objectDocument.forceUpdate();
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('confirmData')) {
          $objectDocument.state.presentationGroupsHidden.push('confirmData');
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
        if ($objectDocument.state.presentationGroupsHidden.includes('confirmData')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'confirmData');
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
  
  static on_fieldBlur = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Фамилия Имя Отчество') {
      const arrWords = value.split(' ');
      const notValidFIO = arrWords.length !== 3 || arrWords.some(w => w.length < 2) || arrWords.every(w => w.length === 2);
      if (notValidFIO) {
        if ($objectDocument.state.presentationGroupsHidden.includes('ФИО по отдельности')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'ФИО по отдельности');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('Фамилия Имя Отчество')) {
          $objectDocument.state.presentationGroupsHidden.push('Фамилия Имя Отчество');
        }
        $objectDocument.state._newData['Фамилия'] = arrWords[0];
        $objectDocument.state._newData['Имя'] = arrWords[1];
        $objectDocument.state._newData['Отчество'] = arrWords[2];

        $objectDocument.forceUpdate();
      } else {
        const arrCapitalizedWords = arrWords.map(word => {
          return String(word).charAt(0).toUpperCase() + String(word).slice(1)
        });
        const fixedFIO = arrCapitalizedWords.join(' ');
        $objectDocument.state._newData['Фамилия Имя Отчество'] = fixedFIO;
        $objectDocument.forceUpdate();
      }
    }
  }

  static methods = {
    'Подтвердить данные': async ($objectDocument) => {
      console.log('Подтвердить данные успех', this.Host);
      let stopNavigate;
      // проверки полей на наличие
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
      // проверки полей на валидность
      if ($objectDocument['fieldRef_Я налоговый резидент только РФ'].state._value !== 'Да') {
        $objectDocument['fieldRef_Я налоговый резидент только РФ'].setState({
          isInvalidState: true,
          isInvalidMessageRendered: true,
          invalidMessage: 'Выберите один из вариантов',
        });
        $objectDocument['fieldRef_Я налоговый резидент только РФ'].props.fieldItem.domElement.focus();
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Мобильный телефон'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Email'].state.isInvalidState) {
        stopNavigate = true
      }
      // проверки чекбоксов на отмечено
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
        // render SMS
        if (!$objectDocument.state.presentationGroupsHidden.includes('confirmData')) {
          $objectDocument.state.presentationGroupsHidden.push('confirmData');
        }
        if ($objectDocument.state.presentationGroupsHidden.includes('confirmSMS')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'confirmSMS');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        $objectDocument.forceUpdate();

        // this.Host.navigate('/gaz2');
      }
      // redirect('/gaz2');
      // $objectDocument.closeWithoutSave();
      // this.Host.$hostElement.setState({ selectedTreeItem: await this.Host.getClassByName('Сотрудники') })
    },
    'Подтвердить': async ($objectDocument) => {
      if ($objectDocument.state._newData['Код из СМС'] === '1111') {
        $objectDocument.Host.gazCreditFirstPageData = $objectDocument.state._newData;
        this.Host.navigate('/gaz2');
      }
    }
  };
}