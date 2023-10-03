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
      
      .input.checkbox {
        height: 26px;
      }
      
      .input.select {
        height: 32px;
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
    isLabelHidden: {type: Boolean},
    labelPosition: {enum: ['left', 'top']},
    onInputFunc: {},

    $objectDocument: {},
  };

  constructor() {
    super();
    this.onInputFunc = this.noop;
  }

  willUpdate(changedProps) {
    if (changedProps.has('fieldItem')) {
      this.labelPosition = this.fieldItem.dataType === 'array'? 'top' : 'left';
    }
  }

  render() {
    return html`
      <div class="flex-1 ${this.labelPosition === 'top'? 'column' : 'row'} align-center">
        ${this.if(!this.isLabelHidden, html`
          <av-label>${this.fieldItem.label || this.fieldItem.name}</av-label>
        `)}
        ${this.renderInput(
          {
            value: this.value,
            onInputFunc: this._onInput,
            fieldItem: this.fieldItem,
          }
        )}
          <slot></slot>
      </div>
    `
  }

  renderInput({value, onInputFunc, fieldItem}) {
    let inputElement;
    if (!fieldItem.dataType || fieldItem.dataType === 'string') {
      inputElement = html`
        <input
          class="input flex-1"
          autocomplete="off"
          .value="${(value === null || value === undefined) ? '' : value}"
          @input="${onInputFunc}"
        >
      `
      if (fieldItem.variant === 'select' && fieldItem.valuesList) {
        const valuesArr = fieldItem.valuesList.split(',');
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
    if (fieldItem.dataType === 'number') {
      inputElement = html`
        <input
          class="input input-number flex-1"
          autocomplete="off"
          type="${fieldItem.dataType}"
          .value="${(value === null || value === undefined) ? '' : value}"
          @input="${onInputFunc}"
        >
      `
    }
    if (fieldItem.dataType === 'boolean') {
      inputElement = html`
        <input
          class="input checkbox flex-1"
          autocomplete="off"
          type="checkbox"
          ?checked="${value}"
          @input="${onInputFunc}"
        >
      `
    }
    if (fieldItem.dataType === 'array') {
      const gridItems = value || [];
      let gridRef;
      inputElement = html`
          <div class="flex-1 row align-start">
            <av-button
              @click="${() => {
                  gridItems.push({});
                  gridRef.requestUpdate();
                  this.onInputFunc(gridItems);
              }}"
            >+</av-button>
            <av-grid
              ${this.ref(el => gridRef = el)}
              .items="${gridItems}"
              .columns="${fieldItem.items}"
              isTypedColumns
              isCellEditable
              .onDataInItemsChanged="${this.onInputFunc}"
            >
            </av-grid>
          </div>
      `
    }
    if (fieldItem.dataType === 'link') {
      inputElement = html`
          <div class="flex-1 row">
              <input
                class="input flex-1"
                autocomplete="off"
                .value="${value?.name}"
                disabled
              >
              <av-button @click="${() => this.showClass(fieldItem.variant)}">
                  Выбрать
              </av-button>
          </div>
        `
    }
    return inputElement;
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  showClass(name) {
    this.$objectDocument.showClass(name, (objDocItem) => {
      this.value = objDocItem.data;
      this.onInputFunc(objDocItem.data);
    });
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
