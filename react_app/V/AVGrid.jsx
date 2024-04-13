import React from 'react';

import {AVElement} from './0-AVElement.js';
import {AVField} from "../VM/5-AVField.jsx";

export class AVGrid extends AVElement {
  static styles = {
    gridHeaderCell: this.styled.div`
      .grid-column:first-of-type & {
        border: 1px solid black;
      }
      .grid-column:not(:first-of-type) & {
        border-right: 1px solid black;
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }
    `,
    gridCell: this.styled.div`
      min-height: 2.2em;
      background-color: ${props => props.$rowItem._rowHover || props.$rowItem.selected ? '#8080802b' : 'inherit'};
      //&:hover {
      //  outline: 2px solid black;
      //}

      .grid-column:first-of-type & {
        border-right: 1px solid black;
        border-left: 1px solid black;
        border-bottom: 1px solid black;
      }

      .grid-column:not(:first-of-type) & {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
      }
    `
  }

  static defaultProps = {
    items: [],
    columns: [],
    isRowSelectable: false,
    isTypedColumns: false,
    isCellEditable: false,
    onDataInItemsChangedFunc: this.noop,
    onCellInputFunc: this.noop,
    onRowClickFunc: this.noop,
    onRowContextMenuFunc: this.noop,
    $objectDocument: null
  }

  state = {
    _items: this.deepCloneArrayWithInnerRef(this.props.items),
    _columns: this.deepCloneArrayWithInnerRef(this.props.columns)
  }

  render() {
    return (
      <div className="flex-1 row">
        {this.state._columns.map(c => (
          <div className="grid-column col flex-1" key={c.name + this.state._columns.map(cl => cl.name).toString()}>
            <AVGrid.styles.gridHeaderCell
              className="pad-8 text-center"
              style={c.style}
              ref={headerDomElement => c.headerCellDomElement = headerDomElement}
            >{c.label || c.name}</AVGrid.styles.gridHeaderCell>
            {(this.notEmpty(c.items) && c.dataType !== 'array') && this._renderSubHeaderWithCells(c)}
            {(this.isEmpty(c.items) || c.dataType === 'array') && this._renderCells(c)}
          </div>
        ))}
      </div>
    )
  }

  _renderSubHeaderWithCells(c) {
    return (
      <div className="row">
        {c.items.map((innerCol, innerColIndex) => (
          <div key={innerCol.name} className="flex-1">
            <AVGrid.styles.gridHeaderCell
              className="pad-8 text-center"
              style={innerCol.style}
              ref={headerDomElement => innerCol.headerCellDomElement = headerDomElement}
            >{innerCol.label || innerCol.name}</AVGrid.styles.gridHeaderCell>
            {this._renderCells(c, innerCol)}
          </div>
        ))}
      </div>
    )
  }

  CellComponent = class CellComponent extends AVElement {
    static defaultProps = {
      $grid: null,
      rowItem: null,
      column: null,
      innerColumn: null
    }
    render() {
      return (
          <AVGrid.styles.gridCell className="pad-8"
                                  style={this.props.style}
                                  ref={this.props.refOnRootDiv}
                                  $rowItem={this.props.rowItem}
                                  onClick={e => {
                                    if (this.props.$grid.props.isRowSelectable) {
                                      const previousSelected = this.props.$grid.state._items.filter(i => i.selected);
                                      previousSelected.forEach(rowItem => {
                                        rowItem.selected = false;
                                        this.forceUpdateRowCellsInItem(rowItem);
                                      })

                                      this.props.rowItem.selected = true;
                                      this.forceUpdateRowCellsInItem(this.props.rowItem);
                                    }
                                    this.props.onClick(e);
                                  }}
                                  onContextMenu={this.props.onContextMenu}
                                  onMouseEnter={e => {
                                    this.props.rowItem._rowHover = true;
                                    this.forceUpdateRowCellsInItem(this.props.rowItem);
                                  }}
                                  onMouseLeave={e => {
                                    this.props.rowItem._rowHover = false;
                                    this.forceUpdateRowCellsInItem(this.props.rowItem);
                                  }}
          >{this.props.children}</AVGrid.styles.gridCell>
      )
    }

    forceUpdateRowCellsInItem = (rowItem) => {
      let itemCells = this.createArrFromObjFieldNamesContains('_cellVirtualDomComponent', rowItem);
      const colsWithInner = this.props.$grid.props.columns.filter(c => this.notEmpty(c.items) && c.dataType !== 'array');
      colsWithInner.forEach(c => {
        const innerCells = this.createArrFromObjFieldNamesContains('_cellVirtualDomComponent', rowItem[c.name]);
        itemCells = itemCells.concat(innerCells);
      })
      itemCells.forEach(CellComponent => CellComponent.forceUpdate())
    }
  }

