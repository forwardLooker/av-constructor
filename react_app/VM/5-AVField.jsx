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

    style: null,
    $objectDocument: null,
    inspectedObject: null
  }
  state = {
    _value: this.props.value
  }
  render() {
    if (this.props.fieldItem.viewItemType === 'space div') {
      return (
        <div className='flex-1 pad-8'
             style={this.props.style}
             ref={this.props.refOnRootDiv}
        >
          {this.props.children}
        </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'label') {
      return (
          <div className='flex-1 pad-8'
               style={this.props.style}
               ref={this.props.refOnRootDiv}
          >
            <AVLabel>{this.props.fieldItem.label || 'label'}</AVLabel>
            {this.props.children}
          </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'button') {
      return (
        <div className='flex-1 pad-8'
             style={this.props.style}
             ref={this.props.refOnRootDiv}
        >
          <AVButton
            onClick={() => {
              if (this.props.$objectDocument) {
                const classInstance = this.props.$objectDocument.props.objectDocument.Class;
                const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
                if (moduleDefinition) {
                  const methodOnButton = moduleDefinition.methods[this.props.fieldItem.label];
                  if (methodOnButton) {
                    methodOnButton(this.props.$objectDocument)
                  }
                }
              }
            }}
          >{this.props.fieldItem.label || 'button'}</AVButton>
          {this.props.children}
        </div>
      )
    }
    // if (this.props.fieldItem.viewItemType === 'tabs') {
    //   return (
    //       <div className='flex-1 pad-8'
    //            style={this.props.style}
    //            ref={this.props.refOnRootDiv}
    //       >
    //         <div className='_tab-container flex-1'>
    //           <div className='_tab-head row'>
    //             <div className='pad-0-4 border'>tab 1</div>
    //             <div className='flex-1'></div>
    //           </div>
    //           <div className='_tab-body pad-8 border'>
    //             tab body
    //           </div>
    //         </div>
    //         {this.props.children}
    //       </div>
    //   )
    // }
    return (
      <div className={`flex-1 ${this.props.labelPosition === 'top'? 'column' : 'row'} align-center`}
         style={this.props.style}
         ref={this.props.refOnRootDiv}
      >
        {!this.props.isLabelHidden && (
          <AVLabel>{this.props.fieldItem.label || this.props.fieldItem.name}</AVLabel>
        )}
        {this._renderInput(
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

  _renderInput({value, onChangeFunc, fieldItem}) {
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
        let valuesArr
        if (Array.isArray(fieldItem.valuesList)) {
          valuesArr = fieldItem.valuesList;
        } else {
          valuesArr = fieldItem.valuesList.split(',');
        }
        const trimedValuesArr = valuesArr.map(str => str.trim());
        inputElement = (
          <this.styles.select
            className="flex-1"
            autoComplete="off"
            value={value}
            onChange={onChangeFunc}
          >
            {!fieldItem.isEmptyOptionHidden && (
              <option value=""></option>
            )}
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

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value || this.props.inspectedObject !== prevProps.inspectedObject) {
      this.setState({_value: this.props.value});
    }
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
