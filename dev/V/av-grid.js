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
      <div class="row">
          ${this.repeat(this.columns, c => c.name, c => html`
              <div class="column flex-1">
                  <div class="grid-header-cell border">${c.name}</div>
                  ${this.repeat(this.items, i => i.id, i => html`
                      <div class="grid-cell border">${i[c.name]}</div>
                  ` )}
              </div>
          `)}
      </div>
    `
  }

  async firstUpdated() {

  }
}
window.customElements.define('av-grid', AVGrid);