  _renderCells(c, innerCol) {
    // let c = col;
    // if (innerColIndex) {
    //   c = col.items[innerColIndex];
    // }
    return this.state._items.map((i, idx) => (
      <this.CellComponent className="pad-8" key={i.id || idx}
                          $grid={this}
                          rowItem={i}
                          column={c}
                          innerColumn={innerCol}
                          onClick={(e) => this._onCellClick(i, c.name, e)}
                          onContextMenu={e => this._onCellContextMenu(i, c.name, e)}
                          style={innerCol ? (i[c.name] && i[c.name][innerCol.name + '_cellDomElement' + '_style']) : i[c.name + '_cellDomElement' + '_style']}
                          ref={cellVirtualDomComponent => {
                            if (innerCol) {
                              if (!i[c.name]) {
                                i[c.name] = {}
                              }
                              i[c.name][innerCol.name + '_cellVirtualDomComponent'] = cellVirtualDomComponent;
                            } else {
                              i[c.name + '_cellVirtualDomComponent'] = cellVirtualDomComponent;
                            }
                          }}
                          refOnRootDiv={cellDomElement => {
                            if (innerCol) {
                              if (!i[c.name]) {
                                i[c.name] = {}
                              }
                              i[c.name][innerCol.name + '_cellDomElement'] = cellDomElement;
                            } else {
                              i[c.name + '_cellDomElement'] = cellDomElement;
                            }
                          }}
      >{this._renderCellContent(i, c, innerCol)}</this.CellComponent>
    ))
  }

  _renderCellContent(item, column, innerCol) {
    let fieldValue = item[column.name];
    if (innerCol && item[column.name]) {
      fieldValue = item[column.name][innerCol.name];
    }
    if (this.props.isTypedColumns && this.props.isCellEditable) {
      return (
        <AVField
         value={fieldValue}
         fieldItem={column}
         isLabelHidden
         onChangeFunc={value => { // TODO редактирование в гриде с вложенными колонками
          item[column.name] = value;
          item._originalItemRef[column.name] = value
          this.props.onDataInItemsChangedFunc(this.props.items, item._originalItemRef, column._originalItemRef);
         }}
         $objectDocument={this.props.$objectDocument}
        ></AVField>
      )
    }
    const value = fieldValue;
    if (Array.isArray(value)) {
      return 'Табличное';
    }
    if (typeof value === 'object') {
      if (item[column.name].name) {
        return `${item[column.name].name} (Объектное)`
      }
      return 'Объектное';
    }
    if (column.formatOutputInGrid) {
      return column.formatOutputInGrid(value)
    }
    if (innerCol && innerCol.formatOutputInGrid) {
      return innerCol.formatOutputInGrid(value)
    }
    return value;
  }

