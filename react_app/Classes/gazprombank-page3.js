
export default class {
  static id = 'ObZ5eQhf0ryd3rM2NJlp';
  static name = 'Газпромбанк (стр.3)';
  static Host; // инициализируется в момент соединения с классом
  
  static onComponentDidMount = async ($objectDocument) => {
    $objectDocument.state.presentationGroupsHidden.push('INN organization');
    $objectDocument.forceUpdate();
  }
  
  static on_newDataChange = async ({ $objectDocument, fieldItemName, value }) => {
    if (fieldItemName === 'Категория занятости') {
      if (value === 'Работа по найму' || value === 'Служба по контракту (силовые структуры)') {
        if ($objectDocument.state.presentationGroupsHidden.includes('INN organization')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'INN organization');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        if ($objectDocument.state.presentationGroupsHidden.includes('rabotaPoNaimuAndSluzbaPoKontraktu')) {
          const idxToRemove = $objectDocument.state.presentationGroupsHidden.findIndex(prGr => prGr === 'rabotaPoNaimuAndSluzbaPoKontraktu');
          $objectDocument.state.presentationGroupsHidden.splice(idxToRemove, 1);
        }
        $objectDocument.forceUpdate();
      }
      if (value === 'Неработающий пенсионер') {
        if (!$objectDocument.state.presentationGroupsHidden.includes('rabotaPoNaimuAndSluzbaPoKontraktu')) {
          $objectDocument.state.presentationGroupsHidden.push('rabotaPoNaimuAndSluzbaPoKontraktu');
        }
        if (!$objectDocument.state.presentationGroupsHidden.includes('INN organization')) {
          $objectDocument.state.presentationGroupsHidden.push('INN organization');
        }
        $objectDocument.forceUpdate();
      }
    }
  }
  
  static methods = {
    'Далее': async ($objectDocument) => {
      console.log('Далее', this.Host);
      let stopNavigate;
      // проверки полей на наличие
      if (!$objectDocument['fieldRef_Образование'].state._value) {
        $objectDocument['fieldRef_Образование'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if (!$objectDocument['fieldRef_Категория занятости'].state._value) {
        $objectDocument['fieldRef_Категория занятости'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }
      if ($objectDocument['fieldRef_Категория занятости'].state._value !== 'Неработающий пенсионер') {
        if (!$objectDocument['fieldRef_Название организации'].state._value) {
          $objectDocument['fieldRef_Название организации'].setState({
            isInvalidState: true,
            isRequiredMessageRendered: true,
          });
          stopNavigate = true
        }
        if (!$objectDocument['fieldRef_ИНН организации'].state._value) {
          $objectDocument['fieldRef_ИНН организации'].setState({
            isInvalidState: true,
            isRequiredMessageRendered: true,
          });
          stopNavigate = true
        }
        if (!$objectDocument['fieldRef_Должность'].state._value) {
          $objectDocument['fieldRef_Должность'].setState({
            isInvalidState: true,
            isRequiredMessageRendered: true,
          });
          stopNavigate = true
        }
        if (!$objectDocument['fieldRef_Телефон работодателя'].state._value) {
          $objectDocument['fieldRef_Телефон работодателя'].setState({
            isInvalidState: true,
            isRequiredMessageRendered: true,
          });
          stopNavigate = true
        }
        if (!$objectDocument['fieldRef_Месяц и год приема на текущее место работы'].state._value) {
          $objectDocument['fieldRef_Месяц и год приема на текущее место работы'].setState({
            isInvalidState: true,
            isRequiredMessageRendered: true,
          });
          stopNavigate = true
        }
      }
      
      if (!$objectDocument['fieldRef_Доход на основном месте работы'].state._value) {
        $objectDocument['fieldRef_Доход на основном месте работы'].setState({
          isInvalidState: true,
          isRequiredMessageRendered: true,
        });
        stopNavigate = true
      }

      // проверки полей на валидность
      if ($objectDocument['fieldRef_Категория занятости'].state._value !== 'Неработающий пенсионер') {
        if ($objectDocument['fieldRef_Телефон работодателя'].state.isInvalidState) {
          stopNavigate = true
        }
        if ($objectDocument['fieldRef_Месяц и год приема на текущее место работы'].state.isInvalidState) {
          stopNavigate = true
        }
      }

      if (!stopNavigate) {
        $objectDocument.Host.gazCreditThirdPageData = $objectDocument.state._newData;
        this.Host.navigate('/gaz4');
      }
    },
  };
}