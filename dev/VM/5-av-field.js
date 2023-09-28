import {html, css, AVItem} from './0-av-item.js';

import '../V/av-label.js';
import '../V/av-text-input.js';

export class AVField extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .input {
        position: relative;
        display: inline-block;
        padding: 5px 10px;
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
      
      .input.input-number {
        text-align: end;
      }
      
      .input.select {
        padding: 5px 8px;
      }

      .input:hover {
        border-color: black;
      }
    `;
  }

  static properties = {
    fieldItem: {},
    value: {},
    onInputFunc: {}
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="flex-1 row align-center">
        <av-label>${this.fieldItem.label || this.fieldItem.name}</av-label>
        ${this.renderInput(
          {
            value: this.value,
            onInputFunc: this._onInput,
            type: this.fieldItem.dataType,
            variant: this.fieldItem.variant,
            valuesList: this.fieldItem.valuesList,
          }
        )}
        <slot></slot>
      </div>
    `
  }

  renderInput({value, onInputFunc, type, variant, valuesList}) {
    let inputElement;
    if (!type || type === 'string') {
      inputElement = html`
        <input
          class="input flex-1"
          autocomplete="off"
          .value="${(value === null || value === undefined) ? '' : value}"
          @input="${onInputFunc}"
        >
      `
      if (variant === 'dropdown' && valuesList) {
        const valuesArr = valuesList.split(',');
        const trimedValuesArr = valuesArr.map(str => str.trim());
        inputElement = html`
          <select
            class="input select flex-1"
            autocomplete="off"
            @input="${onInputFunc}"
          >
            <option value=""></option>
            ${this.repeat(trimedValuesArr, str => html`
              <option .value="${str}" ?selected="${str === value}">${str}</option>
            `)}
          </select>
        `
      }
    }
    if (type === 'number') {
      inputElement = html`
        <input
          class="input input-number flex-1"
          autocomplete="off"
          type="${type}"
          .value="${(value === null || value === undefined) ? '' : value}"
          @input="${onInputFunc}"
        >
      `
    }
    if (type === 'boolean') {
      inputElement = html`
        <input
          class="input flex-1"
          autocomplete="off"
          type="checkbox"
          ?checked="${value}"
          @input="${onInputFunc}"
        >
      `
    }
    return inputElement;
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _onInput = (e) => {
    let value = e.target.value;
    if (this.fieldItem.dataType === 'boolean') {
      value = e.target.checked;
    }
    this.value = value;
    this.onInputFunc(value, e)
  }
}

window.customElements.define('av-field', AVField);
