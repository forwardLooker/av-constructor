import {AVElement, css, html} from './0-av-element.js';

export class AVGrid extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      #header {
        padding: 0 1.5em;
        box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
      }
      .grid-column:first-of-type .grid-header-cell {
        border: 1px solid black;
      }
      .grid-column:first-of-type .grid-cell {
        border-right: 1px solid black;
        border-left: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-column:not(:first-of-type) .grid-header-cell {
        border-right: 1px solid black;
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-column:not(:first-of-type) .grid-cell {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
      }
      .grid-cell:hover {
        outline: 2px solid black;
      }
      .grid-header-cell {
        text-align: center;
      }
    `;
  }

  static properties = {
    items: {},
    columns: {}
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="grid-container row">
          ${this.repeat(this.columns, c => c.name, c => html`
              <div class="grid-column col flex-1">
                  <div class="grid-header-cell pad-8">${c.name}</div>
                  ${this.repeat(this.items, i => i.id, i => html`
                      <div row-item-id="${i.id}" column-name="${c.name}" class="grid-cell pad-8"
                           @click="${(e) => this.onCellClick(i, c.name, e)}"
                      >${i[c.name]}</div>
                  ` )}
              </div>
          `)}
      </div>
    `
  }

  onCellClick(rowItem, cellName, e) {
    this.fire(`cell-click`, {cellName, cellData: rowItem[cellName], rowData: rowItem, originalEvent: e});
    this.fire('row-click', {rowData: rowItem, originalEvent: e})
  }

  async firstUpdated() {

  }
}
window.customElements.define('av-grid', AVGrid);
