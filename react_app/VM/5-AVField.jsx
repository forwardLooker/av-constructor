import React from 'react';

import {AVItem} from './0-AVItem.js';

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
        {!this.props.isLabelHidden && (
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
            onDataInItemsChangedFunc={this.props.onChangeFunc}
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
            readOnly
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
    this.props.$objectDocument.showClass(name, (objDocItem) => {
      this.setState({_value: objDocItem.data})
      this.props.onChangeFunc(objDocItem.data);
    });
  }

}
