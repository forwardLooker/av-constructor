import {html, css, AVItem} from './0-av-item.js';

import {Host} from '../M/1-Host.js';

export class AVObjectDocument extends AVItem {
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
    object: {},
  };

  constructor() {
    super();
  }

  render() {
    const fields = Object.keys(this.object || {});
    return html`
      <div>
          ${this.repeat(fields,  f => f, f => html`
              <div>
                  <label>${f}</label>
                  <input value="${this.object[f]}">
              </div>
          `)}
          <div>
              <button>OK</button>
              <button @click="${this.close}">Закрыть</button>
          </div>
      </div>
    `
  }

  close() {
    this.fire('close');
  }

  async firstUpdated() {

  }
}

window.customElements.define('av-object-document', AVObjectDocument);
