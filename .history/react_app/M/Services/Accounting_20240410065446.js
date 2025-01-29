import { Item } from '../0-Item'
import React from 'react';
import { AVItem } from '../../VM/0-AVItem.js';
import { AVGrid } from "../../V/AVGrid.jsx";


export class Accounting extends Item {
  static id = '2cE2ZCdfErMBg1serR3W';
	static name = 'Журнал учёта';
	static itemType = 'domain';
	static Host;
	static views = [
		{
			className: 'Журнал',
			classId: 'Y25mhmAmLcV9HklpR2Ad',
			viewName: 'Журнал',
      viewComponent: (classItem) => (<Journal classItem={classItem}></Journal>),
		}
	];
  static methods = [
    {
      name: 'Провести',
      target: 'objectDocument',
      location: 'ok-cancel panel',
      condition: ($objectDocument) => {
        const serviceData = $objectDocument.state._newData[`service_${this.name}`];
        if (serviceData && serviceData['Проведено']) {
          return false;
        }
        return true;
      },
      method: async ($objectDocument) => {
        const ok = await $objectDocument.showDialog({text: 'Осуществить проводку в Журнал?'});
        if (ok) {
          const operations = await this.Host.getClassByName('Проводки').getObjectDocuments();
          const objectDocument = $objectDocument.props.objectDocument;
          const operationObj = operations.find(pr => pr['Документ'].id === objectDocument.Class.serverRef.id);

          await $objectDocument.save();
          const objData = objectDocument.data;
          const recordObjInJournal = await this.Host.getClassByName('Журнал').createObjectDocument({
            readOnly: true,
            'Название операции': operationObj['Название операции'],
            'Класс документов': operationObj['Документ'],
            'Объект документа': objData,
            'Дата': objData[operationObj['Название поля даты']],
            'Проводки': operationObj['Проводки'].map(pr => {
              const analiticsOutOfTable = pr['Аналитические параметры'].filter(an => !an['Таблица источник']);
              const analiticsOutOfTableFromDocument = analiticsOutOfTable.map(a => {
                let analiticsObj = {};
                analiticsObj[a['Название параметра']] = objData[a['Поле источник']];
                return analiticsObj
              });
              const analiticsFromOfTable = pr['Аналитические параметры'].filter(an => an['Таблица источник']);
              const tablesNames = analiticsFromOfTable.reduce((acc, param) => {
                const currentTableName = param['Таблица источник'];
                if (acc.findIndex(tblName => tblName === currentTableName) === -1) {
                  acc.push(currentTableName);
                }
                return acc;
              }, []);
              let gainedTableItemsWithAnaliticsFromAllTablesFromDocument = [];
              tablesNames.forEach(tblName => {
                let gainedTableItemsWithAnalitics = objData[tblName].map(tblItem => {
                  let analiticsObj = {};
                  analiticsFromOfTable.forEach(analitic => {
                    if (analitic['Таблица источник'] === tblName) {
                      analiticsObj[analitic['Название параметра']] = tblItem[analitic['Поле источник']]
                    }
                  })
                  return analiticsObj;
                });
                gainedTableItemsWithAnaliticsFromAllTablesFromDocument.push({'table name': tblName, 'Аналитические парметры': gainedTableItemsWithAnalitics});
              });

              return {
                'Название проводки': pr['Название проводки'],
                'Дебет': pr['Дебет'],
                'Кредит': pr['Кредит'],
                'Аналитические параметры общие': analiticsOutOfTableFromDocument,
                'Аналитические парметры табличные': gainedTableItemsWithAnaliticsFromAllTablesFromDocument
              }
            }),
          });

          $objectDocument.state._newData.readOnly = true;
          $objectDocument.state._newData[`service_${this.name}`] = {
            'Проведено': true,
            'Дата осуществления проводки': new Date().toLocaleString(),
            'Учётная дата': $objectDocument.state._newData[operationObj['Название поля даты']],
            objectInJournal: {
              id: recordObjInJournal.serverRef.id,
              reference: recordObjInJournal.serverRef
            }
          };
          await $objectDocument.save();
        }
      }
    },

    {
      name: 'Отменить проводку',
      target: 'objectDocument',
      location: 'ok-cancel panel',
      condition: ($objectDocument) => {
        const serviceData = $objectDocument.state._newData[`service_${this.name}`];
        if (serviceData && serviceData['Проведено']) {
          return true;
        }
        return false;
      },
      method: async ($objectDocument) => {
        const ok = await $objectDocument.showDialog({text: 'Отменить проводку в Журнале?'});
        if (ok) {
          const serviceData = $objectDocument.state._newData[`service_${this.name}`];
          const objectDocument = await $objectDocument.props.objectDocument.Class.getObjectDocument(serviceData.objectInJournal.reference);
          await objectDocument.deleteObjectDocument();
          $objectDocument.state._newData[`service_${this.name}`] = this.Host.FieldValue.delete();
          $objectDocument.state._newData.readOnly = this.Host.FieldValue.delete();
          await $objectDocument.save();
          delete $objectDocument.state._newData[`service_${this.name}`];
          delete $objectDocument.state._newData.readOnly;
        }
      }
    }
  ];

};

