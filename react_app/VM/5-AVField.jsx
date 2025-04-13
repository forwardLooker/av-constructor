import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVLabel} from "../V/AVLabel.jsx";
import {AVButton} from "../V/AVButton.jsx";
import {AVGrid} from "../V/AVGrid.jsx";

export class AVField extends AVItem {
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
      font-size: 20px;
      line-height: 20px;
      background-color: #fff;
      transition: all .2s;
      border: none;
      border-radius: 6px;
      outline: none;
      vertical-align: middle;
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
    _value: ((this.props.value === null || this.props.value === undefined) && this.props.fieldItem?.defaultValue) || this.props.value
  }
  
  _computedValueNotified;
  
  _labelFontSizeClassName = 'font-size-16px'; //for variant Gazprombank-string
  
  _sliderFreeSpaceRef;
  _sliderFillSpaceWidth = 0;

  
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
      <div className={`_av-field-root flex-1 ${this._calcLabelPosition() === 'top'? 'column' : 'row'} align-center`}
         style={this.props.style}
         ref={this.props.refOnRootDiv}
      >
        {!this._calcIsLabelHidden() && (
          <AVLabel
            className={`pad-0-4-0-0`}
            justifyMode={this.props.fieldItem.variant === 'input+range' ? 'start' : 'center'}
          >{this.props.fieldItem.label || this.props.fieldItem.name}</AVLabel>
        )}
        {this._renderInput(
          {
            _value: this.state._value,
            readOnly: this.props.readOnly || this.props.fieldItem.isReadOnly || this.props.fieldItem.isComputed,
            onChangeFunc: this._onChange,
            fieldItem: this.props.fieldItem,
          }
        )}
        {this.props.children}
      </div>
    )
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
        <AVField.styles.input
          className="flex-1"
          autoComplete="off"
          value={(value === null || value === undefined) ? '' : value}
          readOnly={readOnly}
          onChange={onChangeFunc}
        ></AVField.styles.input>
      );
      if (fieldItem.variant === 'textarea') {
        inputElement = (
          <AVField.styles.textarea
            className="flex-1"
            autoComplete="off"
            rows={16}
            value={(value === null || value === undefined) ? '' : value}
            readOnly={readOnly}
            onChange={onChangeFunc}
          ></AVField.styles.textarea>
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
          <AVField.styles.select
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
          </AVField.styles.select>
        )
      }
      if (fieldItem.variant === 'date') {
        inputElement = (
            <AVField.styles.input
                className="flex-1"
                autoComplete="off"
                type="date"
                value={(value === null || value === undefined) ? '' : value}
                readOnly={readOnly}
                onChange={onChangeFunc}
            ></AVField.styles.input>
        )
      }
      if (fieldItem.variant === 'Gazprombank-string') {
        let gazInputRef;
        inputElement = (
          <div className='_inputElement flex-1 col justify-center height-56px border cursor-text'
            onClick={() => {
              gazInputRef.removeAttribute('hidden');
              gazInputRef.focus();
              this._labelFontSizeClassName = 'font-size-14px';
              this.forceUpdate()
            }}
          >
            <AVLabel className={`margin-left-16 ${this._labelFontSizeClassName} font-weight-400 color-gaz-label transition-ease cursor-text`} justifyMode="start">{fieldItem.label}</AVLabel>
            <AVField.styles.gazprombankInput
              className="flex-1 margin-left-16"
              ref={el => gazInputRef = el}
              hidden
              autoComplete="off"
              value={(value === null || value === undefined) ? '' : value}
              readOnly={readOnly}
              onChange={onChangeFunc}
              onBlur={() => {
                gazInputRef.setAttribute('hidden', '');
                this._labelFontSizeClassName = 'font-size-16px';
                this.forceUpdate();
              }}
            ></AVField.styles.gazprombankInput>
          </div>
        )
      }
    }
    if (fieldItem.dataType === 'number') {
      inputElement = (
        <AVField.styles.input
          className="input-number flex-1"
          autoComplete="off"
          type={fieldItem.dataType}
          value={(value === null || value === undefined) ? '' : value}
          readOnly={readOnly}
          onChange={onChangeFunc}
        ></AVField.styles.input>
      )
      if (fieldItem.variant === 'input+range') {
        inputElement = (
          <div className="">
            <div className="row align-center">
              <AVField.styles.rangeInput
                className="input+range"
                autoComplete="off"
                size="7"
                inputMode="numeric"
                value={(value === null || value === undefined) ? '' : value}
                readOnly={readOnly}
                onChange={onChangeFunc}
              ></AVField.styles.rangeInput>
              <div className="inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" class="progressive_icon progressive_icon12">
                    <path fillRule="evenodd" clipRule="evenodd" d="m2.223 10.679-.138.138a.625.625 0 0 1-.884-.884l.138-.138.47-2.155c.083-.382.165-.746.394-1.07.099-.14.222-.264.47-.511l4.104-4.105c.378-.378.566-.566.762-.68a1.75 1.75 0 0 1 1.763 0c.196.114.385.302.762.68.377.377.566.566.68.761a1.75 1.75 0 0 1 0 1.763c-.114.196-.303.385-.68.762L5.959 9.345c-.247.247-.37.37-.51.47-.325.228-.69.31-1.072.394l-2.154.47Zm1.333-3.736L6.94 3.559 8.46 5.077 5.075 8.461c-.119.119-.233.256-.376.35-.172.112-.392.134-.588.177l-1.383.301.302-1.383c.043-.2.065-.421.182-.595.093-.14.228-.252.344-.368Zm5.613-2.57c.14-.14.278-.28.411-.425a.496.496 0 0 0 .152-.348.496.496 0 0 0-.152-.354 14.43 14.43 0 0 0-.4-.408 14.444 14.444 0 0 0-.408-.4.546.546 0 0 0-.369-.152.478.478 0 0 0-.333.152 30 30 0 0 0-.422.414l.002.002L9.17 4.372Z" fill="#1C1C1E"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="progressive_icon progressive_icon16">
                    <path fillRule="evenodd" clipRule="evenodd" d="m3.21 13.88.157-.156 2.84-.62c.342-.074.513-.11.672-.175.14-.058.275-.131.4-.219.14-.099.263-.222.51-.47L12.93 7.1c.545-.545.818-.818.964-1.112a2 2 0 0 0 0-1.776c-.146-.294-.419-.567-.964-1.112-.545-.545-.818-.818-1.112-.964a2 2 0 0 0-1.776 0c-.294.146-.567.419-1.112.964L3.79 8.24c-.248.248-.371.371-.47.511a2 2 0 0 0-.219.4c-.064.16-.101.33-.176.671l-.619 2.841-.156.157a.75.75 0 0 0 1.06 1.06Zm6-9.292L4.673 9.125c-.276.276-.309.314-.331.347a.75.75 0 0 0-.082.15c-.015.037-.03.084-.113.466l-.5 2.296 2.295-.5c.382-.084.43-.099.466-.114a.751.751 0 0 0 .15-.082c.033-.022.071-.055.347-.331l4.538-4.537L9.21 4.588Zm.707-.707 2.232 2.232c.523-.525.595-.62.625-.68a.75.75 0 0 0 0-.666c-.032-.064-.111-.166-.728-.783-.616-.617-.719-.696-.783-.728a.75.75 0 0 0-.666 0c-.06.03-.155.102-.68.625Z" fill="#1C1C1E"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="progressive_icon progressive_icon20">
                    <path fillRule="evenodd" clipRule="evenodd" d="M7.525 15.752a3 3 0 0 0 1.572-.828l7.082-7.083a2.25 2.25 0 0 0 0-3.182l-.818-.818a2.25 2.25 0 0 0-3.182 0L5.091 10.93a3 3 0 0 0-.825 1.556l-.52 2.707-.276.277a.75.75 0 1 0 1.06 1.06l.272-.271 2.723-.507Zm5.715-10.85-.566.565 1.879 1.88.566-.567a.75.75 0 0 0 0-1.06l-.818-.818a.75.75 0 0 0-1.061 0ZM6.151 11.99l5.816-5.816 1.879 1.88-5.81 5.809a1.5 1.5 0 0 1-.786.414l-1.867.348.356-1.856a1.5 1.5 0 0 1 .412-.779Z" fill="#1C1C1E"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="progressive_icon progressive_icon24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4.818 14.558c.142-.274.283-.545.48-.785.094-.115.2-.222.413-.434l9.924-9.924c.658-.659.987-.988 1.34-1.167a2.5 2.5 0 0 1 2.27 0c.353.18.682.508 1.34 1.167.658.658.987.987 1.167 1.34a2.5 2.5 0 0 1 0 2.27c-.18.352-.509.681-1.167 1.34l-9.924 9.923c-.213.213-.319.32-.435.414-.24.196-.51.337-.785.48l-2.66 1.38c-.404.21-.607.315-.815.33a1.002 1.002 0 0 1-.433-.067c-.16-.063-.297-.184-.521-.404-.212.198-.42.425-.677.565-.106.057-.22.101-.336.131-.188.049-.387.048-.785.047l-.548-.002c-.487-.002-.73-.003-.834-.11a.35.35 0 0 1-.097-.24c0-.149.174-.319.522-.659l1.26-1.229c-.182-.187-.285-.313-.342-.457a1 1 0 0 1-.067-.434c.014-.208.12-.41.33-.815l1.38-2.66ZM16.617 4.554l.079-.079c.74-.74.872-.846.96-.89a1 1 0 0 1 .908 0c.088.044.22.15.96.89s.847.873.891.96a1 1 0 0 1 0 .908c-.044.088-.15.22-.89.96l-.08.08-2.828-2.829Zm-.67.67L6.772 14.4c-.187.187-.363.359-.488.593l2.723 2.724c.235-.126.406-.301.593-.488l9.175-9.175-2.828-2.829ZM5.825 15.874l2.3 2.3-2.132 1.107-1.275-1.275 1.107-2.132Z" fill="#1C1C1E"></path>
                  </svg>
                </svg>
              </div>
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
              <div>{fieldItem.minLabel}</div>
              <div>{fieldItem.maxLabel}</div>
            </div>
          </div>
        );
      }
    }
    if (fieldItem.dataType === 'boolean') {
      inputElement = (
        <AVField.styles.input
          className="checkbox flex-1"
          autoComplete="off"
          type="checkbox"
          checked={value === null ? false : value}
          disabled={readOnly}
          onChange={onChangeFunc}
        ></AVField.styles.input>
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
          <AVField.styles.input
            className="flex-1"
            autoComplete="off"
            value={value?.name}
            readOnly
          ></AVField.styles.input>
          <AVButton onClick={() => this.showClass(fieldItem.variantItemReference)} disabled={readOnly}>
            Выбрать
          </AVButton>
        </div>
      )
    }
    if (fieldItem.dataType === 'object' && fieldItem.variant === 'link-on-class-in-domain') {
      inputElement = (
        <div className="flex-1 row">
          <AVField.styles.input
            className="flex-1"
            autoComplete="off"
            value={value?.name}
            readOnly
          ></AVField.styles.input>
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

  _onChange = (eOrValue, option) => {
    // e.persist();
    // console.log('onChange e', e);
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
    if (this.props.fieldItem.variant === 'input+range') {
      return 'top'
    }
    return this.props.labelPosition
  }
  
  _calcIsLabelHidden = () => {
    if (this.props.fieldItem.variant === 'Gazprombank-string') {
      return true
    }
    return this.props.isLabelHidden
  }
  
  _startHorizontalResize = (msDownEvent) => {
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
      const startPlusDiffWidth = _sliderFillSpaceWidth + pageXDiff
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
