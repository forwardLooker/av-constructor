
export default class {
  static id = 'HtL6UraG8Iz3L3z51f5f';
  static name = 'Газпромбанк (стр.2)';
  static Host; // инициализируется в момент соединения с классом
  
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
  
  static methods = {
    'Далее': async ($objectDocument) => {
      console.log('Далее', this.Host);
      let stopNavigate;
      // проверки полей на наличие
      if (!$objectDocument['fieldRef_Серия и номер'].state._value) {
        $objectDocument['fieldRef_Серия и номер'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Дата выдачи'].state._value) {
        $objectDocument['fieldRef_Дата выдачи'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Код подразделения'].state._value) {
        $objectDocument['fieldRef_Код подразделения'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Кем выдан'].state._value) {
        $objectDocument['fieldRef_Кем выдан'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Дата рождения'].state._value) {
        $objectDocument['fieldRef_Дата рождения'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Место рождения'].state._value) {
        $objectDocument['fieldRef_Место рождения'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Семейное положение'].state._value) {
        $objectDocument['fieldRef_Семейное положение'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }

      // проверки полей на валидность, 3 поля простые поэтому немного избыточно
      if ($objectDocument['fieldRef_Серия и номер'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Дата выдачи'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Код подразделения'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Кем выдан'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Дата рождения'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Место рождения'].state.isInvalidState) {
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Семейное положение'].state.isInvalidState) {
        stopNavigate = true
      }

      if (!stopNavigate) {
        $objectDocument.Host.gazCreditSecondPageData = $objectDocument.state._newData;
        this.Host.navigate('/gaz3');
      }
    },
  };
}