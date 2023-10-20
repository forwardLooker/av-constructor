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
    onRowClickFunc: this.noop
  }

  render() {
    return (
      <div className="flex-1 row">
        {this.props.columns.map(c => (
          <div className="grid-column col flex-1" key={c.name}>
            <AVGrid.styles.gridHeaderCell className="pad-8 text-center">{c.name}</AVGrid.styles.gridHeaderCell>
            {this.props.items.map((i, idx) => (
              <AVGrid.styles.gridCell className="pad-8" key={i.id || idx} row-item-id={i.id} column-name={c.name}
                onClick={(e) => this._onCellClick(i, c.name, e)}
              >{this._renderCellContent(i, c)}</AVGrid.styles.gridCell>
              ))}
          </div>
        ))}
      </div>
    )
  }

  _renderCellContent(item, column) {
    if (this.props.isTypedColumns && this.props.isCellEditable) {
      return (
        <AVField
         value={item[column.name]}
         fieldItem={column}
         isLabelHidden
         onChangeFunc={value => {
          item[column.name] = value;
          this.props.onDataInItemsChangedFunc(this.props.items, item, column);
         }}></AVField>
      )
    }
    const value = item[column.name];
    if (Array.isArray(value)) {
      return 'Табличное';
    }
    if (typeof value === 'object') {
      return 'Объектное';
    }
    return value;
  }

  _onCellClick(rowItem, cellName, e) {
    this.props.onRowClickFunc(rowItem);
  }

}