  componentDidMount() {
    this._realignGridHeaderCells();
    this._realignGridRows();
    this.forceUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.columns !== this.props.columns) {
      this.setState({_columns: this.deepCloneArrayWithInnerRef(this.props.columns)}, () => {
        this._realignGridHeaderCells();
        this._realignGridRows();
        this.forceUpdate();
      })
    }
    if (prevProps.items !== this.props.items) {
      this.setState({_items: this.deepCloneArrayWithInnerRef(this.props.items)}, () => {
        this._realignGridRows();
        this.forceUpdate();
      })
    }

  }

  _realignGridHeaderCells = () => { // двухэтажное выравнивание по высоте
    this.state._columns.forEach(colItem => {
      const headerCellMaxHeight = this.state._columns.reduce((acc, c) => {
        if (this.isEmpty(c.items) || c.dataType === 'array') {
          const headerCellElem = c.headerCellDomElement;
          const headerCellElemHeight = headerCellElem.getBoundingClientRect().height;
          if (headerCellElemHeight > acc) {
            return headerCellElemHeight
          } else {
            return acc
          };
        };
        if (this.notEmpty(c.items) && c.dataType !== 'array')  {
          const headerCellElemHeightLevel1 = c.headerCellDomElement.getBoundingClientRect().height;
          const headerCellElemHeightLevel2 = c.items.reduce((innerAcc, innerCell) => {
            const innerCellHeight = innerCell.headerCellDomElement.getBoundingClientRect().height;
            if (innerCellHeight > innerAcc) {
              return innerCellHeight
            } else {
              return innerAcc
            }
          }, 0);

          const headerCellElemHeightSummarized = headerCellElemHeightLevel1 + headerCellElemHeightLevel2;
          if (headerCellElemHeightSummarized > acc) {
            return headerCellElemHeightSummarized
          } else {
            return acc
          }
        }
      }, 0);

      if (this.isEmpty(colItem.items) || colItem.dataType === 'array') {
        if (headerCellMaxHeight > colItem.headerCellDomElement.getBoundingClientRect().height) {
          colItem.style = {minHeight: headerCellMaxHeight + 'px'}
        }
      }
      if (this.notEmpty(colItem.items) && colItem.dataType !== 'array') {
        const headerCellMaxHeightOfInnerCellsWithinAllCols = this.state._columns.filter(
          c => this.notEmpty(c.items) && c.dataType !== 'array'
        ).reduce((acc, c) => {
          const maxHeightInInner = c.items.reduce((innerAcc, i) => {
            const height = i.headerCellDomElement.getBoundingClientRect().height;
            if (height > innerAcc) {
              return height
            } else {
              return innerAcc
            }
          }, 0);
          if (maxHeightInInner > acc) {
            return maxHeightInInner
          } else {
            return acc
          }
        }, 0);

        colItem.items.forEach(innerColItem => {
          if (headerCellMaxHeightOfInnerCellsWithinAllCols > innerColItem.headerCellDomElement.getBoundingClientRect().height) {
            innerColItem.style = {minHeight: headerCellMaxHeightOfInnerCellsWithinAllCols + 'px'}
          }
        })

        if ((headerCellMaxHeight - headerCellMaxHeightOfInnerCellsWithinAllCols) > colItem.headerCellDomElement.getBoundingClientRect().height) {
          // за вычетом самого высокого элемента из всех вложенных элементов всех колонок с вложенными элементами
          colItem.style = {minHeight: (headerCellMaxHeight - headerCellMaxHeightOfInnerCellsWithinAllCols) + 'px'};
        }
      }
    })
  }
  // TODO исправить для вложенных
  _realignGridRows = () => {
    this.state._items.forEach(i => {
      const maxCellHeightOfItem = this.state._columns.reduce((acc, c) => {
        if (this.notEmpty(c.items) && c.dataType !== 'array') {
          const maxHeightOfInnerCells = c.items.reduce((innerAcc, innerCol) => {
            const cellElem = i[c.name][innerCol.name + '_cellDomElement'];
            const cellElemHeight = cellElem.getBoundingClientRect().height;
            if (cellElemHeight > innerAcc) {
              return cellElemHeight
            }
            return innerAcc;
          }, 0);
          if (maxHeightOfInnerCells > acc) {
            return maxHeightOfInnerCells
          } else {
            return acc
          }
        } else {
          const cellElem = i[c.name + '_cellDomElement'];
          const cellElemHeight = cellElem.getBoundingClientRect().height;

          if (cellElemHeight > acc) {
            return cellElemHeight
          }
          return acc;
        }
      }, 0);
      this.state._columns.forEach(c => {
        if (this.notEmpty(c.items) && c.dataType !== 'array') {
          c.items.forEach(innerCol => {
            i[c.name][innerCol.name + '_cellDomElement' + '_style'] = {minHeight: maxCellHeightOfItem + 'px'};
          })
        } else {
          i[c.name + '_cellDomElement' + '_style'] = {minHeight: maxCellHeightOfItem + 'px'};
        }
      });
    });
    // this.forceUpdate();
  }

  _onCellClick(rowItem, cellName, e) {
    this.props.onRowClickFunc(rowItem._originalItemRef);
  }

  _onCellContextMenu = (rowItem, cellName, e) =>  {
    this.props.onRowContextMenuFunc(rowItem._originalItemRef, cellName, e)
  }

}
