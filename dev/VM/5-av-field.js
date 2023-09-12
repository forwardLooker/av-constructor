import {html, css, AVItem} from './0-av-item.js';

import {Host} from '../M/1-Host.js';

export class AVField extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
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

        -webkit-box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
        box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
      }

      .input:hover {
        border-color: black;
      }
    `;
  }

  static properties = {
    item: {},
    value: {},
    onInputFunc: {}
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="flex-1 row align-center">
        <label class="label">${this.item.name}</label>
        <input
          class="input flex-1"  
          value="${this.value}"
          @input="${this._input}"
        >
        <slot></slot>
      </div>
    `
  }

  _input(e) {
    this.value = e.target.value;
    this.onInputFunc(e.target.value, e)
  }

  async firstUpdated() {

  }
}

window.customElements.define('av-field', AVField);
