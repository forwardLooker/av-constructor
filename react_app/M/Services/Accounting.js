import {Item} from '../0-Item'

export class Accounting extends Item {
  static id = '2cE2ZCdfErMBg1serR3W';
  static name = 'Журнал учёта';
  static Host;
  static methods = [
    {
      name: 'Провести',
      target: 'objectDocument',
      location: 'ok-cancel panel',
      method: async ($objectDocument) => {

      }
    }
  ];

};
