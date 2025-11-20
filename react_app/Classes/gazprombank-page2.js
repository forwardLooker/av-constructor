
export default class {
  static id = 'HtL6UraG8Iz3L3z51f5f';
  static name = 'Газпромбанк (стр.2)';
  static Host; // инициализируется в момент соединения с классом
  
  static onComponentDidMount = async ($objectDocument) => {
    $objectDocument.state.presentationGroupsHidden.push('Населенный пункт');
    $objectDocument.state.presentationGroupsHidden.push('Улица');

    $objectDocument.forceUpdate();
  }

  static on_newDataChange = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Фактический адрес проживания совпадает с адресом регистрации') {
      if (value === 'Нет') {
        if ($objectDocument.state.presentationGroupsHidden.includes('addressFactSovpadaetNo')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'addressFactSovpadaetNo');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        if ($objectDocument.state.presentationGroupsHidden.includes('Регион проживания')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'Регион проживания');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        $objectDocument.forceUpdate();
      }
      if (value === 'Да') {
        if (!$objectDocument.state.presentationGroupsHidden.includes('addressFactSovpadaetNo')) {
          $objectDocument.state.presentationGroupsHidden.push('addressFactSovpadaetNo');
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('Регион проживания')) {
          $objectDocument.state.presentationGroupsHidden.push('Регион проживания');
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('Населенный пункт проживания')) {
          $objectDocument.state.presentationGroupsHidden.push('Населенный пункт проживания');
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('Улица проживания')) {
          $objectDocument.state.presentationGroupsHidden.push('Улица проживания');
        }
        $objectDocument.state._newData['Регион проживания'] = null;
        $objectDocument.state._newData['Населенный пункт проживания'] = null;
        $objectDocument.state._newData['Улица проживания'] = null;

        $objectDocument.state._newData['Дом проживания'] = null;
        $objectDocument.state._newData['Строение проживания'] = null;
        $objectDocument.state._newData['Корпус проживания'] = null;
        $objectDocument.state._newData['Квартира проживания'] = null;

        $objectDocument.forceUpdate();
      }
    }
  }
  
  static on_fieldBlur = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Регион') {
      if (value) {
        if ($objectDocument.state.presentationGroupsHidden.includes('Населенный пункт')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'Населенный пункт');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
      }
    }
    if (fieldItemName === 'Населенный пункт') {
      if (value) {
        if ($objectDocument.state.presentationGroupsHidden.includes('Улица')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'Улица');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
      }
    }
    
    if (fieldItemName === 'Регион проживания') {
      if (value) {
        if ($objectDocument.state.presentationGroupsHidden.includes('Населенный пункт проживания')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'Населенный пункт проживания');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
          $objectDocument.forceUpdate();
        }
      }
    }
    if (fieldItemName === 'Населенный пункт проживания') {
      if (value) {
        if ($objectDocument.state.presentationGroupsHidden.includes('Улица проживания')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'Улица проживания');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
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