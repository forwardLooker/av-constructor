import React from 'react';

import {AVElement} from './0-AVElement.js';
import {AVField} from "../VM/5-AVField.jsx";
import {AVIcon} from './icons/AVIcon.jsx';

export class AVGrid extends AVElement {
  static styles = {
    gridHeaderCell: this.styled.div`
      background-color: #686767;
      color: white;
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
    $objectDocument: null,

    isColumnsReorderable: false,
    onColumnsReorderFunc: this.noop,

    isUnderRowPanelRendered: false,
    underRowPanelIndex: null,
    underRowPanelRenderFunc: this.noop,
    underRowPanelContainerHeight: 0
  }

  state = {
    _items: this.deepCloneArrayWithInnerRef(this.props.items),
    _columns: this.deepCloneArrayWithInnerRef(this.props.columns.filter(c => !c.isHiddenInGrid)),
    sortingType: 'ascend',

    designDragStarted: false,
    designDragElementIndex: null,
    designDragElement: null,
    designDropSide: 'none', // enum: ['top', 'bottom', 'left', 'right', 'none']
  }

  $underRowPanelContainer;

  render() {
    return (
      <div className="_av-grid-root flex-1 row bg-white">
        {this.state._columns.map((c, colIdx) => (
          <div className={`grid-column col ${c.widthMode ? c.widthMode : 'flex-1'}`} key={c.name + this.state._columns.map(cl => cl.name).toString()}>
            <AVGrid.styles.gridHeaderCell
              className="row space-around pad-8"
              style={c.style}
              ref={headerDomElement => c.headerCellDomElement = headerDomElement}
              draggable={this.props.isColumnsReorderable}
              onDragStart={() => {
                this.setState({
                  designDragStarted: true,
                  designDragElement: this.props.columns.filter(c => !c.isHiddenInGrid)[colIdx],
                  designDragElementIndex: colIdx,
                })
              }}
              onDragOver={
                (e) => {
                  e.preventDefault();
                  const fieldOverlay = this._findFieldOverlay(e);
                  const elemRect = fieldOverlay.getBoundingClientRect();

                    if (elemRect.left + elemRect.width/10 > e.pageX) {
                      fieldOverlay.classList.add('border-left-4');
                      this.setState({designDropSide: 'left'});
                    } else {
                      fieldOverlay.classList.remove('border-left-4');

                      if (elemRect.right - elemRect.width/10 <= e.pageX) {
                        fieldOverlay.classList.add('border-right-4');
                        this.setState({designDropSide: 'right'});
                      } else {
                        fieldOverlay.classList.remove('border-right-4');
                      }
                    }
                  }
                }
                onDragLeave={
                  (e) => {
                    this._removeDragBorder(e);
                  }
                }
                onDrop={
                  (e) => {
                    if (this.state.designDragElement === c) {
                      this._removeDragBorder(e);
                      this.setState({designDragStarted: false});
                      return;
                    }
                    let insertIndex = colIdx;
                    let cutIndex = this.state.designDragElementIndex;

                  if (this.state.designDropSide === 'right') {
                    insertIndex = insertIndex + 1
                  }
                  let columns = this.deepClone(this.props.columns.filter(c => !c.isHiddenInGrid));
                  columns.splice(insertIndex, 0, this.state.designDragElement);
                  if (colIdx < this.state.designDragElementIndex) {
                    cutIndex = cutIndex + 1;
                  }
                  columns.splice(cutIndex, 1);
                  this.props.onColumnsReorderFunc(columns.concat(this.deepClone(this.props.columns.filter(c => c.isHiddenInGrid))));
                  this._removeDragBorder(e);
                  this.setState({
                    designDragStarted: false,
                    designDragElement: null,
                    designDragElementIndex: null,
                  });
                }
              }
              onDragEnd={e => this.setState({designDragStarted: false})}
            >{this._renderHeaderCellContent(c)}</AVGrid.styles.gridHeaderCell>
            {(this.notEmpty(c.items) && c.dataType !== 'array') && this._renderSubHeaderWithCells(c, colIdx)}
            {(this.isEmpty(c.items) || c.dataType === 'array') && this._renderCells(c, colIdx)}
          </div>
        ))}
      </div>
    )
  }

  _renderHeaderCellContent(column) {
    if (column.renderHeaderCellButton) {
      return column.renderHeaderCellButton()
    }
    let sortingIcon;
    return (
      <div className="row align-center justify-center"
           onMouseEnter={() => sortingIcon.removeAttribute('hidden')}
           onMouseLeave={() => sortingIcon.setAttribute('hidden', '')}
           onClick={() => {
             const sortAscend = this.R.sortWith([this.R.ascend(this.R.prop(column.name))]);
             const sortDescend = this.R.sortWith([this.R.descend(this.R.prop(column.name))]);
             if (this.state.sortingType === 'ascend') {
               this.setState({ // дополнено своей сортировкой потому что рамда неправильно сортирует числа
                 _items: column.dataType === 'number' ? this.state._items.sort((a, b) => a[column.name] - b[column.name]) : sortAscend(this.state._items),
                 sortingType: 'descend'
               });
             } else {
               this.setState({ // дополнено своей сортировкой потому что рамда неправильно сортирует числа
                 _items: column.dataType === 'number' ? this.state._items.sort((a, b) => b[column.name] - a[column.name]) : sortDescend(this.state._items),
                 sortingType: 'ascend'
               });
             }
           }}
      >
        {column.label || column.name}
        <div hidden className="pad-0-2" ref={el => sortingIcon = el}><AVIcon name="arrowSquareDown"></AVIcon></div>
      </div>
    )
    // return column.label || column.name
  }

  _renderSubHeaderWithCells(c, colIdx) {
    return (
      <div className="row">
        {c.items.map((innerCol, innerColIndex) => (
          <div key={innerCol.name} className="flex-1">
            <AVGrid.styles.gridHeaderCell
              className="pad-8 text-center"
              style={innerCol.style}
              ref={headerDomElement => innerCol.headerCellDomElement = headerDomElement}
            >{innerCol.label || innerCol.name}</AVGrid.styles.gridHeaderCell>
            {this._renderCells(c, colIdx, innerCol)}
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
          <AVGrid.styles.gridCell className="row pad-8"
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

  _renderCells(c, colIdx, innerCol) {
    // let c = col;
    // if (innerColIndex) {
    //   c = col.items[innerColIndex];
    // }
    return this.state._items.map((i, idx) => (
      <div key={i.id || idx} style={{
        marginBottom: this.state.isUnderRowPanelRendered && this.state.underRowPanelIndex === idx ? (this.state.underRowPanelContainerHeight + 'px') : 0
      }}>
        <this.CellComponent
                            $grid={this}
                            rowItem={i}
                            column={c}
                            innerColumn={innerCol}
                            onClick={(e) => this._onCellClick(i, idx, c.name, e)}
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
        >{this._renderCellContent(i, c, innerCol, idx)}</this.CellComponent>
        {(this.state.isUnderRowPanelRendered && this.state.underRowPanelIndex ===  idx && colIdx === 0) && (
          <div
            ref={el => this.$underRowPanelContainer = el}
            className="pos-abs width-100prc border-bottom-1"
          >
            {this.state.underRowPanelRenderFunc()}
          </div>
        )}
      </div>
    ))
  }

  _renderCellContent(item, column, innerCol, rowIdx) {
    if (column.renderCellButton) {
      return column.renderCellButton(item._originalItemRef)
    }
    let fieldValue = item[column.name];
    if (innerCol && item[column.name]) {
      fieldValue = item[column.name][innerCol.name];
    }

    if (column.formatOutputInGrid) {
      return column.formatOutputInGrid(fieldValue)
    }
    if (innerCol && innerCol.formatOutputInGrid) {
      return innerCol.formatOutputInGrid(fieldValue)
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
         rowIdxInGrid={rowIdx}
        ></AVField>
      )
    }
    if (column.dataType === 'boolean') {
      return (
        <AVField
          value={fieldValue}
          fieldItem={column}
          readOnly
          isLabelHidden
        ></AVField>
      )
    }
    if (column.variant === 'date') {
      return new Date(fieldValue).toLocaleDateString();
    }
    if (Array.isArray(fieldValue)) {
      return 'Табличное';
    }
    if (typeof fieldValue === 'object') {
      if (item[column.name].name) {
        return `${item[column.name].name} (Объектное)`
      }
      return 'Объектное';
    }
    return fieldValue;
  }

  renderUnderRowPanel = (rowIndex, underRowPanelRenderFunc) => {
    this.setState({
      isUnderRowPanelRendered: true,
      underRowPanelIndex: rowIndex,
      underRowPanelRenderFunc
    }, () => {
      const underRowPanelContainerHeight = this.$underRowPanelContainer.getBoundingClientRect().height;
      this.setState({underRowPanelContainerHeight});
    })
  }
  
  closeUnderRowPanel = () => this.setState({ isUnderRowPanelRendered: false, underRowPanelContainerHeight: 0 })

  componentDidMount() {
    this._hideHiddenColumnsWithoutUpdate()
    this._realignGridHeaderCells();
    this._realignGridRows();
    this.forceUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.columns !== this.props.columns) {
      this.setState({_columns: this.deepCloneArrayWithInnerRef(this.props.columns)}, () => {
        this._hideHiddenColumnsWithoutUpdate()
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

  _hideHiddenColumnsWithoutUpdate = () => {
    this.state._columns = this.state._columns.filter(c => !c.isHiddenInGrid);
  }

  _removeDragBorder = (e) => {
    const fieldOverlay = this._findFieldOverlay(e);
    fieldOverlay.classList.remove('border-left-4');
    fieldOverlay.classList.remove('border-right-4');
  }

  _findFieldOverlay = (e) => {
    // return e.target;
    return e.target.closest(".grid-column");
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

  _onCellClick(rowItem, rowIndex, cellName, e) {
    this.props.onRowClickFunc(rowItem._originalItemRef, rowIndex);
  }

  _onCellContextMenu = (rowItem, cellName, e) =>  {
    this.props.onRowContextMenuFunc(rowItem._originalItemRef, cellName, e)
  }

}
