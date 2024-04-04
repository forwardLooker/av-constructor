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
      &:hover {
        outline: 2px solid black;
      }
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
    isTypedColumns: false,
    isCellEditable: false,
    onDataInItemsChangedFunc: this.noop,
    onCellInputFunc: this.noop,
    onRowClickFunc: this.noop,
    onRowContextMenuFunc: this.noop,
    $objectDocument: null
  }

  headerDomElements = {};

  render() {
    return (
      <div className="flex-1 row">
        {this.props.columns.map(c => (
          <div className="grid-column col flex-1" key={c.name + Object.keys(this.headerDomElements).toString()}>
            <AVGrid.styles.gridHeaderCell
              className="pad-8 text-center"
              ref={headerDomElement => this.headerDomElements[c.name] = headerDomElement}
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
              ref={headerDomElement => {
                if (!this.headerDomElements.nestingLevel2) {
                  this.headerDomElements.nestingLevel2 = {}
                }
                if (!this.headerDomElements.nestingLevel2[c.name]) {
                  this.headerDomElements.nestingLevel2[c.name] = {}
                }
                this.headerDomElements.nestingLevel2[c.name][innerCol.name] = headerDomElement
              }}
            >{innerCol.label || innerCol.name}</AVGrid.styles.gridHeaderCell>
            {this._renderCells(c, innerColIndex)}
          </div>
        ))}
      </div>
    )
  }

  _renderCells(col, innerColIndex) {
    let c = col;
    // if (innerColIndex) {
    //   c = col.items[innerColIndex];
    // }
    return this.props.items.map((i, idx) => (
      <AVGrid.styles.gridCell className="pad-8" key={i.id || idx} row-item-id={i.id} column-name={c.name}
                              onClick={(e) => this._onCellClick(i, c.name, e)}
                              onContextMenu={e => this._onCellContextMenu(i, c.name, e)}
      >{this._renderCellContent(i, c, innerColIndex)}</AVGrid.styles.gridCell>
    ))
  }

  _renderCellContent(item, column, innerColIndex) {
    let fieldValue = item[column.name];
    if (typeof innerColIndex === 'number' && item[column.name]) {
      fieldValue = item[column.name][column.items[innerColIndex].name];
    }
    if (this.props.isTypedColumns && this.props.isCellEditable) {
      return (
        <AVField
         value={fieldValue}
         fieldItem={column}
         isLabelHidden
         onChangeFunc={value => { // TODO редактирование в гриде с вложенными колонками
          item[column.name] = value;
          this.props.onDataInItemsChangedFunc(this.props.items, item, column);
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
    return value;
  }

  componentDidMount() {
    this._realignHeaderCells();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.columns !== this.props.columns) {
      // prevProps.columns.forEach(c => {
      //   if (this.props.columns.findIndex(newC => newC.name === c.name) === -1) {
      //     delete this.headerDomElements[c.name];
      //   }
      // });
      // this._realignHeaderCells();
      // TODO верхнее оптимальней по рендеру, но заебешься отчищать nestingLevel2
      this.headerDomElements = {};
      this.forceUpdate(this._realignHeaderCells);
    }
  }

  _realignHeaderCells = () => {
    const maxHeightObjLevel2 = this._realignHeaderCellsNestingLevel2();
    const maxHeightObjLevel1WhichHaveLevel2 = this._realignHeaderCellsNestingLevel1WhichHaveLevel2();
    this._realignHeaderCellsNestingLevel1({maxHeightObjLevel1WhichHaveLevel2, maxHeightObjLevel2});
  }

  _realignHeaderCellsNestingLevel2 = () => {
    const nestingLevel2 = this.headerDomElements.nestingLevel2;
    if (nestingLevel2) {
      const colNamesWhichHaveNestedArr = Object.keys(nestingLevel2);
      const colHeightsWhichHaveNestedArr = colNamesWhichHaveNestedArr.map(colName => {
        const nestingLevel2ColNamesArr = Object.keys(nestingLevel2[colName]);
        return {
          colName,
          nestedColHeights: nestingLevel2ColNamesArr.map(nestedColName => {
            const colDomElement = nestingLevel2[colName][nestedColName];
            const colHeight = colDomElement.getBoundingClientRect().height;
            return {nestedColName, colHeight}
          })}
      });
      const isColHeightsOfNestedIsEqual = colHeightsWhichHaveNestedArr.every(
        (i, idx, arr) => i.nestedColHeights.every(o => o.colHeight === arr[0].nestedColHeights[0].colHeight)
      )
      const maxHeightObj = colHeightsWhichHaveNestedArr.reduce((acc, i) => {
        let maxColHeightNestedItem = acc;
        i.nestedColHeights.forEach(nestedItem => {
          if (nestedItem.colHeight > maxColHeightNestedItem.colHeight) {
            maxColHeightNestedItem = nestedItem;
          }
        });
        return maxColHeightNestedItem;
      }, {colHeight: 0});

      if (!isColHeightsOfNestedIsEqual) {
        colHeightsWhichHaveNestedArr.forEach(i => {
          i.nestedColHeights.forEach(o => {
            this.headerDomElements.nestingLevel2[i.colName][o.nestedColName].style = `height: ${maxHeightObj.colHeight}px`
          })
        });
      };
      return maxHeightObj;
    };
    return null;
  }

  _realignHeaderCellsNestingLevel1WhichHaveLevel2 = () => {
    const colNamesWithNestedArr = Object.keys(this.headerDomElements);
    const colNamesArr = colNamesWithNestedArr.filter(colName => {
      const colItem = this.props.columns.find(c => c.name === colName);
      if (
        colName !== 'nestingLevel2' &&
        this.notEmpty(colItem.items) &&
        colItem.dataType !== 'array'
      ) {
        return true;
      }
    });
    if (this.isEmpty(colNamesArr)) {
      return null;
    }
    const colHeightsArr = colNamesArr.map(colName => {
      const colDomElement = this.headerDomElements[colName];
      const colHeight = colDomElement.getBoundingClientRect().height;
      return {colName, colHeight}
    });
    const isColHeightsIsEqual = colHeightsArr.every((i, idx, arr) => i.colHeight === arr[0].colHeight);
    const maxHeightObj = colHeightsArr.reduce((acc, i) => {
      if (i.colHeight > acc.colHeight) {
        return i;
      } else {
        return acc;
      };
    }, {colHeight: 0});
    if (!isColHeightsIsEqual) {
      colHeightsArr.forEach(col => {
        if (col.colName === maxHeightObj.colName) return;
        this.headerDomElements[col.colName].style = `height: ${maxHeightObj.colHeight}px`
      });
    };
    return maxHeightObj;
  }

  _realignHeaderCellsNestingLevel1 = ({maxHeightObjLevel1WhichHaveLevel2, maxHeightObjLevel2}) => {
    const colNamesWithNestedArr = Object.keys(this.headerDomElements);
    const colNamesArr = colNamesWithNestedArr.filter(colName => {
      if (colName !== 'nestingLevel2' && this.isEmpty(this.props.columns.find(c => c.name === colName).items)) {
        return true;
      }
    });
    const colHeightsArr = colNamesArr.map(colName => {
      const colDomElement = this.headerDomElements[colName];
      const colHeight = colDomElement.getBoundingClientRect().height;
      return {colName, colHeight}
    });
    const isColHeightsIsEqual = colHeightsArr.every((i, idx, arr) => i.colHeight === arr[0].colHeight);
    const maxHeightObj = colHeightsArr.reduce((acc, i) => {
      if (i.colHeight > acc.colHeight) {
        return i;
      } else {
        return acc;
      };
    }, {colHeight: 0});
    if (!maxHeightObjLevel1WhichHaveLevel2) {
      if (!isColHeightsIsEqual) {
        colHeightsArr.forEach(col => {
          if (col.colName === maxHeightObj.colName) return;
          this.headerDomElements[col.colName].style = `height: ${maxHeightObj.colHeight}px`
        });
      }
    } else {
      const colHeightLevel1PlusLevel2 = maxHeightObjLevel1WhichHaveLevel2.colHeight + maxHeightObjLevel2.colHeight;
      if (maxHeightObj.colHeight < colHeightLevel1PlusLevel2) {
        colHeightsArr.forEach(col => {
          this.headerDomElements[col.colName].style = `height: ${colHeightLevel1PlusLevel2}px`
        });
      } else if (maxHeightObj.colHeight > colHeightLevel1PlusLevel2) {
        colHeightsArr.forEach(col => {
          if (col.colName === maxHeightObj.colName) return;
          this.headerDomElements[col.colName].style = `height: ${maxHeightObj.colHeight}px`
        });
        // Растянуть первый ряд где есть вложенные
        const colNamesArrWithLevel2 = colNamesWithNestedArr.filter(colName => {
          if (colName !== 'nestingLevel2' && this.notEmpty(this.props.columns.find(c => c.name === colName).items)) {
            return true;
          }
        });
        const colHeightsObjsArrWithLevel2 = colNamesArrWithLevel2.map(colName => {
          return {colName}
        });
        colHeightsObjsArrWithLevel2.forEach(col => {
          this.headerDomElements[col.colName].style = `height: ${maxHeightObj.colHeight - maxHeightObjLevel2.colHeight}px`
        });
      }
    };
  }

  _onCellClick(rowItem, cellName, e) {
    this.props.onRowClickFunc(rowItem);
  }

  _onCellContextMenu = (rowItem, cellName, e) =>  {
    this.props.onRowContextMenuFunc(rowItem, cellName, e)
  }

}
