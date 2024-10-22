import { Item } from '../0-Item'
import React from 'react';
import { AVItem } from '../../VM/0-AVItem.js';
import { AVGrid } from "../../V/AVGrid.jsx";
import { AVPropertyGrid } from "../../V/AVPropertyGrid.jsx";
import {AVLabel} from "../../V/AVLabel.jsx";
import {AVField} from "../../VM/5-AVField.jsx";
import {AVButton} from "../../V/AVButton.jsx";

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
          // const objectDocument = await $objectDocument.props.objectDocument.Class.getObjectDocument(serviceData.objectInJournal.reference);
          // await objectDocument.deleteObjectDocument();
          await serviceData.objectInJournal.reference.delete();
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
    accounts: [],

    periodStartDate: null,
    periodEndDate: null
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
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
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
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
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
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
        },
        {
          name: "credit",
          label: "Кредит",
          dataType: "object",
          formatOutputInGrid: ({amount, count}) => {
            return (
              <div>
                {amount !== 0 ? (<div>{amount}</div>) : ''}
                {count !== 0 ? (<div className="color-text-secondary">{count}</div>) : ""}
              </div>
            )
          }
        }
      ],
    }
  ]
  
  render() {
    return (
      <div className="col margin-top-8">
        <div className="row margin-bottom-8">
          <div className="row width-50prc">
            <AVLabel>Период</AVLabel>
            <AVField
              fieldItem={{
                label: 'с',
                dataType: 'string',
                variant: 'date'
              }}
              value={this.state.periodStartDate}
              onChangeFunc={(value) => this.setState({periodStartDate: value})}
            ></AVField>
            <AVField
              fieldItem={{
                label: 'по',
                dataType: 'string',
                variant: 'date'
              }}
              value={this.state.periodEndDate}
              onChangeFunc={(value) => this.setState({periodEndDate: value})}
            ></AVField>
          </div>
          <AVButton onClick={this.makeFilteredBalance}>Сформировать</AVButton>
        </div>
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
                        if (rowItem.turnoverForThePeriodAggregatedData && Array.isArray(rowItem.turnoverForThePeriodAggregatedData.debit)) {
                          const debitAggrDataFiltered = rowItem.turnoverForThePeriodAggregatedData.debit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const debitSumAmount = debitAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          const debitSumCount = debitAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.count)
                          }, 0);
                          rowItem.turnoverForThePeriod.debit.amount = debitSumAmount;
                          rowItem.turnoverForThePeriod.debit.count = debitSumCount;
                        }
                        if (rowItem.turnoverForThePeriodAggregatedData && Array.isArray(rowItem.turnoverForThePeriodAggregatedData.credit)) {
                          const creditAggrDataFiltered = rowItem.turnoverForThePeriodAggregatedData.credit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const creditSumAmount = creditAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          const creditSumCount = creditAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.count)
                          }, 0);
                          rowItem.turnoverForThePeriod.credit.amount = creditSumAmount;
                          rowItem.turnoverForThePeriod.credit.count = creditSumCount;
                        }

                        // --

                        if (rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData && Array.isArray(rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.debit)) {
                          const debitAggrDataFiltered = rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.debit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const debitSumAmount = debitAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          const debitSumCount = debitAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.count)
                          }, 0);
                          rowItem.balanceAtTheBeginningOfThePeriod.debit.amount = debitSumAmount;
                          rowItem.balanceAtTheBeginningOfThePeriod.debit.count = debitSumCount;
                        }
                        if (rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData && Array.isArray(rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.credit)) {
                          const creditAggrDataFiltered = rowItem.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.credit.filter(row => {
                            return Object.keys(row).filter(analyticName => analyticName !== 'count' && analyticName !== 'amount').every(analyticName => {
                              let analyticValue = typeof row[analyticName] === 'object' ? row[analyticName].name : row[analyticName];
                              return inspectedItem[analyticName][analyticValue] === true
                            })
                          });
                          const creditSumAmount = creditAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.amount)
                          }, 0);
                          const creditSumCount = creditAggrDataFiltered.reduce((acc, row) => {
                            return acc + Number(row.count)
                          }, 0);
                          rowItem.balanceAtTheBeginningOfThePeriod.credit.amount = creditSumAmount;
                          rowItem.balanceAtTheBeginningOfThePeriod.credit.count = creditSumCount;
                        }

                        // --

                        const debitAmountAtStart = rowItem.balanceAtTheBeginningOfThePeriod.debit.amount;
                        const creditAmountAtStart = rowItem.balanceAtTheBeginningOfThePeriod.credit.amount;
                        const diffAmount = (rowItem.turnoverForThePeriod.debit.amount || 0) - (rowItem.turnoverForThePeriod.credit.amount || 0);

                        const debitCountAtStart = rowItem.balanceAtTheBeginningOfThePeriod.debit.count;
                        const creditCountAtStart = rowItem.balanceAtTheBeginningOfThePeriod.credit.count;
                        const diffCount = (rowItem.turnoverForThePeriod.debit.count || 0) - (rowItem.turnoverForThePeriod.credit.count || 0);

                        if (rowItem.accountType === 'Активный') {
                          rowItem.balanceAtTheEndOfThePeriod.debit.amount = debitAmountAtStart + diffAmount;
                          rowItem.balanceAtTheEndOfThePeriod.debit.count = debitCountAtStart + diffCount;
                        }
                        if (rowItem.accountType === 'Пассивный') {
                          rowItem.balanceAtTheEndOfThePeriod.credit.amount = creditAmountAtStart - diffAmount;
                          rowItem.balanceAtTheEndOfThePeriod.credit.count = creditCountAtStart - diffCount;
                        }
                        if (rowItem.accountType === 'Активно-Пассивный') {
                          if (debitAmountAtStart > 0) {
                            const balance = debitAmountAtStart + diffAmount;
                            if (balance > 0) {
                              rowItem.balanceAtTheEndOfThePeriod.debit.amount = balance;
                            }
                            if (balance < 0) {
                              rowItem.balanceAtTheEndOfThePeriod.credit.amount = Math.abs(balance)
                            }
                          } else if (creditAmountAtStart > 0) {
                            const balanceAmount = creditAmountAtStart - diffAmount;
                            const balamceCount = creditCountAtStart - diffCount;
                            if (balanceAmount > 0) {
                              rowItem.balanceAtTheEndOfThePeriod.credit.amount = balanceAmount;
                              rowItem.balanceAtTheEndOfThePeriod.credit.count = balamceCount;
                            }
                            if (balanceAmount < 0) {
                              rowItem.balanceAtTheEndOfThePeriod.debit.amount = Math.abs(balanceAmount);
                              rowItem.balanceAtTheEndOfThePeriod.debit.count = Math.abs(balamceCount);
                            }
                          } else {
                            if (diffAmount > 0) {
                              rowItem.balanceAtTheEndOfThePeriod.debit.amount = diffAmount;
                              rowItem.balanceAtTheEndOfThePeriod.debit.count = diffCount;
                            }
                            if (diffAmount < 0) {
                              rowItem.balanceAtTheEndOfThePeriod.credit.amount = Math.abs(diffAmount);
                              rowItem.balanceAtTheEndOfThePeriod.credit.count = Math.abs(diffCount);
                            }
                          }
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
  }

  makeFilteredBalance = async () => {
    const operations = await this.props.classItem.getObjectDocuments();

    // Операции отфильтрованные за период для оборотов
    const operationsFilteredByPeriodForTurnover = operations.filter(item => {
      const accountingDateObj = new Date(item.accountingDate);
      const periodStartDateObj = new Date(this.state.periodStartDate);
      const periodEndDateObj = new Date(this.state.periodEndDate);
      if ((accountingDateObj >= periodStartDateObj) && (accountingDateObj <= periodEndDateObj)) {
        return true
      } else {
        return false
      }
    });

    // Операции отфильтрованные за период для Сальдо на начало периода
    const operationsFilteredByPeriodForBalanceAtTheBeginningOfThePeriod = operations.filter(item => {
      const accountingDateObj = new Date(item.accountingDate);
      const periodStartDateObj = new Date(this.state.periodStartDate);
      if (accountingDateObj < periodStartDateObj) {
        return true
      } else {
        return false
      }
    });

    // Счета для которых посчитаны суммарный дебит и кредит, и сформирован массив-таблица с аналитиками
    // для Сальдо на начало периода
    let accountsForBalanceAtTheBeginningOfThePeriod = operationsFilteredByPeriodForBalanceAtTheBeginningOfThePeriod.reduce((accAccs, op) => {
      op.transactions.forEach(tr => {
        const additionalAmount = tr.tableAnalytics.reduce((accT, row) => {
          if (row.amount) {
            return accT + Number(row.amount)
          }
          return accT
        }, 0);
        const additionalCount = tr.tableAnalytics.reduce((accT, row) => {
          if (row.count) {
            return accT + Number(row.count)
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
              debit: {amount: additionalAmount, count: additionalCount},
              credit: {amount: 0, count: 0}
            },
            turnoverForThePeriod: {
              debit: {amount: 0, count: 0},
              credit: {amount: 0, count: 0}
            },
            balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData: {debit: tableAnalyticsPopulatedWithCommonAnalytics, credit: []},
            accountType: tr.debit.accountType,
            analyticsPossibleValues,
          };
          accountForDebit.analyticsPossibleValues = accountForDebit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForDebit);
        } else {
          // Прибавить к общему Дебету счёта дельту от проводки
          accountForDebit.balanceAtTheBeginningOfThePeriod.debit.amount = accountForDebit.balanceAtTheBeginningOfThePeriod.debit.amount + additionalAmount;
          accountForDebit.balanceAtTheBeginningOfThePeriod.debit.count = accountForDebit.balanceAtTheBeginningOfThePeriod.debit.count + additionalCount;
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
          accountForDebit.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.debit = accountForDebit.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.debit.concat(tableAnalyticsPopulatedWithCommonAnalytics);
        }
        const creditAccName = tr.credit.name;
        let accountForCredit = accAccs.find(acc => acc.name=== creditAccName);
        if (!accountForCredit) {
          accountForCredit = {
            name: creditAccName,
            balanceAtTheBeginningOfThePeriod: {
              debit: {amount: 0, count: 0},
              credit: {amount: additionalAmount, count: additionalCount}
            },
            turnoverForThePeriod: {
              debit: {amount: 0, count: 0},
              credit: {amount: 0, count: 0},
            },
            balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData: {debit: [], credit: tableAnalyticsPopulatedWithCommonAnalytics},
            accountType: tr.credit.accountType,
            analyticsPossibleValues,
          };
          accountForCredit.analyticsPossibleValues = accountForCredit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForCredit);
        } else {
          // Прибавить к общему Кредиту счёта дельту от проводки
          accountForCredit.balanceAtTheBeginningOfThePeriod.credit.amount = accountForCredit.balanceAtTheBeginningOfThePeriod.credit.amount + additionalAmount;
          accountForCredit.balanceAtTheBeginningOfThePeriod.credit.count = accountForCredit.balanceAtTheBeginningOfThePeriod.credit.count + additionalCount;
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
          accountForCredit.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.credit = accountForCredit.balanceAtTheBeginningOfThePeriodForThePeriodAggregatedData.credit.concat(tableAnalyticsPopulatedWithCommonAnalytics);
        }
      });
      return accAccs;
    }, []);


    // Счета для которых посчитаны суммарный дебит и кредит, и сформирован массив-таблица с аналитиками
    // для оборотов за период
    let accountsForTurnover = operationsFilteredByPeriodForTurnover.reduce((accAccs, op) => {
      op.transactions.forEach(tr => {
        const additionalAmount = tr.tableAnalytics.reduce((accT, row) => {
          if (row.amount) {
            return accT + Number(row.amount)
          }
          return accT
        }, 0);
        const additionalCount = tr.tableAnalytics.reduce((accT, row) => {
          if (row.count) {
            return accT + Number(row.count)
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
              debit: {amount: 0, count: 0},
              credit: {amount: 0, count: 0}
            },
            turnoverForThePeriod: {
              debit: {amount: additionalAmount, count: additionalCount},
              credit: {amount: 0, count: 0}
            },
            turnoverForThePeriodAggregatedData: {debit: tableAnalyticsPopulatedWithCommonAnalytics, credit: []},
            accountType: tr.debit.accountType,
            analyticsPossibleValues,
          };
          accountForDebit.analyticsPossibleValues = accountForDebit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForDebit);
        } else {
          // Прибавить к общему Дебету счёта дельту от проводки
          accountForDebit.turnoverForThePeriod.debit.amount = accountForDebit.turnoverForThePeriod.debit.amount + additionalAmount;
          accountForDebit.turnoverForThePeriod.debit.count = accountForDebit.turnoverForThePeriod.debit.count + additionalCount;
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
              debit: {amount: 0, count: 0},
              credit: {amount: 0, count: 0}
            },
            turnoverForThePeriod: {
              debit: {amount: 0, count: 0},
              credit: {amount: additionalAmount, count: additionalCount},
            },
            turnoverForThePeriodAggregatedData: {debit: [], credit: tableAnalyticsPopulatedWithCommonAnalytics},
            accountType: tr.credit.accountType,
            analyticsPossibleValues,
          };
          accountForCredit.analyticsPossibleValues = accountForCredit.analyticsPossibleValues.concat(analyticsFromTablePossibleValues);
          accAccs.push(accountForCredit);
        } else {
          // Прибавить к общему Кредиту счёта дельту от проводки
          accountForCredit.turnoverForThePeriod.credit.amount = accountForCredit.turnoverForThePeriod.credit.amount + additionalAmount;
          accountForCredit.turnoverForThePeriod.credit.count = accountForCredit.turnoverForThePeriod.credit.count + additionalCount;
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

    let accounts;
    // добавление к началу периода информации об оборотах за период если есть
    accounts = accountsForBalanceAtTheBeginningOfThePeriod.map(accAtBeginning => {
      let accTurnoverfinded = accountsForTurnover.find(accTurnover => accTurnover.name === accAtBeginning.name);
      if (accTurnoverfinded) {
        accAtBeginning.turnoverForThePeriod = accTurnoverfinded.turnoverForThePeriod;
        accAtBeginning.turnoverForThePeriodAggregatedData = accTurnoverfinded.turnoverForThePeriodAggregatedData;
        // слияние analyticsPossibleValues
        // сначала недостающие виды аналитик
        const analyticTypeNamesArray = accTurnoverfinded.analyticsPossibleValues.map(anObj => {
          return Object.keys(anObj)[0]
        });
        const analyticTypeNamesArrayUniq = analyticTypeNamesArray.filter(anName => {
          const isUniq = accAtBeginning.analyticsPossibleValues.every(anObjBeginning => {
            return !Array.isArray(anObjBeginning[anName])
          })
          if (isUniq) {
            return true
          }
        });
        // фильтрация уникальных под слияние
        const accTurnoverfindedForMerging = accTurnoverfinded.analyticsPossibleValues.filter(anObj => {
          return analyticTypeNamesArrayUniq.some(anName => Array.isArray(anObj[anName]))
        });
        // слияние уникальных типов аналитик
        accAtBeginning.analyticsPossibleValues = accAtBeginning.analyticsPossibleValues.concat(accTurnoverfindedForMerging);


        // слияние недостающих значений аналитик
        accAtBeginning.analyticsPossibleValues.forEach(anObjBeginning => {
          const anName = Object.keys(anObjBeginning)[0];
          const anObjTurnoverFinded = accTurnoverfinded.analyticsPossibleValues.find(anObjTurnover => {
            return Array.isArray(anObjTurnover[anName])
          });
          const anArrTurnoverFindedFiltered = anObjTurnoverFinded[anName].filter(valueTurnoverFinded => {
            return anObjBeginning[anName].every(anObjArrValueBeginnig => {
              if (typeof anObjArrValueBeginnig === 'string') {
                return valueTurnoverFinded !== anObjArrValueBeginnig
              } else {
                return valueTurnoverFinded.name !== anObjArrValueBeginnig.name
              }
            })
          });
          anObjBeginning[anName] = anObjBeginning[anName].concat(anArrTurnoverFindedFiltered)
        })
      }
      return accAtBeginning;
    });

    // отфильтровать аккаунты оборотов о которых нет информации к началу пирода
    let accountsForTurnoverFiltered = accountsForTurnover.filter(accTurnover => {
      const idx = accountsForBalanceAtTheBeginningOfThePeriod.findIndex(accAtBeginning => accAtBeginning.name === accTurnover.name);
      if (idx === -1) {
        return true
      } else {
        return false
      }
    });
    // слияние массивов
    accounts = accounts.concat(accountsForTurnoverFiltered);

    // accountsWithCalculatedBalance - сальдо на конец периода
    accounts.forEach(acc => {
      acc.balanceAtTheEndOfThePeriod = {debit: {amount: 0, count: 0}, credit: {amount: 0, count: 0}};

      const debitAmountAtStart = acc.balanceAtTheBeginningOfThePeriod.debit.amount;
      const creditAmountAtStart = acc.balanceAtTheBeginningOfThePeriod.credit.amount;
      const diffAmount = (acc.turnoverForThePeriod.debit.amount || 0) - (acc.turnoverForThePeriod.credit.amount || 0);

      const debitCountAtStart = acc.balanceAtTheBeginningOfThePeriod.debit.count;
      const creditCountAtStart = acc.balanceAtTheBeginningOfThePeriod.credit.count;
      const diffCount = (acc.turnoverForThePeriod.debit.count || 0) - (acc.turnoverForThePeriod.credit.count || 0);

      if (acc.accountType === 'Активный') {
        acc.balanceAtTheEndOfThePeriod.debit.amount = debitAmountAtStart + diffAmount;
        acc.balanceAtTheEndOfThePeriod.debit.count = debitCountAtStart + diffCount;
      }
      if (acc.accountType === 'Пассивный') {
        acc.balanceAtTheEndOfThePeriod.credit.amount = creditAmountAtStart - diffAmount;
        acc.balanceAtTheEndOfThePeriod.credit.count = creditCountAtStart - diffCount;
      }
      if (acc.accountType === 'Активно-Пассивный') {
        if (debitAmountAtStart > 0) {
          const balanceAmount = debitAmountAtStart + diffAmount;
          const balanceCount = debitCountAtStart + diffCount;
          if (balanceAmount > 0) {
            acc.balanceAtTheEndOfThePeriod.debit.amount = balanceAmount;
            acc.balanceAtTheEndOfThePeriod.debit.count = balanceCount;
          }
          if (balanceAmount < 0) {
            acc.balanceAtTheEndOfThePeriod.credit.amount = Math.abs(balanceAmount);
            acc.balanceAtTheEndOfThePeriod.credit.count = Math.abs(balanceCount)
          }
        } else if (creditAmountAtStart > 0) {
          const balanceAmount = creditAmountAtStart - diffAmount;
          const balanceCount = creditCountAtStart - diffCount;
          if (balanceAmount > 0) {
            acc.balanceAtTheEndOfThePeriod.credit.amount = balanceAmount;
            acc.balanceAtTheEndOfThePeriod.credit.count = balanceCount
          }
          if (balanceAmount < 0) {
            acc.balanceAtTheEndOfThePeriod.debit.amount = Math.abs(balanceAmount);
            acc.balanceAtTheEndOfThePeriod.debit.count = Math.abs(balanceCount);
          }
        } else {
          if (diffAmount > 0) {
            acc.balanceAtTheEndOfThePeriod.debit.amount = diffAmount;
            acc.balanceAtTheEndOfThePeriod.debit.count = diffCount;
          }
          if (diffAmount < 0) {
            acc.balanceAtTheEndOfThePeriod.credit.amount = Math.abs(diffAmount);
            acc.balanceAtTheEndOfThePeriod.credit.count = Math.abs(diffCount);
          }
        }
      }
    })
    this.setState({ operations: operationsFilteredByPeriodForTurnover, accounts });
  }
}

