
export default class {
  static id = 'HtL6UraG8Iz3L3z51f5f';
  static name = 'Газпромбанк (стр.2)';
  static Host; // инициализируется в момент соединения с классом
  // static onComponentDidMount = async ($objectDocument) => {
  //   if (!$objectDocument.state._newData['Я налоговый резидент только РФ']) {
  //     if (!$objectDocument.state.presentationGroupsHidden.includes('nalogResidentNo')) {
  //       $objectDocument.state.presentationGroupsHidden.push('nalogResidentNo');
  //       $objectDocument.forceUpdate();
  //     }
  //   }
  //   $objectDocument.state.presentationGroupsHidden.push('confirmSMS');
  //   $objectDocument.forceUpdate();
  // }
  static on_newDataChange = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Фактический адрес проживания совпадает с адресом регистрации') {
      if (value === 'Нет') {
        if ($objectDocument.state.presentationGroupsHidden.includes('addressFactSovpadaetNo')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'addressFactSovpadaetNo');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
      }
      if (value === 'Да') {
        if (!$objectDocument.state.presentationGroupsHidden.includes('addressFactSovpadaetNo')) {
          $objectDocument.state.presentationGroupsHidden.push('addressFactSovpadaetNo');
          $objectDocument.forceUpdate();
        }
      }
    }
  }
  // static methods = {
  //   'Подтвердить данные': async ($objectDocument) => {
  //     console.log('Подтвердить данные успех', this.Host);
  //     let stopNavigate;
  //     // проверки полей на наличие
  //     if (!$objectDocument['fieldRef_Фамилия Имя Отчество'].state._value) {
  //       $objectDocument['fieldRef_Фамилия Имя Отчество'].setState({
  //         isInvalidState: true,
  //         isRequiredMessageRendered: true,
  //       });
  //       stopNavigate = true
  //     }
  //     if (!$objectDocument['fieldRef_Мобильный телефон'].state._value) {
  //       $objectDocument['fieldRef_Мобильный телефон'].setState({
  //         isInvalidState: true,
  //         isRequiredMessageRendered: true,
  //       });
  //       stopNavigate = true
  //     }
  //     if (!$objectDocument['fieldRef_Email'].state._value) {
  //       $objectDocument['fieldRef_Email'].setState({
  //         isInvalidState: true,
  //         isRequiredMessageRendered: true,
  //       });
  //       stopNavigate = true
  //     }
  //     // проверки полей на валидность
  //     if ($objectDocument['fieldRef_Я налоговый резидент только РФ'].state._value !== 'Да') {
  //       $objectDocument['fieldRef_Я налоговый резидент только РФ'].setState({
  //         isInvalidState: true,
  //         isInvalidMessageRendered: true,
  //         invalidMessage: 'Выберите один из вариантов',
  //       });
  //       stopNavigate = true
  //     }
  //     if ($objectDocument['fieldRef_Мобильный телефон'].state.isInvalidState) {
  //       stopNavigate = true
  //     }
  //     if ($objectDocument['fieldRef_Email'].state.isInvalidState) {
  //       stopNavigate = true
  //     }
  //     // проверки чекбоксов на отмечено
  //     if (!$objectDocument['fieldRef_Я подтверждаю заявку и даю согласие на обработку персональных данных'].state._value) {
  //       $objectDocument['fieldRef_Я подтверждаю заявку и даю согласие на обработку персональных данных'].setState({
  //         isInvalidState: true,
  //         isInvalidMessageRendered: true,
  //         invalidMessage: 'Заявка не может быть обработана без вашего согласия',
  //       });
  //       stopNavigate = true
  //     }
  //     if (!$objectDocument['fieldRef_Я даю согласие на передачу третьим лицам персональных данных'].state._value) {
  //       $objectDocument['fieldRef_Я даю согласие на передачу третьим лицам персональных данных'].setState({
  //         isInvalidState: true,
  //         isInvalidMessageRendered: true,
  //         invalidMessage: 'Заявка не может быть обработана без вашего согласия',
  //       });
  //       stopNavigate = true
  //     }
  //     if (!$objectDocument['fieldRef_Я даю согласие на получение Банком информации из БКИ'].state._value) {
  //       $objectDocument['fieldRef_Я даю согласие на получение Банком информации из БКИ'].setState({
  //         isInvalidState: true,
  //         isInvalidMessageRendered: true,
  //         invalidMessage: 'Заявка не может быть обработана без вашего согласия',
  //       });
  //       stopNavigate = true
  //     }


  //     if (!stopNavigate) {
  //       // render SMS
  //       if (!$objectDocument.state.presentationGroupsHidden.includes('confirmData')) {
  //         $objectDocument.state.presentationGroupsHidden.push('confirmData');
  //       }
  //       if ($objectDocument.state.presentationGroupsHidden.includes('confirmSMS')) {
  //         const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'confirmSMS');
  //         $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
  //       }
  //       $objectDocument.forceUpdate();

  //       // this.Host.navigate('/gaz2');
  //     }
  //     // redirect('/gaz2');
  //     // $objectDocument.closeWithoutSave();
  //     // this.Host.$hostElement.setState({ selectedTreeItem: await this.Host.getClassByName('Сотрудники') })
  //   },
  //   'Подтвердить': async ($objectDocument) => {
  //     if ($objectDocument.state._newData['Код из СМС'] === '1111') {
  //       this.Host.navigate('/gaz2');
  //     }
  //   }
  // };
}