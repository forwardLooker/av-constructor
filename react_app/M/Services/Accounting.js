import { Item } from '../0-Item'
import React from 'react';
import { AVItem } from '../../VM/0-AVItem.js';
import { AVGrid } from "../../V/AVGrid.jsx";
import { AVPropertyGrid } from "../../V/AVPropertyGrid.jsx";

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
      viewComponent: (classItem, $Class) => (<Journal classItem={classItem} $Class={$Class}></Journal>),
    }
  ];
  static methods = [
    {
      name: 'Провести',
      target: 'objectDocument',
      location: 'ok-cancel panel',
      condition: ($objectDocument) => {
        const serviceData = $objectDocument.state._newData[`service_${this.name}`];
        if (serviceData && serviceData.transactionCompleted) {
          return false;
        }
        return true;
      },
      method: async ($objectDocument) => {
        const ok = await $objectDocument.showDialog({text: 'Осуществить проводку в Журнал?'});
        if (ok) {
          const operations = await this.Host.getClassByName('Проводки').getObjectDocuments();
          const objectDocument = $objectDocument.props.objectDocument;
          const operationObj = operations.find(op => op.documentClassLink.id === objectDocument.Class.id);

          await $objectDocument.save();
          const objData = objectDocument.data;
          const recordObjInJournal = await this.Host.getClassByName('Журнал').createObjectDocument({
            readOnly: true,
            name: operationObj.name,
            documentClassLink: operationObj.documentClassLink,
            documentLink: objData,
            accountingDate: objData[operationObj.accountingDateFieldName],
            transactions: operationObj.transactions.map(tr => {
              const analyticsOutOfTable = tr.analytics.filter(an => !an.sourceTableFieldName);
              const analyticsOutOfTableFromDocument = analyticsOutOfTable.map(a => {
                let analyticsObj = {};
                analyticsObj[a.name] = objData[a.sourceFieldName];
                return analyticsObj
              });
              const analyticsFromOfTable = tr.analytics.filter(an => an.sourceTableFieldName);
              const tablesNames = analyticsFromOfTable.reduce((acc, param) => {
                const currentTableName = param.sourceTableFieldName;
                if (acc.findIndex(tblName => tblName === currentTableName) === -1) {
                  acc.push(currentTableName);
                }
                return acc;
              }, []);
              let gainedTableItemsWithAnalyticsFromAllTablesFromDocument = [];
              tablesNames.forEach(tblName => {
                let gainedTableItemsWithAnalitics = objData[tblName].map(tblItem => {
                  let analyticsObj = {};
                  analyticsFromOfTable.forEach(analytic => {
                    if (analytic.sourceTableFieldName === tblName) {
                      analyticsObj[analytic.name] = tblItem[analytic.sourceFieldName]
                    }
                  })
                  return analyticsObj;
                });
                gainedTableItemsWithAnalyticsFromAllTablesFromDocument = gainedTableItemsWithAnalyticsFromAllTablesFromDocument.concat(gainedTableItemsWithAnalitics);
                // gainedTableItemsWithAnalyticsFromAllTablesFromDocument.push({'table name': tblName, analytics: gainedTableItemsWithAnalitics});
              });

              return {
                name: tr.name,
                debit: tr.debit,
                credit: tr.credit,
                commonAnalytics: analyticsOutOfTableFromDocument,
                tableAnalytics: gainedTableItemsWithAnalyticsFromAllTablesFromDocument
              }
            }),
          });

          $objectDocument.state._newData.readOnly = true;
          $objectDocument.state._newData[`service_${this.name}`] = {
            transactionCompleted: true,
            transactionMadeDate: new Date().toLocaleString(),
            accountingDate: $objectDocument.state._newData[operationObj.accountingDateFieldName],
            objectInJournal: {
              id: recordObjInJournal.id,
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
        if (serviceData && serviceData.transactionCompleted) {
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
    classItem: null,
    $Class: null
  }
  
  state = {
    operations: [],
    accounts: []
  }

  columns = [ // Скопировано из отладки
    {
      name: 'name',
      label: "Счёт",
      dataType: "string"
    },
    {
      name: "balanceAtTheBeginningOfThePeriod",
      label: "Сальдо на начало периода",
      dataType: "object",
      variant: "structured-object-field",
      items: [
        {
          name: "debit",
          label: "Дебет",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        }
      ],
    },
    {
      name: "turnoverForThePeriod",
      label: "Обороты за период",
      dataType: "object",
      variant: "structured-object-field",
      items: [
        {
          name: "debit",
          label: "Дебет",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        }
      ]
    },
    {
      name: "balanceAtTheEndOfThePeriod",
      label: "Сальдо на конец периода",
      dataType: "object",
      variant: "structured-object-field",
      items: [
        {
          name: "debit",
          label: "Дебет",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "string",
          formatOutputInGrid: value => value === 0 ? '' : value
        }
      ],
    }
  ]
  
  render() {
    return (
      <div className="margin-top-8">
        <AVGrid
          items={this.state.accounts}
          columns={this.columns}
          isRowSelectable
          onRowClickFunc={(rowItem) => {
            const propertyItems = rowItem.analyticsPossibleValues.map(anItem => {
              const analyticName = Object.keys(anItem)[0];
              return {
                name: `${analyticName}`,
                dataType: "null",
                expanded: true,
                items: anItem[analyticName].map(anValue => ({
                  name: typeof anValue === 'object' ? anValue.name : anValue,
                  dataType: 'boolean'
                }))
              }
            });
            let inspectedItem = {};
            rowItem.analyticsPossibleValues.forEach(anItem => {
              const analyticName = Object.keys(anItem)[0];
              anItem[analyticName].forEach(anValue => {
                if (typeof inspectedItem[analyticName] !== 'object') {
                  inspectedItem[analyticName] = {}
                }
                if (typeof anValue === 'object') {
                  inspectedItem[analyticName][anValue.name] = true;
                } else {
                  inspectedItem[analyticName][anValue] = true;
                }
              })
            })
            // запомнить изначальный rowItem debit credit, чтобы вернуть его после закрытия панели
            this.props.$Class.showParametersPanel(() => {
              return (
                <div>
                  Аналитические параметры
                  <AVPropertyGrid
                      inspectedItem={inspectedItem}
                      propertyItems={propertyItems}
                      isStructuredFillingOfInspectedItem
                      onChangeFunc={(value, propItem, inspectedItem) => {
                        if (Array.isArray(rowItem.turnoverForThePeriodAggregatedData.debit)) {
                          const debitAggrDataFiltered = rowItem.turnoverForThePeriodAggregatedData.debit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const debitSum = debitAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          rowItem.turnoverForThePeriod.debit = debitSum;
                        }
                        if (Array.isArray(rowItem.turnoverForThePeriodAggregatedData.credit)) {
                          const creditAggrDataFiltered = rowItem.turnoverForThePeriodAggregatedData.credit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const creditSum = creditAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          rowItem.turnoverForThePeriod.credit = creditSum;
                        }
                        this.setState(state => ({accounts: [...state.accounts]}));
                      }}
                  ></AVPropertyGrid>
                </div>
              )
            })
          }}
          onRowContextMenuFunc={this.noop}
        ></AVGrid>
      </div>
    )
  }
  
  async componentDidMount() {
    const operations = await this.props.classItem.getObjectDocuments();
    let accounts = operations.reduce((accAccs, op) => {
      op.transactions.forEach(tr => {
        const additional = tr.tableAnalytics.reduce((accT, row) => {
          if (row.amount) {
            return accT + Number(row.amount)
          }
          return accT
        }, 0);

        const debitAccName = tr.debit.name;
        let accountForDebit = accAccs.find(acc => acc.name === debitAccName);
        const analyticsPossibleValues = tr.commonAnalytics.map(commonParam => {
          const paramName = Object.keys(commonParam)[0];
          const paramValue = commonParam[paramName];
          return {
            [paramName]: [paramValue]
          }
        });
        let analyticsFromTablePossibleValues = [];
        tr.tableAnalytics.forEach(tableRowRecord => {
          const analyticsPropsArr = Object.keys(tableRowRecord).filter(prop => prop !== 'count' && prop !== 'amount');
          analyticsPropsArr.forEach(prop => {
            const itemWithValues = analyticsFromTablePossibleValues.find(analyticsObj => Array.isArray(analyticsObj[prop]))
            if (!itemWithValues) {
              let item = {};
              item[prop] = [tableRowRecord[prop]];
              analyticsFromTablePossibleValues.push(item);
            } else {
              const existedValue = itemWithValues[prop].find(value => {
                if (typeof value === 'object') {
                  return value.id === tableRowRecord[prop].id
                } else {
                  return value === tableRowRecord[prop]
                }
              });
              if (!existedValue) {
                itemWithValues[prop].push(tableRowRecord[prop])
              }
            }
          })
        });
        const tableAnalyticsPopulatedWithCommonAnalytics = tr.tableAnalytics.map(row => {
          let newRow = row;
          tr.commonAnalytics.forEach(an => {
            newRow = {...an, ...newRow}
          });
          return newRow;
        });
        if (!accountForDebit) {
          accountForDebit = {
            name: debitAccName,
            balanceAtTheBeginningOfThePeriod: {
              debit: 0,
              credit: 0
            },
            turnoverForThePeriod: {
              debit: additional,
              credit: 0
            },
            turnoverForThePeriodAggregatedData: {debit: tableAnalyticsPopulatedWithCommonAnalytics, credit: []},
            accountType: tr.debit.accountType,
            analyticsPossibleValues,
          };
          accountForDebit.analyticsPossibleValues = accountForDebit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForDebit);
        } else {
          // Прибавить к общему Дебету счёта дельту от проводки
          accountForDebit.turnoverForThePeriod.debit = accountForDebit.turnoverForThePeriod.debit + additional;
          // Добавить список возможных общих аналитик
          tr.commonAnalytics.forEach(commonParam => {
            const paramName = Object.keys(commonParam)[0];
            const paramValue = commonParam[paramName];
            const analyticValuesObj = accountForDebit.analyticsPossibleValues.find(possibleParam => Object.keys(possibleParam)[0] === paramName);
            if (analyticValuesObj[paramName].findIndex(value => {
              if (typeof value === 'object') {
                return value.id === paramValue.id
              }
              return value === paramValue
            }) === -1) {
              analyticValuesObj[paramName].push(paramValue);
            }
          });
          // Добавить список возможных аналитик из таблиц
          accountForDebit.analyticsPossibleValues.forEach(i => {
            const analyticName = Object.keys(i)[0];
            const analyticsItemFromTable = analyticsFromTablePossibleValues.find(iFromTable => Array.isArray(iFromTable[analyticName]));
            if (analyticsItemFromTable) {
              const uniqueValuesFromTableArr = analyticsItemFromTable[analyticName].filter(value => {
                if (typeof value === 'object') {
                  return i[analyticName].every(v => v.id !== value.id)
                } else {
                  return i[analyticName].every(v => v !== value)
                }
              });
              i[analyticName] = i[analyticName].concat(uniqueValuesFromTableArr);
            }
          });
          const uniqueAnalyticItems = analyticsFromTablePossibleValues.filter(iFromTable => {
            const name = Object.keys(iFromTable)[0];
            return accountForDebit.analyticsPossibleValues.findIndex(obj => Array.isArray(obj[name])) === -1
          });
          accountForDebit.analyticsPossibleValues = accountForDebit.analyticsPossibleValues.concat(uniqueAnalyticItems);
          // Добавление табличных данных в одну таблицу
          accountForDebit.turnoverForThePeriodAggregatedData.debit = accountForDebit.turnoverForThePeriodAggregatedData.debit.concat(tableAnalyticsPopulatedWithCommonAnalytics);
        }
        const creditAccName = tr.credit.name;
        let accountForCredit = accAccs.find(acc => acc.name=== creditAccName);
        if (!accountForCredit) {
          accountForCredit = {
            name: creditAccName,
            balanceAtTheBeginningOfThePeriod: {
              debit: 0,
              credit: 0
            },
            turnoverForThePeriod: {
              debit: 0,
              credit: additional,
            },
            turnoverForThePeriodAggregatedData: {debit: [], credit: tableAnalyticsPopulatedWithCommonAnalytics},
            accountType: tr.credit.accountType,
            analyticsPossibleValues,
          };
          accountForCredit.analyticsPossibleValues = accountForCredit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForCredit);
        } else {
          // Прибавить к общему Кредиту счёта дельту от проводки
          accountForCredit.turnoverForThePeriod.credit = accountForCredit.turnoverForThePeriod.credit + additional;
          // Добавить список возможных общих аналитик
          tr.commonAnalytics.forEach(commonParam => {
            const paramName = Object.keys(commonParam)[0];
            const paramValue = commonParam[paramName];
            const analyticValuesObj = accountForCredit.analyticsPossibleValues.find(possibleParam => Object.keys(possibleParam)[0] === paramName);
            if (analyticValuesObj[paramName].findIndex(value => {
              if (typeof value === 'object') {
                return value.id === paramValue.id
              }
              return value === paramValue
            }) === -1) {
              analyticValuesObj[paramName].push(paramValue);
            }
          });
          // Добавить список возможных аналитик из таблиц
          accountForCredit.analyticsPossibleValues.forEach(i => {
            const analyticName = Object.keys(i)[0];
            const analyticsItemFromTable = analyticsFromTablePossibleValues.find(iFromTable => Array.isArray(iFromTable[analyticName]));
            if (analyticsItemFromTable) {
              const uniqueValuesFromTableArr = analyticsItemFromTable[analyticName].filter(value => {
                if (typeof value === 'object') {
                  return i[analyticName].every(v => v.id !== value.id)
                } else {
                  return i[analyticName].every(v => v !== value)
                }
              });
              i[analyticName] = i[analyticName].concat(uniqueValuesFromTableArr);
            }
          });
          const uniqueAnalyticItems = analyticsFromTablePossibleValues.filter(iFromTable => {
            const name = Object.keys(iFromTable)[0];
            return accountForCredit.analyticsPossibleValues.findIndex(obj => Array.isArray(obj[name])) === -1
          });
          accountForCredit.analyticsPossibleValues = accountForCredit.analyticsPossibleValues.concat(uniqueAnalyticItems);
          // Добавление табличных данных в одну таблицу
          accountForCredit.turnoverForThePeriodAggregatedData.credit = accountForCredit.turnoverForThePeriodAggregatedData.credit.concat(tableAnalyticsPopulatedWithCommonAnalytics);
        }
      });
      return accAccs;
    }, []);
    // accountsWithCalculatedBalance - сальдо на конец периода
    accounts.forEach(acc => {
      acc.balanceAtTheEndOfThePeriod = {};
      const debitAtStart = acc.balanceAtTheBeginningOfThePeriod.debit;
      const creditAtStart = acc.balanceAtTheBeginningOfThePeriod.credit;
      const diff = (acc.turnoverForThePeriod.debit || 0) - (acc.turnoverForThePeriod.credit || 0);
      if (acc.accountType === 'Активный') {
        acc.balanceAtTheEndOfThePeriod.debit = debitAtStart + diff
      }
      if (acc.accountType === 'Пассивный') {
        acc.balanceAtTheEndOfThePeriod.credit = creditAtStart - diff
      }
      if (acc.accountType === 'Активно-Пассивный') {
        if (debitAtStart > 0) {
          const balance = debitAtStart + diff;
          if (balance > 0) {
            acc.balanceAtTheEndOfThePeriod.debit = balance;
          }
          if (balance < 0) {
            acc.balanceAtTheEndOfThePeriod.credit = Math.abs(balance)
          }
        } else if (creditAtStart > 0) {
          const balance = creditAtStart - diff;
          if (balance > 0) {
            acc.balanceAtTheEndOfThePeriod.credit = balance
          }
          if (balance < 0) {
            acc.balanceAtTheEndOfThePeriod.debit = Math.abs(balance);
          }
        } else {
          if (diff > 0) {
            acc.balanceAtTheEndOfThePeriod.debit = diff;
          }
          if (diff < 0) {
            acc.balanceAtTheEndOfThePeriod.credit = Math.abs(diff);
          }
        }
      }
    })
    this.setState({ operations, accounts });
  }
}

