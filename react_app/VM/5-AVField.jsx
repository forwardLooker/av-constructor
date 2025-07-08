import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVLabel} from "../V/AVLabel.jsx";
import {AVButton} from "../V/AVButton.jsx";
import { AVGrid } from "../V/AVGrid.jsx";
import { AVIcon } from "../V/icons/AVIcon.jsx";

const emailValidator = require('@sefinek/email-validator');

const AVField = React.forwardRef((props, ref) => (
  <AVFieldWrapper {...props} forwardedRef={ref}></AVFieldWrapper>
))
export { AVField };
  
class AVFieldWrapper extends React.PureComponent { // Для отладки в Dev Tools, тест производительности разницы не заметил
  AVFieldWithDisplayName = class extends AVFieldOriginal { }
  render() {
    this.AVFieldWithDisplayName.displayName = ('AVField' + '(' + (this.props.fieldItem.label || this.props.fieldItem.viewItemType) + ')');
    return (
      <this.AVFieldWithDisplayName ref={this.props.forwardedRef} {...this.props}></this.AVFieldWithDisplayName>
    )
  }
}

class AVFieldOriginal extends AVItem {
  static styles = {
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
        height: 20px
      }
    `,
    textarea: this.styled.textarea`
      position: relative;
      display: inline-block;
      padding: 5px 10px;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: 1px solid black;
      border-radius: 6px;
      vertical-align: middle;
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
    `,
    rangeInput: this.styled.input`
      position: relative;
      display: inline-block;
      padding: 8px 0 12px;
      font-size: 20px;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: none;
      border-radius: 6px;
      outline: none;
      vertical-align: middle;
    `,
    gazprombankInput: this.styled.input`
      position: relative;
      font-size: 16px;
      font-weight: 400;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: none;
      border-radius: 6px;
      outline: none;
      vertical-align: middle;
    `,
    gazprombankRadioInput: this.styled.div`
      &::after {
        content: "";
        position: absolute;
        width: 8px;
        height: 8px;
        opacity: 1;
        border-radius: 50%;
        background: white;
      }
    `,
  }
  static defaultProps = {
    fieldItem: null,
    value: null,
    readOnly: false,
    isLabelHidden: false,
    labelPosition: 'left' , // enum: ['left', 'top']
    onChangeFunc: this.noop,

    style: null,
    $objectDocument: null,
    inspectedObject: null,

    rowIdxInGrid: null
  }
  
  state = {
    _value: ((this.props.value === null || this.props.value === undefined) && this.props.fieldItem?.defaultValue) || this.props.value,
    isFocusedState: false, // для Газпромбанк инпутов
    isInvalidState: false,
    isRequiredMessageRendered: false,
    
    isInvalidMessageRendered: false,
    invalidMessage: '',
  }
  
  _computedValueNotified;
  
  _labelFontSizeClassName = 'font-size-16px'; //for variant Gazprombank-string
  
  _sliderFreeSpaceRef;
  _sliderFillSpaceWidth = 0;

  gazInputRef;
  optionsListRef; // для Газпромбанк селекта

  
  //render
  
  componentDidMount() {
    if ((this.props.value === null || this.props.value === undefined) && this.props.fieldItem?.defaultValue) {
      this.props.onChangeFunc(this.props.fieldItem?.defaultValue)
    }
    if (this._sliderFreeSpaceRef) {
      const sliderFreeSpaceWidth = this._sliderFreeSpaceRef.getBoundingClientRect().width;
      this._sliderFillSpaceWidth = (sliderFreeSpaceWidth / (this.props.fieldItem.maxValue - this.props.fieldItem.minValue)) * (this.state._value - this.props.fieldItem.minValue);
      if (Number(this.state._value) < Number(this.props.fieldItem.minValue)) {
        this._sliderFillSpaceWidth = 0;
      }
      if (Number(this.state._value) > Number(this.props.fieldItem.maxValue)) {
        this._sliderFillSpaceWidth = sliderFreeSpaceWidth;
      }
      this.forceUpdate();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.value !== prevProps.value || this.props.inspectedObject !== prevProps.inspectedObject) {
      this.setState({ _value: this.props.value });
    }
    if (this._sliderFreeSpaceRef && this.state._value !== prevState._value) {
      const sliderFreeSpaceWidth = this._sliderFreeSpaceRef.getBoundingClientRect().width;
      this._sliderFillSpaceWidth = (sliderFreeSpaceWidth / (this.props.fieldItem.maxValue - this.props.fieldItem.minValue)) * (this.state._value - this.props.fieldItem.minValue);
      if (Number(this.state._value) < Number(this.props.fieldItem.minValue)) {
        this._sliderFillSpaceWidth = 0;
      }
      if (Number(this.state._value) > Number(this.props.fieldItem.maxValue)) {
        this._sliderFillSpaceWidth = sliderFreeSpaceWidth;
      }
      this.forceUpdate();
    }

  }

  render() {
    if (this.props.fieldItem.viewItemType === 'space div') {
      return (
        <div className='_av-field-viewItem-root flex-1 pad-8'
             style={this.props.style}
             ref={this.props.refOnRootDiv}
        >
          {this.props.children}
        </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'label') {
      return (
          <div className='_av-field-viewItem-root flex-1 pad-8'
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
        <div className='_av-field-viewItem-root flex-1 pad-8'
             style={this.props.style}
             ref={this.props.refOnRootDiv}
        >
          <AVButton
            style={this.props.fieldItem.buttonStyle}
            onClick={() => {
              if (this.props.$objectDocument) {
                const classInstance = this.props.$objectDocument.state._objectDocument.Class;
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
    if (this.props.fieldItem.viewItemType === 'icon') {
      return (
        <div className='_av-field-viewItem-root flex-1 row'
          style={this.props.style}
          ref={this.props.refOnRootDiv}
        >
          <AVIcon name={this.props.fieldItem.name}></AVIcon>
          {this.props.children}
        </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'gazprombank progress bar') {
      return (
        <div className='_av-field-viewItem-root flex-1 row'
          style={this.props.style}
          ref={this.props.refOnRootDiv}
        >
          <div className='flex-1 pos-rel height-8px bg-gaz-progress-empty border-radius-8px'>
            <div className='width-25prc height-100prc bg-gaz-progress-four border-radius-8px'></div>
            <div className='width-5prc pos-abs top-0 height-100prc bg-gaz-progress-fill border-radius-8px animation-gaz-progress'></div>
          </div>
          {this.props.children}
        </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'gazprombank progress bar page2') {
      return (
        <div className='_av-field-viewItem-root flex-1 row'
          style={this.props.style}
          ref={this.props.refOnRootDiv}
        >
          <div className='flex-1 pos-rel height-8px bg-gaz-progress-empty border-radius-8px'>
            <div className='width-50prc height-100prc bg-gaz-progress-four border-radius-8px'></div>
            <div className='width-25prc pos-abs top-0 height-100prc bg-gaz-progress-fill border-radius-8px animation-gaz-progress'></div>
          </div>
          {this.props.children}
        </div>
      )
    }
    if (this.props.fieldItem.viewItemType === 'gazprombank progress bar page3') {
      return (
        <div className='_av-field-viewItem-root flex-1 row'
          style={this.props.style}
          ref={this.props.refOnRootDiv}
        >
          <div className='flex-1 pos-rel height-8px bg-gaz-progress-empty border-radius-8px'>
            <div className='width-75prc height-100prc bg-gaz-progress-four border-radius-8px'></div>
            <div className='width-50prc pos-abs top-0 height-100prc bg-gaz-progress-fill border-radius-8px animation-gaz-progress'></div>
          </div>
          {this.props.children}
        </div>
      )
    }

    
    if (this.props.fieldItem.viewItemType === 'gazprombank change credit parameters') {
      const calcMonthPay = () => {
        if (!this.Host.gazCreditFirstPageData?.['Желаемая сумма']) {
          return '168 823'
        }
        const years = Number(this.Host.gazCreditFirstPageData['Срок кредита']) / 12;
        const payPerYear = Number(this.Host.gazCreditFirstPageData['Желаемая сумма']) * 0.2;
        const SumWithProcent = Number(this.Host.gazCreditFirstPageData['Желаемая сумма']) + (payPerYear * years);
        const monthPay = SumWithProcent / Number(this.Host.gazCreditFirstPageData['Срок кредита']);
        return Math.round(monthPay)
      }
      return (
        <div className='_av-field-viewItem-root flex-1 pad-15 bg-gaz-change-credit-parameters'
          style={this.props.style}
          ref={this.props.refOnRootDiv}
        >
          <div className='flex-1 row space-between'>
            <div className='row'>
              <div>
                <div className='color-gaz-label font-size-14px font-weight-400'>Сумма кредита</div>
                <div className='font-size-20px font-weight-600'>
                  {this.Host.gazCreditFirstPageData?.['Желаемая сумма'] ? (this.Host.gazCreditFirstPageData?.['Желаемая сумма'] + ' ₽') : '5 000 000 ₽'}
                </div>
              </div>
              <div className='margin-left-32'>
                <div className='color-gaz-label font-size-14px font-weight-400'>Срок кредита</div>
                <div className='font-size-20px font-weight-600'>
                  {this.Host.gazCreditFirstPageData?.['Срок кредита'] ? (this.Host.gazCreditFirstPageData?.['Срок кредита'] + ' месяцев') : '60 месяцев'}
                </div>
              </div>
              <div className='margin-left-32'>
                <div className='color-gaz-label font-size-14px font-weight-400'>Ежемесячный платеж</div>
                <div className='font-size-20px font-weight-600'>от {calcMonthPay()} ₽</div>
              </div>
            </div>
            <div className='row align-center'>
              <AVButton
                style={{
                  border: '0px',
                  fontSize: '16px',
                  height: '40px',
                  padding: '0 16px',
                  color: 'black',
                  background: '#0a0a0b0f'
                }}
              >
                Изменить
              </AVButton>
            </div>
          </div>
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
      <div className={`_av-field-root flex-1 row align-center`}
         style={this.props.style}
         ref={this.props.refOnRootDiv}
      >
        <div className='flex-1 col'>
          <div className={`flex-1 ${this._calcLabelPosition() === 'top' ? '' : 'row'}`}>
            {(!this._calcIsLabelHidden() && this._calcLabelPosition() !== 'right') && (
              <AVLabel
                className={`pad-0-4-0-0 ${this.props.fieldItem.variant === 'input+range' ? 'color-gaz-label' : ''}`}
                justifyMode={(this.props.fieldItem.variant === 'input+range' || this.props.fieldItem.variant === 'binary-buttons' || this.props.fieldItem.variant === 'radio-buttons') ? 'start' : 'center'}
              >{this._buildLabel()}</AVLabel>
            )}
            {this._renderInput(
              {
                _value: this.state._value,
                readOnly: this.props.readOnly || this.props.fieldItem.isReadOnly || this.props.fieldItem.isComputed,
                onChangeFunc: this._onChange,
                fieldItem: this.props.fieldItem,
              }
            )}
            {this._calcLabelPosition() === 'right' && (
              <AVLabel
                className={`pad-0-4-0-0`}
                justifyMode={this.props.fieldItem.variant === 'input+range' ? 'start' : 'center'}
              >{this._buildLabel()}</AVLabel>
            )}
          </div>
          {this.props.fieldItem.infoMessage && (
            <div className="row align-start margin-top-8 font-size-14px color-gaz-info">
              <AVIcon className='margin-top-2' name='informer'></AVIcon>
              <span className='margin-left-4'>{this.props.fieldItem.infoMessage}</span>
            </div>
          )}
          {this.state.isRequiredMessageRendered && (
            <div className="row align-start margin-top-8 font-size-14px color-gaz-error">
              <AVIcon className='margin-top-2' name='informerError'></AVIcon>
              <span className='margin-left-4'>Обязательное поле</span>
            </div>
          )}
          {this.state.isInvalidMessageRendered && (
            <div className="row align-start margin-top-8 font-size-14px color-gaz-error">
              <AVIcon className='margin-top-2' name='informerError'></AVIcon>
              <span className='margin-left-4'>{this.state.invalidMessage}</span>
            </div>
          )}
        </div>
        {this.props.children}
      </div>
    )
  }
  
  _buildLabel() {
    if (this.props.fieldItem.labelPartWhichHaveLinkUrl) {
      const labelArr = this.props.fieldItem.label.split(this.props.fieldItem.labelPartWhichHaveLinkUrl);
      return (
        <span>
          <span>{labelArr[0]}</span>
          <a href={this.props.fieldItem.linkUrlForLabelPart} target="_blank">{this.props.fieldItem.labelPartWhichHaveLinkUrl}</a>
          <span>{labelArr[1]}</span>
        </span>
      )
    } else {
      return (this.props.fieldItem.label || this.props.fieldItem.name)
    }
  }

  _renderInput({_value, readOnly, onChangeFunc, fieldItem}) {
    let value = _value === null ? (fieldItem.defaultValue || null) : _value
    if (fieldItem.isComputed && fieldItem.computeFunction) {
      let f = new Function('rowIdx', fieldItem.computeFunction);
      f = f.bind(this.props.$objectDocument.state._newData);
      // console.log('fieldItem.isComputed rowIdxInGrid', this.props.rowIdxInGrid);
      value = f(this.props.rowIdxInGrid);
      // console.log('fieldItem.isComputed value', value);
      if (value !== this._computedValueNotified) {
        this.props.onChangeFunc(value);
        this._computedValueNotified = value;
      }
    }
    let inputElement;
    if (fieldItem.dataType === 'null') {
      inputElement = (
          <div className="flex-1"></div>
      )
    }
    if (!fieldItem.dataType || fieldItem.dataType === 'string') {
      inputElement = (
        <AVFieldOriginal.styles.input
          className="flex-1"
          autoComplete="off"
          value={(value === null || value === undefined) ? '' : value}
          readOnly={readOnly}
          onChange={onChangeFunc}
        ></AVFieldOriginal.styles.input>
      );
      if (fieldItem.variant === 'textarea') {
        inputElement = (
          <AVFieldOriginal.styles.textarea
            className="flex-1"
            autoComplete="off"
            rows={16}
            value={(value === null || value === undefined) ? '' : value}
            readOnly={readOnly}
            onChange={onChangeFunc}
          ></AVFieldOriginal.styles.textarea>
        );
      }
      if (fieldItem.variant === 'select' && fieldItem.valuesList) {
        let valuesArr
        if (Array.isArray(fieldItem.valuesList)) {
          valuesArr = fieldItem.valuesList;
        } else if (typeof fieldItem.valuesList === 'function') {
          valuesArr = fieldItem.valuesList();
        } else {
          valuesArr = fieldItem.valuesList.split(',');
        }
        const trimedValuesArr = valuesArr.map(str => str.trim());
        inputElement = (
          <AVFieldOriginal.styles.select
            className="flex-1"
            autoComplete="off"
            value={(value === null || value === undefined) ? (fieldItem.defaultValue || '') : value}
            readOnly={readOnly}
            onChange={onChangeFunc}
          >
            {!fieldItem.isEmptyOptionHidden && (
              <option value=""></option>
            )}
            {trimedValuesArr.map(str => (
              <option key={str} value={str}>{str}</option>
            ))}
          </AVFieldOriginal.styles.select>
        )
      }
      if (fieldItem.variant === 'binary-buttons' && fieldItem.valuesList) {
        let valuesArr
        if (Array.isArray(fieldItem.valuesList)) {
          valuesArr = fieldItem.valuesList;
        } else if (typeof fieldItem.valuesList === 'function') {
          valuesArr = fieldItem.valuesList();
        } else {
          valuesArr = fieldItem.valuesList.split(',');
        }
        const trimedValuesArr = valuesArr.map(str => str.trim());
        
        const selectedStyle = { padding: '12px 16px', color: '#fff', fontWeight: 400, background: '#1e222e', border: 'none', borderRadius: '100px', transition: 'background .2s' };
        const unselectedStyle = { padding: '12px 16px', color: '#1e222e', fontWeight: 400, background: '#eaecf4', border: 'none', borderRadius: '100px', transition: 'background .2s' };
        const firstButtonStyle = trimedValuesArr[0] === value ? selectedStyle : unselectedStyle;
        let secondButtonStyle = trimedValuesArr[1] === value ? selectedStyle : unselectedStyle;
        secondButtonStyle = this.deepClone(secondButtonStyle); // клон чтобы к соседу не применялось
        secondButtonStyle.marginLeft = '8px'; 
        inputElement = (
          <div className='margin-top-12'>
            <AVButton
              style={firstButtonStyle}
              onClick={() => {
                this.setState({
                  _value: trimedValuesArr[0],
                  isInvalidState: false,
                  isInvalidMessageRendered: false,
                });
                this.props.onChangeFunc(trimedValuesArr[0])
              }}
              disabled={readOnly}
            >{trimedValuesArr[0]}</AVButton>
            <AVButton
              style={secondButtonStyle}
              onClick={() => {
                this.setState({
                  _value: trimedValuesArr[1],
                  isInvalidState: false,
                  isInvalidMessageRendered: false,
                });
                this.props.onChangeFunc(trimedValuesArr[1])
              }}
              disabled={readOnly}
            >{trimedValuesArr[1]}</AVButton>
          </div>
        )
      }

      if (fieldItem.variant === 'radio-buttons' && fieldItem.valuesList) {
        let valuesArr
        if (Array.isArray(fieldItem.valuesList)) {
          valuesArr = fieldItem.valuesList;
        } else if (typeof fieldItem.valuesList === 'function') {
          valuesArr = fieldItem.valuesList();
        } else {
          valuesArr = fieldItem.valuesList.split(',');
        }
        const trimedValuesArr = valuesArr.map(str => str.trim());
        
        inputElement = (
          <div className='margin-top-12'>
            {trimedValuesArr.map(str => (
              <div key={str} className='row margin-top-12 cursor-pointer'
                onClick={() => {
                  this.setState({
                    _value: str,
                    isInvalidState: false,
                    isInvalidMessageRendered: false,
                  });
                  this.props.onChangeFunc(str)
                }}
              >
                <AVFieldOriginal.styles.gazprombankRadioInput
                  className={`row pos-rel width-20px height-20px align-center justify-center ${value === str ? 'bg-gaz-radio' : 'bg-white border-gaz-radio'} border-radius-50prc cursor-pointer`}
                >
                  <input
                    className='margin-0 opacity-0 cursor-pointer'
                    type='radio'
                    name={fieldItem.name}
                    checked={value === str}
                    disabled={readOnly}
                  ></input>
                </AVFieldOriginal.styles.gazprombankRadioInput>
                <AVLabel className='margin-left-8 cursor-pointer'>{str}</AVLabel>
              </div>
            ))}
          </div>
        )
      }

      if (fieldItem.variant === 'date') {
        inputElement = (
          <AVFieldOriginal.styles.input
                className="flex-1"
                autoComplete="off"
                type="date"
                value={(value === null || value === undefined) ? '' : value}
                readOnly={readOnly}
                onChange={onChangeFunc}
          ></AVFieldOriginal.styles.input>
        )
      }
      if (fieldItem.variant === 'Gazprombank-string') {
        let gazInputRef;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              gazInputRef.removeAttribute('hidden');
              gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => gazInputRef = el}
              hidden
              autoComplete="off"
              value={(value === null || value === undefined) ? '' : value}
              readOnly={readOnly}
              onChange={onChangeFunc}
              onBlur={() => {
                if (!value) {
                  gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => this.setState({
                isFocusedState: true,
                isInvalidState: false,
                isRequiredMessageRendered: false,
              })}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
      if (fieldItem.variant === 'Gazprombank-string-number') {
        let gazInputRef;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              gazInputRef.removeAttribute('hidden');
              gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => gazInputRef = el}
              hidden
              autoComplete="off"
              value={(value === null || value === undefined) ? '' : value}
              readOnly={readOnly}
              onChange={onChangeFunc}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onBlur={() => {
                if (!value) {
                  gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => this.setState({
                isFocusedState: true,
                isInvalidState: false,
                isRequiredMessageRendered: false,
              })}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }

      if (fieldItem.variant === 'Gazprombank-string-select') {
        let valuesArr
        if (Array.isArray(fieldItem.valuesList)) {
          valuesArr = fieldItem.valuesList;
        } else if (typeof fieldItem.valuesList === 'function') {
          valuesArr = fieldItem.valuesList();
        } else {
          valuesArr = fieldItem.valuesList.split(',');
        }
        const trimedValuesArr = valuesArr.map(str => str.trim());
        
        let gazInputRef;
        // let optionsListRef;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement pos-rel flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.optionsListRef.removeAttribute('hidden');
              gazInputRef.removeAttribute('hidden');
              gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => gazInputRef = el}
              hidden
              autoComplete="off"
              value={(value === null || value === undefined) ? '' : value}
              readOnly={true}
              onChange={onChangeFunc}
              onBlur={() => {
                if (!value) {
                  gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                this.setState({ isFocusedState: false });
                setTimeout(() => { // потому что онКлик в Листе не успевает сработать
                  this.optionsListRef.setAttribute('hidden', '');
                }, 200)
              }}
              onFocus={() => this.setState({
                isFocusedState: true,
                isInvalidState: false,
                isRequiredMessageRendered: false,
              })}
            ></AVFieldOriginal.styles.gazprombankInput>
            <AVIcon className='pos-abs right-16px' name='gazSelectArrow'></AVIcon>
            <div ref={el => this.optionsListRef = el}
              hidden
              className='pos-abs height-160px bottom-minus168px rl-0 pad-4 bg-white border-radius-12px scroll-y z-index-100 box-shadow'
            >
              {trimedValuesArr.map(str => (
                <div
                  key={str}
                  className={`pad-8 font-weight-400 ${value === str ? 'color-gaz-accent bg-gaz-field-selected' : ''} bg-gaz-field-hover cursor-pointer`}
                  onClick={() => {
                    console.log('str onClick', str);
                    this.setState({ _value: str });
                    this.props.onChangeFunc(str)
                  }}
                >{str}</div>
              ))}
            </div>
          </div>
        )
      }
      if (fieldItem.variant === 'Gazprombank-email') {
        let gazInputRef;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              gazInputRef.removeAttribute('hidden');
              gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => gazInputRef = el}
              hidden
              autoComplete="off"
              value={(value === null || value === undefined) ? '' : value}
              readOnly={readOnly}
              onChange={onChangeFunc}
              onBlur={() => {
                if (!value) {
                  gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value) {
                  if (!emailValidator.test(value)) {
                    this.setState({
                      isInvalidState: true,
                      isInvalidMessageRendered: true,
                      invalidMessage: 'Проверьте адрес почты',
                    })
                  }
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => this.setState({
                isFocusedState: true,
                isInvalidState: false,
                isInvalidMessageRendered: false,
                isRequiredMessageRendered: false,
              })}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
      
      if (fieldItem.variant === 'Gazprombank-tel') {
        // let gazInputRef;
        value = (value === null || value === undefined) ? '+7 (___) ___-__-__' : value;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.gazInputRef.removeAttribute('hidden');
              this.gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => this.gazInputRef = el}
              autoComplete="off"
              inputmode="tel"
              value={(value === null || value === undefined) ? '+7 (___) ___-__-__' : value}
              readOnly={readOnly}
              onClick={e => {
                const selectionIndex = value.indexOf('_');
                this.gazInputRef.selectionStart = selectionIndex;
                this.gazInputRef.selectionEnd = selectionIndex;

              }}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onChange={e => {
                if (this.gazInputRef.selectionStart === this.gazInputRef.selectionEnd) {
                  if (this.gazInputRef.selectionStart === 19) {
                    return;
                  }
                  let valueArr = value.split('');
                  if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    if (valueArr[this.gazInputRef.selectionStart] === '-') {
                      valueArr.splice(this.gazInputRef.selectionStart - 1, 1, '_');
                    } else if (valueArr[this.gazInputRef.selectionStart] === ' ') {
                      valueArr.splice(this.gazInputRef.selectionStart - 2, 1, '_');
                    } else if (valueArr[this.gazInputRef.selectionStart] === '(') {
                      Promise.resolve().then(() => {
                        this.gazInputRef.selectionStart = 4;
                        this.gazInputRef.selectionEnd = 4;
                      });
                      return;
                    } else {
                      valueArr.splice(this.gazInputRef.selectionStart, 1, '_');
                    }
                  } else {
                    const key = e.nativeEvent.data;
                    valueArr.splice(this.gazInputRef.selectionStart - 1, 1, key);
                  }
                  const newValue = valueArr.join('');
                  this.setState({ _value: newValue }, () => {
                    const selectionIndex = newValue.indexOf('_');
                    this.gazInputRef.selectionStart = selectionIndex;
                    this.gazInputRef.selectionEnd = selectionIndex;
                  })
                  this.props.onChangeFunc(newValue);
                }
                // onChangeFunc(e);
              }}
              onBlur={() => {
                if (!value) {
                  this.gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value.indexOf('_') > -1) {
                  this.setState({
                    isInvalidState: true,
                    isInvalidMessageRendered: true,
                    invalidMessage: 'Номер телефона указан неверно',
                  })
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => {
                this.setState({
                  isFocusedState: true,
                  isInvalidState: false,
                  isRequiredMessageRendered: false,
                  isInvalidMessageRendered: false,
                });
              }}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
      if (fieldItem.variant === 'Gazprombank-passport-seria-number') {
        // let gazInputRef;
        value = (value === null || value === undefined) ? '____ ______' : value;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.gazInputRef.removeAttribute('hidden');
              this.gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => this.gazInputRef = el}
              autoComplete="off"
              inputmode="tel"
              value={(value === null || value === undefined) ? '____ ______' : value}
              readOnly={readOnly}
              onClick={e => {
                const selectionIndex = value.indexOf('_');
                this.gazInputRef.selectionStart = selectionIndex;
                this.gazInputRef.selectionEnd = selectionIndex;

              }}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onChange={e => {
                if (this.gazInputRef.selectionStart === this.gazInputRef.selectionEnd) {
                  if (this.gazInputRef.selectionStart === 12) {
                    return;
                  }
                  let valueArr = value.split('');
                  if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    if (valueArr[this.gazInputRef.selectionStart] === ' ') {
                      valueArr.splice(this.gazInputRef.selectionStart - 1, 1, '_');
                    } else {
                      valueArr.splice(this.gazInputRef.selectionStart, 1, '_');
                    }
                  } else {
                    const key = e.nativeEvent.data;
                    valueArr.splice(this.gazInputRef.selectionStart - 1, 1, key);
                  }
                  const newValue = valueArr.join('');
                  this.setState({ _value: newValue }, () => {
                    const selectionIndex = newValue.indexOf('_');
                    this.gazInputRef.selectionStart = selectionIndex;
                    this.gazInputRef.selectionEnd = selectionIndex;
                  })
                  this.props.onChangeFunc(newValue);
                }
                // onChangeFunc(e);
              }}
              onBlur={() => {
                if (!value) {
                  this.gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value.indexOf('_') > -1) {
                  this.setState({
                    isInvalidState: true,
                    isInvalidMessageRendered: true,
                    invalidMessage: 'Некорректное значение',
                  })
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => {
                this.setState({
                  isFocusedState: true,
                  isInvalidState: false,
                  isRequiredMessageRendered: false,
                  isInvalidMessageRendered: false,
                });
              }}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
      if (fieldItem.variant === 'Gazprombank-date') {
        // let gazInputRef;
        value = (value === null || value === undefined) ? '__.__.____' : value;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.gazInputRef.removeAttribute('hidden');
              this.gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => this.gazInputRef = el}
              autoComplete="off"
              inputmode="tel"
              value={(value === null || value === undefined) ? '__.__.____' : value}
              readOnly={readOnly}
              onClick={e => {
                const selectionIndex = value.indexOf('_');
                this.gazInputRef.selectionStart = selectionIndex;
                this.gazInputRef.selectionEnd = selectionIndex;

              }}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onChange={e => {
                if (this.gazInputRef.selectionStart === this.gazInputRef.selectionEnd) {
                  if (this.gazInputRef.selectionStart === 11) {
                    return;
                  }
                  let valueArr = value.split('');
                  if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    if (valueArr[this.gazInputRef.selectionStart] === '.') {
                      valueArr.splice(this.gazInputRef.selectionStart - 1, 1, '_');
                    } else {
                      valueArr.splice(this.gazInputRef.selectionStart, 1, '_');
                    }
                  } else {
                    const key = e.nativeEvent.data;
                    valueArr.splice(this.gazInputRef.selectionStart - 1, 1, key);
                  }
                  const newValue = valueArr.join('');
                  this.setState({ _value: newValue }, () => {
                    const selectionIndex = newValue.indexOf('_');
                    this.gazInputRef.selectionStart = selectionIndex;
                    this.gazInputRef.selectionEnd = selectionIndex;
                  })
                  this.props.onChangeFunc(newValue);
                }
                // onChangeFunc(e);
              }}
              onBlur={() => {
                if (!value) {
                  this.gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value.indexOf('_') > -1) {
                  this.setState({
                    isInvalidState: true,
                    isInvalidMessageRendered: true,
                    invalidMessage: 'Некорректное значение',
                  })
                } else {
                  const day = Number(value.substring(0, 2));
                  const month = Number(value.substring(3, 5));
                  const year = Number(value.substring(6));
                  if (((1 > day) || (day > 31)) || ((1 > month) || (month > 12)) || ((1900 > year) || (year > 2100))) {
                    this.setState({
                      isInvalidState: true,
                      isInvalidMessageRendered: true,
                      invalidMessage: 'Некорректное значение',
                    })
                  }
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => {
                this.setState({
                  isFocusedState: true,
                  isInvalidState: false,
                  isRequiredMessageRendered: false,
                  isInvalidMessageRendered: false,
                });
              }}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
      if (fieldItem.variant === 'Gazprombank-date-month-year') {
        // let gazInputRef;
        value = (value === null || value === undefined) ? '__.____' : value;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.gazInputRef.removeAttribute('hidden');
              this.gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => this.gazInputRef = el}
              autoComplete="off"
              inputmode="tel"
              value={(value === null || value === undefined) ? '__.____' : value}
              readOnly={readOnly}
              onClick={e => {
                const selectionIndex = value.indexOf('_');
                this.gazInputRef.selectionStart = selectionIndex;
                this.gazInputRef.selectionEnd = selectionIndex;

              }}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onChange={e => {
                if (this.gazInputRef.selectionStart === this.gazInputRef.selectionEnd) {
                  if (this.gazInputRef.selectionStart === 8) {
                    return;
                  }
                  let valueArr = value.split('');
                  if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    if (valueArr[this.gazInputRef.selectionStart] === '.') {
                      valueArr.splice(this.gazInputRef.selectionStart - 1, 1, '_');
                    } else {
                      valueArr.splice(this.gazInputRef.selectionStart, 1, '_');
                    }
                  } else {
                    const key = e.nativeEvent.data;
                    valueArr.splice(this.gazInputRef.selectionStart - 1, 1, key);
                  }
                  const newValue = valueArr.join('');
                  this.setState({ _value: newValue }, () => {
                    const selectionIndex = newValue.indexOf('_');
                    this.gazInputRef.selectionStart = selectionIndex;
                    this.gazInputRef.selectionEnd = selectionIndex;
                  })
                  this.props.onChangeFunc(newValue);
                }
                // onChangeFunc(e);
              }}
              onBlur={() => {
                if (!value) {
                  this.gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value.indexOf('_') > -1) {
                  this.setState({
                    isInvalidState: true,
                    isInvalidMessageRendered: true,
                    invalidMessage: 'Некорректное значение',
                  })
                } else {
                  // const day = Number(value.substring(0, 2));
                  // const month = Number(value.substring(3, 5));
                  // const year = Number(value.substring(6));
                  const month = Number(value.substring(0, 2));
                  const year = Number(value.substring(3));
                  if (((1 > month) || (month > 12)) || ((1900 > year) || (year > 2100))) {
                    this.setState({
                      isInvalidState: true,
                      isInvalidMessageRendered: true,
                      invalidMessage: 'Некорректное значение',
                    })
                  }
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => {
                this.setState({
                  isFocusedState: true,
                  isInvalidState: false,
                  isRequiredMessageRendered: false,
                  isInvalidMessageRendered: false,
                });
              }}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }

      if (fieldItem.variant === 'Gazprombank-passport-kod-podrazdelenia') {
        // let gazInputRef;
        value = (value === null || value === undefined) ? '___-___' : value;
        let borderGaz = this.state.isInvalidState ? 'border-gaz-error' : 'border-gaz';
        if (this.state.isFocusedState) {
          borderGaz = 'border-gaz-accent'
        }
        inputElement = (
          <div className={`_inputElement flex-1 col justify-center height-56px ${borderGaz} border-radius-8px cursor-text`}
            onClick={() => {
              this.gazInputRef.removeAttribute('hidden');
              this.gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVFieldOriginal.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => this.gazInputRef = el}
              autoComplete="off"
              inputmode="tel"
              value={(value === null || value === undefined) ? '___-___' : value}
              readOnly={readOnly}
              onClick={e => {
                const selectionIndex = value.indexOf('_');
                this.gazInputRef.selectionStart = selectionIndex;
                this.gazInputRef.selectionEnd = selectionIndex;

              }}
              onKeyPress={evt => {
                var theEvent = evt || window.event;
                // Handle paste
                if (theEvent.type === 'paste') {
                  key = event.clipboardData.getData('text/plain');
                } else {
                  // Handle key press
                  var key = theEvent.keyCode || theEvent.which;
                  key = String.fromCharCode(key);
                }
                var regex = /[0-9]|\./;
                if (!regex.test(key)) {
                  theEvent.returnValue = false;
                  if (theEvent.preventDefault) theEvent.preventDefault();
                }
              }}
              onChange={e => {
                if (this.gazInputRef.selectionStart === this.gazInputRef.selectionEnd) {
                  if (this.gazInputRef.selectionStart === 8) {
                    return;
                  }
                  let valueArr = value.split('');
                  if (e.nativeEvent.inputType === 'deleteContentBackward') {
                    if (valueArr[this.gazInputRef.selectionStart] === '-') {
                      valueArr.splice(this.gazInputRef.selectionStart - 1, 1, '_');
                    } else {
                      valueArr.splice(this.gazInputRef.selectionStart, 1, '_');
                    }
                  } else {
                    const key = e.nativeEvent.data;
                    valueArr.splice(this.gazInputRef.selectionStart - 1, 1, key);
                  }
                  const newValue = valueArr.join('');
                  this.setState({ _value: newValue }, () => {
                    const selectionIndex = newValue.indexOf('_');
                    this.gazInputRef.selectionStart = selectionIndex;
                    this.gazInputRef.selectionEnd = selectionIndex;
                  })
                  this.props.onChangeFunc(newValue);
                }
                // onChangeFunc(e);
              }}
              onBlur={() => {
                if (!value) {
                  this.gazInputRef.setAttribute('hidden', '');
                  this._labelFontSizeClassName = 'font-size-16px';
                  this.forceUpdate();
                }
                if (value.indexOf('_') > -1) {
                  this.setState({
                    isInvalidState: true,
                    isInvalidMessageRendered: true,
                    invalidMessage: 'Некорректное значение',
                  })
                }
                this.setState({ isFocusedState: false })
              }}
              onFocus={() => {
                this.setState({
                  isFocusedState: true,
                  isInvalidState: false,
                  isRequiredMessageRendered: false,
                  isInvalidMessageRendered: false,
                });
              }}
            ></AVFieldOriginal.styles.gazprombankInput>
          </div>
        )
      }
    }
    
    if (fieldItem.dataType === 'number') {
      inputElement = (
        <AVFieldOriginal.styles.input
          className="input-number flex-1"
          autoComplete="off"
          type={fieldItem.dataType}
          value={(value === null || value === undefined) ? '' : value}
          readOnly={readOnly}
          onChange={onChangeFunc}
        ></AVFieldOriginal.styles.input>
      )
      if (fieldItem.variant === 'input+range') {
        inputElement = (
          <div className="">
            <div className="row align-center">
              <AVFieldOriginal.styles.rangeInput
                className="input+range"
                autoComplete="off"
                size="7"
                inputMode="numeric"
                value={(value === null || value === undefined) ? '' : value}
                readOnly={readOnly}
                onChange={onChangeFunc}
              ></AVFieldOriginal.styles.rangeInput>
              <AVIcon name='pencil'></AVIcon>
            </div>
            <div className="_range-slider-free-space pos-rel height-4px bg-slider-free-space cursor-pointer"
              ref={el => this._sliderFreeSpaceRef = el}
              onClick={e => {
                if (e.target.classList.contains('_range-slider-fill-handle')) {
                  return;
                }
                const divLeft = e.target.getBoundingClientRect().left;
                const newFillSpaceWidth = e.pageX - divLeft;
                const sliderFreeSpaceWidth = this._sliderFreeSpaceRef.getBoundingClientRect().width;
                const newValue = Math.round(((this.props.fieldItem.maxValue - this.props.fieldItem.minValue) * (newFillSpaceWidth / sliderFreeSpaceWidth)) + (1 * this.props.fieldItem.minValue));
                this.setState({ _value: newValue });
                this.props.onChangeFunc(newValue);
              }}
            >
              <div className="_range-slider-fill-space height-100prc bg-slider-fill-space border-radius-2px"
                style={{width: this._sliderFillSpaceWidth + 'px'}}
              ></div>
              <div className='_range-slider-fill-handle pos-abs top-minus150prc z-index-10 width-16px height-16px bg-slider-fill-space border-radius-50prc'
                style={{ left: (this._sliderFillSpaceWidth - 5) + 'px' }}
                onMouseDown={this._startHorizontalResize}
              ></div>
            </div>
            <div className="row space-between margin-top-8 font-size-14px">
              <div className='color-gaz-label'>{fieldItem.minLabel}</div>
              <div className='color-gaz-label'>{fieldItem.maxLabel}</div>
            </div>
          </div>
        );
      }
    }
    if (fieldItem.dataType === 'boolean') {
      inputElement = (
        <AVFieldOriginal.styles.input
          className="checkbox flex-1 min-width-28px"
          autoComplete="off"
          type="checkbox"
          checked={value === null ? false : value}
          disabled={readOnly}
          onChange={onChangeFunc}
          onFocus={() => this.setState({
            isInvalidState: false,
            isInvalidMessageRendered: false,
            isRequiredMessageRendered: false,
          })}
        ></AVFieldOriginal.styles.input>
      )
    }
    if (fieldItem.dataType === 'array') {
      const gridItems = value || [];
      let $gridRef;
      const addDeleteColumnItem = {
        name: 'addDelete', // даже не используется
        dataType: 'button', // даже не используется
        widthMode: 'flex-0',
        renderHeaderCellButton: () => (
            <AVButton
                onClick={() => {
                  gridItems.push({});
                  this.setState({_value: [...gridItems]}, () => {
                    this.props.onChangeFunc(this.state._value);
                  })
                }}
                disabled={readOnly}
            >+</AVButton>
        ),
        renderCellButton: (rowItem)  => (
            <AVButton
                onClick={() => {
                  const idxToDelete = gridItems.findIndex(i => i === rowItem);
                  gridItems.splice(idxToDelete, 1);
                  this.setState({_value: [...gridItems]}, () => {
                    this.props.onChangeFunc(this.state._value);
                  })
                }}
                disabled={readOnly}
            >-</AVButton>
        ),
      };
      const columns = [addDeleteColumnItem, ...fieldItem.items];
      inputElement = (
        <div className="flex-1 row align-start">
          <AVGrid
            ref={el => $gridRef = el}
            items={gridItems}
            columns={columns}
            isTypedColumns
            isCellEditable={!readOnly}
            onDataInItemsChangedFunc={this.props.onChangeFunc}
            $objectDocument={this.props.$objectDocument}
            >
          </AVGrid>
        </div>
      )
    }
    if (fieldItem.dataType === 'object' && fieldItem.variant === 'structured-object-field') {
      const innerFields = fieldItem.items || [];
      inputElement = (
        <div className="flex-1 col">
          {innerFields.map(innerFieldItem => (
            <AVField
              key={innerFieldItem.name}
              value={this.state._value?.[innerFieldItem.name]}
              fieldItem={innerFieldItem}
              readOnly={this.props.readOnly}
              onChangeFunc={(value) => onChangeFunc(value, {isInnerField: true, name: innerFieldItem.name})}
              $objectDocument={this.props.$objectDocument}
            ></AVField>
          ))}
        </div>
      )
    }

    if (fieldItem.dataType === 'object' && fieldItem.variant === 'link-on-object-in-class') {
      inputElement = (
        <div className="flex-1 row">
          <AVFieldOriginal.styles.input
            className="flex-1"
            autoComplete="off"
            value={value?.name}
            readOnly
          ></AVFieldOriginal.styles.input>
          <AVButton onClick={() => this.showClass(fieldItem.variantItemReference)} disabled={readOnly}>
            Выбрать
          </AVButton>
        </div>
      )
    }
    if (fieldItem.dataType === 'object' && fieldItem.variant === 'link-on-class-in-domain') {
      inputElement = (
        <div className="flex-1 row">
          <AVFieldOriginal.styles.input
            className="flex-1"
            autoComplete="off"
            value={value?.name}
            readOnly
          ></AVFieldOriginal.styles.input>
          <AVButton onClick={() => this.showItemStructure(fieldItem.variantItemReference)} disabled={readOnly}>
            Выбрать
          </AVButton>
        </div>
      )
    }
    if (fieldItem.dataType === 'image') {
      // let fileInput;
      inputElement = (
        <div className="flex-1 row border">
          <div className="flex-1 row align-center justify-center min-height-200px"
            onClick={async () => {
              const imgUrl = await this.showDialog({ text: 'Введите url картинки', inputLabel: 'url' });
              if (imgUrl) {
                this.setState({ _value: imgUrl })
                this.props.onChangeFunc(imgUrl);
              }
            }}
          >
            {this.state._value ? (
              <img src={this.state._value}></img>
            ) : (
              <div>Загрузить картинку</div>
            )}
            {/* <input
              hidden
              type="file"
              accept="image/*"
              ref={el => fileInput = el}
              onChange={async () => {
                if (fileInput.files.length == 1) {
                  console.log("File selected: ", fileInput.files[0]);
                  // this.setState({_value: fileInput.value})
                  const storagePath = this.Host.storageRoot.child(
                    'classes/' + this.props.$objectDocument.props.objectDocument.Class.id + '/' + this.props.$objectDocument.props.objectDocument.id + '/' + fileInput.files[0].name
                  );
                  await storagePath.put(fileInput.files[0]);
                  // storagePath.put(fileInput.files[0]).on('state_changed',
                  //   () => {},
                  //   (err) => { console.log('ошибка загрузки файла' + fileInput.files[0].name) },
                  //   async () => {
                  //     const url = await storagePath.getDouwnloadURL()
                  //     this.setState({ _value: url });
                  //     this.props.onChangeFunc(url);
                  //   }
                  // )
                }
              }}
            /> */}
          </div>
        </div>
      )
    }


    return inputElement;
  }

  _onChange = (eOrValue, option) => { // типа для нескольких дефолтных инпутов, для остального копируешь 2 нижних строки для очевидности
    // eOrValue.persist();
    // console.log('onChange e', eOrValue);
    let value;
    if (option) {
      if (option.isInnerField) { //для structured-object-field
        value = this.state._value;
        if (!value) {
          value = {};
        }
        value[option.name] = eOrValue;
      }
    } else {
      value = eOrValue.target.value;
      if (eOrValue.target.type === 'checkbox') {
        value = eOrValue.target.checked;
      }
    }
    this.setState({_value: value})
    this.props.onChangeFunc(value, eOrValue)
  }

  showClass = (id) => {
    this.props.$objectDocument.showClass(id, (objDocItem) => {
      this.setState({_value: objDocItem.data})
      this.props.onChangeFunc(objDocItem.data);
    });
  }

  showItemStructure = (name) => {
    this.props.$objectDocument.showItemStructure(name, (Item) => {
      this.setState({_value: Item})
      this.props.onChangeFunc(Item);
    });
  }
  
  _calcLabelPosition = () => {
    if (this.props.fieldItem.variant === 'input+range' ||
      this.props.fieldItem.variant === 'Gazprombank-string' ||
      this.props.fieldItem.variant === 'Gazprombank-tel' ||
      this.props.fieldItem.variant === 'binary-buttons' ||
      this.props.fieldItem.variant === 'radio-buttons'
    ) {
      return 'top'
    }
    return (this.props.fieldItem.labelPosition || this.props.labelPosition)
  }
  
  _calcIsLabelHidden = () => {
    if (this.props.fieldItem.variant && this.props.fieldItem.variant.includes('Gazprombank')) {
      return true
    }
    return this.props.isLabelHidden
  }
  
  _startHorizontalResize = (msDownEvent) => { // для input+ranger slider resize
    msDownEvent.preventDefault();
    const startResizePageX = msDownEvent.pageX;
    const _sliderFillSpaceWidth = this._sliderFillSpaceWidth // запомнить стартовый перед маусмув
    const sliderFreeSpaceWidth = this._sliderFreeSpaceRef.getBoundingClientRect().width;
    window.document.onmouseup = upEv => {
      upEv.preventDefault();
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    }
    
    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      const pageXDiff = moveEv.pageX - startResizePageX;
      let startPlusDiffWidth = _sliderFillSpaceWidth + pageXDiff;
      if (startPlusDiffWidth < 0.5) {
        startPlusDiffWidth = 0
      }
      if (startPlusDiffWidth >= sliderFreeSpaceWidth) {
        startPlusDiffWidth = sliderFreeSpaceWidth;
      }
      if ((startPlusDiffWidth >= 0) && (startPlusDiffWidth <= sliderFreeSpaceWidth)) {
        this._sliderFillSpaceWidth = startPlusDiffWidth;
        const newValue = Math.round(((this.props.fieldItem.maxValue - this.props.fieldItem.minValue) * (this._sliderFillSpaceWidth / sliderFreeSpaceWidth)) + (1 * this.props.fieldItem.minValue));
        this.setState({ _value: newValue });
        this.props.onChangeFunc(newValue);
        // this.forceUpdate()
      }
    }

  }
}