class Journal extends AVItem {
  static defaultProps = {
    classItem: null
  }
  
  state = {
    objectDocuments: []
  }

  columns = [
    {
      "name": "Счёт",
      "label": "Счёт",
      "dataType": "string"
    },
    {
      "dataType": "object",
      "label": "Сальдо на начало периода",
      "items": [
        {
          "label": "Дебет",
          "dataType": "string",
          "name": "Дебет"
        },
        {
          "name": "Кредит",
          "label": "Кредит",
          "dataType": "string"
        }
      ],
      "name": "Сальдо на начало периода",
      "variant": "structured-object-field"
    },
    {
      "label": "Обороты за период",
      "dataType": "object",
      "variant": "structured-object-field",
      "name": "Обороты за период",
      "items": [
        {
          "label": "Дебет",
          "dataType": "string",
          "name": "Дебет"
        },
        {
          "label": "Кредит",
          "name": "Кредит",
          "dataType": "string"
        }
      ]
    },
    {
      "label": "Сальдо на конец периода",
      "items": [
        {
          "dataType": "string",
          "name": "Дебет",
          "label": "Дебет"
        },
        {
          "dataType": "string",
          "name": "Кредит",
          "label": "Кредит"
        }
      ],
      "dataType": "object",
      "variant": "structured-object-field",
      "name": "Сальдо на конец периода"
    }
  ]
  
  render() {
    return (
      <div className="margin-top-8">
        <AVGrid
          items={[]}
          columns={this.columns}
          onRowClickFunc={this.noop}
          onRowContextMenuFunc={this.noop}
        ></AVGrid>
      </div>
    )
  }
  
  async componentDidMount() {
    const operations = await this.props.classItem.getObjectDocuments();
    console.log('objectDocuments', operations);
    let accounts = [];
    operations.forEach(op => {
      op['Проводки'].forEach(pr => {
        const debitAccName = pr['Дебет'].name;
        let accountForDebit = accounts.find(acc => acc.name === debitAccName);
        if (!accountForDebit) {
          accountForDebit = {
            'Cчёт': pr['Дебет'].name,
            'Обороты за период': {
              'Дебет': pr['Аналитические парметры табличные'].reduce((accAllTables, table) => {
                return accAllTables + table['Аналитические парметры'].reduce((accT, row) => {
                  if (row.['Сумма']) {
                    return accT + row.['Сумма']
                  }
                  return accT
                }, 0)
              }, 0)
            }
          };
          accounts.push(accountForDebit);
        } else {
          const additional = pr['Аналитические парметры табличные'].reduce((accAllTables, table) => {
            return accAllTables + table['Аналитические парметры'].reduce((accT, row) => {
              if (row.['Сумма']) {
                return accT + row.['Сумма']
              }
              return accT
            }, 0)
          }, 0);
          accountForDebit['Обороты за период']['Дебет'] = accountForDebit['Обороты за период']['Дебет'] + additional;
        }
        const creditAccName = pr['Кредит'].name;
        let accountForCredit = accounts.find(acc => acc.name === creditAccName);
        if (!accountForCredit) {
          accountForCredit = {
            'Cчёт': pr['Кредит'].name,
            'Обороты за период': {
              'Кредит': pr['Аналитические парметры табличные'].reduce((accAllTables, table) => {
                return accAllTables + table['Аналитические парметры'].reduce((accT, row) => {
                  if (row.['Сумма']) {
                    return accT + row.['Сумма']
                  }
                  return accT
                }, 0)
              }, 0)
            }
          };
          accounts.push(accountForCredit);
        } else {
          const additional = pr['Аналитические парметры табличные'].reduce((accAllTables, table) => {
            return accAllTables + table['Аналитические парметры'].reduce((accT, row) => {
              if (row.['Сумма']) {
                return accT + row.['Сумма']
              }
              return accT
            }, 0)
          }, 0);
          accountForDebit['Обороты за период']['Кредит'] = accountForDebit['Обороты за период']['Дебет'] + additional;
        }

      })
    })
  }
}

