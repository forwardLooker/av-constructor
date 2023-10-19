import React from 'react';

import {AVElement, css, html} from './0-av-element.js';

export class AVGrid extends AVElement {
  styles = {
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
            <this.styles.gridHeaderCell className="pad-8">{c.name}</this.styles.gridHeaderCell>
            {this.props.items.map((i, idx) => (
              <this.styles.gridCell className="pad-8" key={i.id || idx} row-item-id={i.id} column-name={c.name}
                onClick={(e) => this._onCellClick(i, c.name, e)}
              >{this._renderCellContent(i, c)}</this.styles.gridCell>
              ))}
          </div>
        ))}
      </div>
    )
  }

  _renderCellContent(item, column) {
    if (this.props.isTypedColumns && this.props.isCellEditable) {
      return (
        <div>av-field</div>
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

export class AVGrid2 extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .grid-column:first-of-type .grid-header-cell {
        border: 1px solid black;
      }
      .grid-column:not(:first-of-type) .grid-header-cell {
        border-right: 1px solid black;
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-header-cell {
        text-align: center;
      }
      .grid-column:first-of-type .grid-cell {
        border-right: 1px solid black;
        border-left: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-column:not(:first-of-type) .grid-cell {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-cell:hover {
        outline: 2px solid black;
      }
      .grid-cell {
        min-height: 2.2em;
      }
    `;
  }

  static properties = {
    items: {},
    columns: {},
    isTypedColumns: {type: Boolean},
    isCellEditable: {type: Boolean},
    onDataInItemsChanged: {},
    onCellInputFunc: {},
    onRowClickFunc: {}
  };

  constructor() {
    super();
    this.onRowClickFunc = this.noop;
  }

  willUpdate(changedProps) {
    if (changedProps.has('items') && !this.items) {
      this.items = []
    }
    if (changedProps.has('columns') && !this.columns) {
      this.columns = []
    }
  }

  render() {
    return html`
      <div class="grid-container row">
          ${this.repeat(this.columns, c => c.name, c => html`
              <div class="grid-column col flex-1">
                  <div class="grid-header-cell pad-8 text-center">${c.name}</div>
                  ${this.repeat(this.items, i => i.id, i => html`
                      <div row-item-id="${i.id}" column-name="${c.name}" class="grid-cell pad-8"
                           @click="${(e) => this._onCellClick(i, c.name, e)}"
                      >${this._renderCellContent(i, c)}</div>
                  ` )}
              </div>
          `)}
      </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _renderCellContent(item, column) {
    if (this.isTypedColumns && this.isCellEditable) {
      return html`
        <av-field
          .value="${item[column.name]}"
          .fieldItem="${column}"
          isLabelHidden
          .onInputFunc="${value => {
            item[column.name] = value;
            this.onDataInItemsChanged(this.items, item, column);
          }}"
        ></av-field>
      `
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
    this.onRowClickFunc(rowItem);
  }
}
window.customElements.define('av-grid', AVGrid);
