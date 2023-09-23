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
        position: relative;
        display: inline-block;
        padding: 5px 12px;
        line-height: 20px;
        background-color: #fff;
        transition: all .2s;
        border: 1px solid black;
        border-radius: 6px;
        box-shadow: gray;
        vertical-align: middle;
        //-webkit-box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
        //box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
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

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _input(e) {
    this.value = e.target.value;
    this.onInputFunc(e.target.value, e)
  }
}

window.customElements.define('av-field', AVField);
