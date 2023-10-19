import React from 'react';

import {html, css, AVItem} from './0-av-item.js';

import '../V/av-text-input.js';
import {AVLabel} from "../V/AVLabel.jsx";
import {AVButton} from "../V/AVButton.jsx";
import {AVGrid} from "../V/AVGrid.jsx";

export class AVField extends AVItem {
  styles = {
    input: this.styled.input`
      position: relative;
      display: inline-block;
      padding: 5px 10px;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: 1px solid black;
      border-radius: 6px;
      vertical-align: middle;
      
      &.input-number {
        text-align: end;
      }
      &.checkbox {
        height: 26px
      }
    `,
    select: this.styled.select`
      position: relative;
      display: inline-block;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: 1px solid black;
      border-radius: 6px;
      vertical-align: middle;

      &:hover {
        border-color: black;
      }

      height: 32px;
      padding: 5px 8px;
    `
  }
  static defaultProps = {
    fieldItem: null,
    value: '',
    isLabelHidden: false,
    labelPosition: 'left' , // enum: ['left', 'top']
    onChangeFunc: this.noop,

    $objectDocument: null,
  }
  state = {
    _value: this.props.value
  }
  render() {
    return (
      <div className={`flex-1 ${this.props.labelPosition === 'top'? 'column' : 'row'} align-center`}>
        {!this.isLabelHidden && (
          <AVLabel>{this.props.fieldItem.label || this.props.fieldItem.name}</AVLabel>
        )}
        {this.renderInput(
          {
            value: this.state._value,
            onChangeFunc: this._onChange,
            fieldItem: this.props.fieldItem,
          }
        )}
        {this.props.children}
      </div>
    )
  }

  renderInput({value, onChangeFunc, fieldItem}) {
    let inputElement;
    if (!fieldItem.dataType || fieldItem.dataType === 'string') {
      inputElement = (
        <this.styles.input
          className="flex-1"
          autoComplete="off"
          value={(value === null || value === undefined) ? '' : value}
          onChange={onChangeFunc}
        ></this.styles.input>
      )
      if (fieldItem.variant === 'select' && fieldItem.valuesList) {
        const valuesArr = fieldItem.valuesList.split(',');
        const trimedValuesArr = valuesArr.map(str => str.trim());
        inputElement = (
          <this.styles.select
            className="flex-1"
            autoComplete="off"
            value={value}
            onChange={onChangeFunc}
          >
            <option value=""></option>
            {trimedValuesArr.map(str => (
              <option key={str} value={str}>{str}</option>
            ))}
          </this.styles.select>
        )
      }
    }
    if (fieldItem.dataType === 'number') {
      inputElement = (
        <this.styles.input
          className="input-number flex-1"
          autoComplete="off"
          type={fieldItem.dataType}
          value={(value === null || value === undefined) ? '' : value}
          onChange={onChangeFunc}
        ></this.styles.input>
      )
    }
    if (fieldItem.dataType === 'boolean') {
      inputElement = (
        <this.styles.input
          className="checkbox flex-1"
          autoComplete="off"
          type="checkbox"
          checked={value}
          onChange={onChangeFunc}
        ></this.styles.input>
      )
    }
    if (fieldItem.dataType === 'array') {
      const gridItems = value || [];
      let $gridRef;
      inputElement = (
        <div className="flex-1 row align-start">
          <AVButton
            onClick={() => {
              gridItems.push({});
              $gridRef.forceUpdate();
              this.props.onChangeFunc(gridItems);
            }}
          >+</AVButton>
          <AVGrid
            ref={el => $gridRef = el}
            items={gridItems}
            columns={fieldItem.items}
            isTypedColumns
            isCellEditable
            onDataInItemsChanged={this.props.onChangeFunc}
            >
          </AVGrid>
        </div>
      )
    }
    if (fieldItem.dataType === 'link') {
      inputElement = (
        <div className="flex-1 row">
          <this.styles.input
            className="flex-1"
            autoComplete="off"
            value={value?.name}
            readonly
          ></this.styles.input>
          <AVButton onClick={() => this.showClass(fieldItem.variant)}>
            Выбрать
          </AVButton>
        </div>
      )
    }
    return inputElement;
  }

  _onChange = (e) => {
    // e.persist();
    // console.log('onChange e', e);
    let value = e.target.value;
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    }
    this.setState({_value: value})
    this.props.onChangeFunc(value, e)
  }

  showClass = (name) => {
    this.$objectDocument.showClass(name, (objDocItem) => {
      this.setState({_value: objDocItem.data})
      this.props.onChangeFunc(objDocItem.data);
    });
  }

}

export class AVField2 extends AVItem {
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
                readonly
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
