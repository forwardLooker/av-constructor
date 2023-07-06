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
    fieldDescriptors: {},
    objectDocument: {},
    _newData: {},
  };

  constructor() {
    super();
    this.fieldDescriptors = [];
    this._newData = {};
  }

  render() {
    return html`
      <div>
        ${this.repeat(this.fieldDescriptors,  f => f.name, f => html`
            <div>
              <label>${f.name}</label>
              <input
                value="${this._newData[f.name]}"
                @input="${(e) => {this._newData[f.name] = e.target.value} }"
              >
            </div>
        `)}
        <div>
          <button @click="${this.saveAndClose}">OK</button>
          <button @click="${this.close}">Закрыть</button>
        </div>
      </div>
    `
  }

  close() {
    this.fire('close');
  }
  saveAndClose() {
    this.objectDocument.saveData(this._newData);
    this.fire('saved');
    this.fire('close');
  }

  willUpdate(changedProps) {
    if (changedProps.has('objectDocument') && this.objectDocument !== null) {
      this._newData = this.objectDocument.data
    }
  }

  async firstUpdated() {

  }
}

window.customElements.define('av-object-document', AVObjectDocument);
