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
      
      .field {
      }
      .label {
        display: inline-block;
        padding: 0 4px;
      }

      .input {
        box-sizing: border-box;
        margin: 0;
        padding: 4px 11px;
        color: rgba(0, 0, 0, .88);
        font-size: 14px;
        line-height: 1.5714285714285714;
        list-style: none;
        font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial, noto sans, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji;
        position: relative;
        display: inline-block;
        min-width: 0;
        background-color: #fff;
        background-image: none;
        border-width: 1px;
        border-style: solid;
        border-color: #d9d9d9;
        border-radius: 6px;
        transition: all .2s;
      }

      .input:hover {
        border-color: black;
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
            <div class="field flex-1 row align-center">
              <div class="label">${f.name}</div>
              <input
                class="input flex-1"      
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
      this._newData = this.objectDocument.data;
    }
  }

  async firstUpdated() {

  }
}

window.customElements.define('av-object-document', AVObjectDocument);
