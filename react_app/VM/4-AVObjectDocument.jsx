import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClass} from './3-AVClass.jsx';
import {AVField} from './5-AVField.jsx';

import {AVButton} from "../V/AVButton.jsx";
import {AVIcon} from '../V/icons/AVIcon.jsx';

import { JSONTree } from 'react-json-tree';

export class AVObjectDocument extends AVItem {
  static defaultProps = {
    fieldDescriptors: [],
    objectDocument: null,
    objectDocumentPath: '', // применяется вместо выше представленных полей за счёт дидимаунта, для организации роута на объект на весь экран
    onSavedFunc: this.noop,
    onCloseFunc: this.noop,

    noOkCancelPanel: false,
  }
  // componentDidMount() {
  //   this.setState({
  //     _newData: this.deepClone(this.props.objectDocument.data),
  //     _newDataBeforeUpdate: this.deepClone(this.props.objectDocument.data),
  //   })
  // }

  state = {
    _newData: this.deepClone(this.props.objectDocument && this.props.objectDocument.data),
    _newDataBeforeUpdate: this.deepClone(this.props.objectDocument && this.props.objectDocument.data),
    _objectDocument: this.props.objectDocument,
    _fieldDescriptors: this.props.fieldDescriptors,

    isJSONshowed: false,

    designMode: false,
    designJson: null,
    designDragStarted: false,
    designDragElementIndex: null,
    designDragElement: null,
    designDragContainer: null,
    designDragElementOrigin: '', // enum ['instrument panel', 'objectDocument']
    designDropSide: 'none', // enum: ['top', 'bottom', 'left', 'right', 'none']
    designDropTargetLevel2: null, // horizontal or vertical

    isClassItemOpened: false,
    openedClassItem: null,
    onObjectDocumentSelectedInOpenedClassItem: this.noop,
    
    presentationGroupsHidden: [],
  }

  constructor(props) {
    super(props);

    this._prepareDesignJson();
  }

  //render
  
  async componentDidMount() {
    if (this.props.objectDocumentPath) {
      const objectDocument = this.Host.getObjectDocumentByPath(this.props.objectDocumentPath);
      await objectDocument.getData();
      const classItem = this.Host.getClass(objectDocument.data.classReference);
      const fieldDescriptors = await classItem.getFieldDescriptors();
      objectDocument.Class = classItem;

      this.setState({
        _newData: this.deepClone(objectDocument.data),
        _newDataBeforeUpdate: this.deepClone(objectDocument.data),
        _objectDocument: objectDocument,
        _fieldDescriptors: fieldDescriptors
      }, () => {
        this._prepareDesignJson();
        this.forceUpdate();
        this._makeDidMountByModule();
      })
    } else {
      this._makeDidMountByModule()
    }

    // this.setState({
    //   _newData: this.deepClone(this.props.objectDocument.data),
    //   _newDataBeforeUpdate: this.deepClone(this.props.objectDocument.data),
    // })
  }

  async componentDidUpdate(prevProps) {
    if (this.props.objectDocumentPath !== prevProps.objectDocumentPath) {
      const objectDocument = this.Host.getObjectDocumentByPath(this.props.objectDocumentPath);
      await objectDocument.getData();
      const classItem = this.Host.getClass(objectDocument.data.classReference);
      const fieldDescriptors = await classItem.getFieldDescriptors();
      objectDocument.Class = classItem;

      this.state._newData = this.deepClone(objectDocument.data),
      this.state._newDataBeforeUpdate = this.deepClone(objectDocument.data),
      this.state._objectDocument = objectDocument,
      this.state._fieldDescriptors = fieldDescriptors
      
      this._prepareDesignJson();
      this.state.presentationGroupsHidden = []; // бывает переносим копированием страницы и что-то исчезает
      window.scrollTo({ top: 0 });

      this.forceUpdate(() => this._makeDidMountByModule());
    } else {
      // this._makeDidMountByModule()
    }
  }

  _makeDidMountByModule = () => {
    // вызывается в модуле конкретного класса
    const classInstance = this.state._objectDocument.Class;
    const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
    if (moduleDefinition) {
      const methodOnComponentDidMount = moduleDefinition.onComponentDidMount;
      if (methodOnComponentDidMount) {
        methodOnComponentDidMount(this)
      }
    }
  }

  _prepareDesignJson = () => {
    if (this.state._objectDocument) {
      if (this.state._objectDocument.designJson) {
        const designJson = this.deepClone(this.state._objectDocument.designJson);
        const fieldDescriptors = this.deepClone(this.state._fieldDescriptors);

        // upgrade metadata
        fieldDescriptors.forEach(fD => {
          const fieldInOrigItems = designJson.originalItems.find(origItem => origItem.name === fD.name);
          if (fieldInOrigItems) {
            if (!this.isDeepEqual(fD, fieldInOrigItems)) {
              const fieldInDesign = this.findDeepObjInItemsBy({name: fD.name}, designJson);
              if (fieldInDesign) {
                Object.keys(fD).forEach(prop => {
                  fieldInDesign[prop] = fD[prop];
                  fieldInOrigItems[prop] = fD[prop];
                });
              }
            }
          }
        })
        // find added and deleted
        const addedItems = this._findNewFieldDescriptors(fieldDescriptors, designJson.originalItems);
        const deletedItems = this._findDeletedFieldDescriptors(fieldDescriptors, designJson.originalItems);
        // add
        designJson.items = designJson.items.concat(addedItems);
        designJson.originalItems = designJson.originalItems.concat(addedItems);
        // delete
        this._addContainerReference(designJson);
        this._removeDeletedItems(designJson, deletedItems); // in designJson.items
        deletedItems.forEach(delItem => { // in designJson.originalItems
          const forDelIndexInOrigItems = designJson.originalItems.findIndex(origItem => origItem.name === delItem.name);
          designJson.originalItems.splice(forDelIndexInOrigItems, 1);
        })
        this.state.designJson = designJson;
      } else {
        this.state.designJson = {
          viewItemType: 'vertical-layout',
          items: this.deepClone(this.state._fieldDescriptors),
          originalItems: this.deepClone(this.state._fieldDescriptors)
        };
      }
    }
  }

  render() {
    if (!this.state.designJson) {
      return null
    }
    return (
      <div className={`_av-object-document-root flex-1 col ${this.state.designMode ?  'bg-white' : 'bg-app-back'}`}>
        <div className="flex-1 col space-between line-height-1-5">
          {this.state.isJSONshowed ? (
            <JSONTree data={this.state._newData}/>
          ) : (
            <div>
                <this.VerticalLayout
                  vrtLayoutItem={this.state.designJson}
                  _newData={this.state._newData}
                  $objDoc={this}
                  designMode={this.state.designMode}
                ></this.VerticalLayout>
            </div>
          )}
          <div className={`${this.props.noOkCancelPanel ? 'no-display' : 'row'} justify-end`}>
            <div className="row align-center justify-center">
              {this._renderButtonsByServices()}
              <AVButton onClick={this.saveAndClose}>OK</AVButton>
              <AVButton onClick={this.closeWithoutSave}>Отмена</AVButton>
              <div className="row align-center pad-0-2">
                {this.isDeepEqual(this.state._newData, this.state._newDataBeforeUpdate) ? (
                  <AVIcon name="saveDisabled"></AVIcon>
                ) : (
                  <AVIcon name="saveActive" onClick={this.save}></AVIcon>
                )}
              </div>
              <AVButton onClick={this.toggleDesign}>Дизайнер</AVButton>
              <AVButton onClick={this.toggleToJSON}>JSON</AVButton>
            </div>
          </div>
        </div>
        {this.state.isClassItemOpened && (
          <div className="pos-fixed rb-0-top-10prc-left-20prc z-index-100 bg-app-back">
            <AVClass
              classItem={this.state.openedClassItem}
              onObjectDocumentSelectedFunc={this.state.onObjectDocumentSelectedInOpenedClassItem}
            ></AVClass>
          </div>
        )}
      </div>
    )
  }
  
  VerticalLayout = class VerticalLayout extends React.Component {
    static defaultProps = {
      vrtLayoutItem: null,
      vrtLayoutItemIndex: null,
      _newData: null,
      $objDoc: null,
      designMode: false,
    }
    
    componentDidMount() {
      this.props.vrtLayoutItem.VerticalLayout = this;
    }
    
    shouldComponentUpdate() {
      return true;
    }
    
    render() {
      let vrtLayoutItem = this.props.vrtLayoutItem;
      let vrtLayoutItemIndex = this.props.vrtLayoutItemIndex;
      let _newData = this.props._newData;
      let $objDoc = this.props.$objDoc;
      let designMode = this.props.designMode;
      
      if ($objDoc.state.presentationGroupsHidden.includes(vrtLayoutItem.presentationGroup)) {
        return null
      }
      return (
        <div
          className="vertical-layout flex-1 col"
          style={vrtLayoutItem.style}
          ref={vrtDomElement => vrtLayoutItem.domElement = vrtDomElement}
          key={vrtLayoutItemIndex || 0}
        >
          {vrtLayoutItem.items.map((vrtItem, vrtIndex) => {
            if (vrtItem.viewItemType === 'horizontal-layout') {
              if ($objDoc.state.presentationGroupsHidden.includes(vrtItem.presentationGroup)) {
                return null
              }
              return (
                <div
                  className="horizontal-layout flex-1 row"
                  style={vrtItem.style}
                  key={vrtIndex}
                  ref={hrzDomElement => vrtItem.domElement = hrzDomElement}
                >
                  {vrtItem.items.map((hrzItem, hrzIndex) => {
                    if (hrzItem.viewItemType === 'vertical-layout') {
                      return (<$objDoc.VerticalLayout
                        vrtLayoutItem={hrzItem}
                        vrtLayoutItemIndex={hrzIndex}
                        _newData={_newData}
                        $objDoc={$objDoc}
                        designMode={designMode}
                      ></$objDoc.VerticalLayout>);
                    } else {
                      return (<$objDoc.FieldWrapper
                        fieldItem={hrzItem}
                        idx={hrzIndex}
                        containerElement={vrtItem}
                        $objDoc={$objDoc}
                        designMode={designMode}
                        _newData={_newData}
                      ></$objDoc.FieldWrapper>)
                    }
                  })}
                </div>
              )
            }
            if (vrtItem.viewItemType === 'field' || !vrtItem.viewItemType ||
              (vrtItem.viewItemType !== 'vertical-layout' && vrtItem.viewItemType !== 'horizontal-layout')
            ) {
              return (<$objDoc.FieldWrapper
                fieldItem={vrtItem}
                idx={vrtIndex}
                containerElement={vrtLayoutItem}
                $objDoc={$objDoc}
                designMode={designMode}
                _newData={_newData}
              ></$objDoc.FieldWrapper>)
            }
          })}
        </div>
      )
    }
  }
  
  _renderVerticalLayout(vrtLayoutItem, vrtLayoutItemIndex) {
    return (<this.VerticalLayout
      vrtLayoutItem={vrtLayoutItem}
      vrtLayoutItemIndex={vrtLayoutItemIndex}
      _newData={this.state._newData}
      $objDoc={this}
      designMode={this.state.designMode}
    ></this.VerticalLayout>)
  }
  
  FieldWrapper = class FieldWrapper extends AVItem {
    static defaultProps = {
      fieldItem: null,
      idx: null,
      containerElement: null,
      $objDoc: null,
      designMode: false,
      _newData: null,
    }
    
    render() {
      let fieldItem = this.props.fieldItem;
      let idx = this.props.idx;
      let containerElement = this.props.containerElement;
      let $objDoc = this.props.$objDoc;
      let designMode = this.props.designMode;

      if ($objDoc.state.presentationGroupsHidden.includes(fieldItem.presentationGroup)) {
        return null
      }
      if (fieldItem.isHiddenInObjectDocument) {
        return null
      }
      if (fieldItem.viewItemType === 'items-container') {
        return (
          <div className='_av-field-wrapper pos-rel col flex-1 margin-top-2'
            style={fieldItem.style}
            key={fieldItem.name || fieldItem.label || idx}
            ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
          >
            <img className='pos-abs trbl-0' src={fieldItem.imgSrc}></img>
            <div className='_av-field-viewItem-root flex-1 pad-8'>
              {fieldItem.items && $objDoc._renderVerticalLayout(fieldItem.items[0])}
            </div>
            {designMode && $objDoc._renderDesignFieldOverlay(fieldItem, idx, containerElement, this)}
          </div>
        )
      }
      if (fieldItem.viewItemType === 'tabs') {
        if (!fieldItem.items) {
          fieldItem.items = [
            {
              viewItemType: 'tab',
              label: 'tab 1',
              items: [{
                viewItemType: 'vertical-layout',
                items: [{
                  viewItemType: 'space div'
                }]
              }]
            }
          ]
        }
        if (!fieldItem.selectedTabLabel) {
          fieldItem.selectedTabLabel = fieldItem.items[0].label;
        }
        return (
          <div className='_av-field-wrapper pos-rel col flex-1 margin-top-2'
            style={fieldItem.style}
            key={fieldItem.name || fieldItem.label || idx}
            ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
          >
            <div className='_av-field-viewItem-root flex-1 pad-8'>
              <div className='_tab-head row'>
                {fieldItem.items.map(tab => (
                  <div
                    className={['_tab-head-item', 'pad-0-4',
                      (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'border-2' : 'border',
                      (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'font-bold' : ''
                    ].join(' ')}
                    key={tab.label}
                    onClick={() => {
                      if (tab.redirectToUrl) {
                        window.open(tab.redirectToUrl);
                        // window.open(tab.redirectToUrl , '_blank');
                      } else {
                        fieldItem.selectedTabLabel = tab.label;
                        this.forceUpdate();
                      }
                    }}
                    onContextMenu={e => $objDoc._onTabContextMenu(e, tab, fieldItem, idx, containerElement)}
                  >{tab.label || 'tab1'}</div>
                ))}
                <div className='flex-1'></div>
              </div>
              {this.notEmpty(fieldItem.items.filter(tab => (fieldItem.selectedTabLabel === tab.label) && tab.redirectToUrl)) ? null : (
                <div className='_tabs-body-container pad-8 border'>
                  {fieldItem.items.map(tab => (
                    <div className="_tab-body" key={tab.label} hidden={fieldItem.selectedTabLabel !== tab.label}>
                      {$objDoc._renderVerticalLayout(tab.items[0])}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(designMode && fieldItem.fullOverlayMode) && $objDoc._renderDesignFieldOverlay(fieldItem, idx, containerElement, this)}
          </div>
        )
      }

      return (
        <div
          className={`_av-field-wrapper pos-rel col flex-1 ${fieldItem.withoutPaddingAndMargin ? '' : 'margin-top-2'}`}
          style={fieldItem.style}
          key={fieldItem.name || idx}
        >
          <AVField
            refOnRootDiv={fieldDomElement => fieldItem.domElement = fieldDomElement}
            ref={fieldRef => $objDoc[`fieldRef_${fieldItem.name}`] = fieldRef}
            fieldItem={fieldItem}
            containerItem={containerElement}
            value={$objDoc.state._newData[fieldItem.name]}
            readOnly={$objDoc.state._newData.readOnly}
            onChangeFunc={value => {
              $objDoc.state._newData[fieldItem.name] = value;
              const classInstance = $objDoc.state._objectDocument.Class;
              const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
              if (moduleDefinition) {
                const methodOnNewDataChange = moduleDefinition.on_newDataChange;
                if (methodOnNewDataChange) {
                  methodOnNewDataChange({ $objectDocument: $objDoc, fieldItemName: fieldItem.name, value })
                }
              }
              $objDoc._forceUpdateDebounced1Sec() // для подсветки кнопки сохранить
            }}
            labelPosition={fieldItem.dataType === 'array' ? 'top' : 'left'}
            $objectDocument={$objDoc}
          >
            {designMode && ($objDoc._renderDesignFieldOverlay(fieldItem, idx, containerElement, this))}
          </AVField>
        </div>
      )
    }
  }
  
  // _renderField(fieldItem, idx, containerElement) {
  //   if (this.state.presentationGroupsHidden.includes(fieldItem.presentationGroup)) {
  //     return null
  //   }
  //   if (fieldItem.isHiddenInObjectDocument) {
  //     return null
  //   }
  //   if (fieldItem.viewItemType === 'items-container') {
  //     return (
  //       <div className='_av-field-wrapper pos-rel col flex-1 margin-top-2'
  //         style={fieldItem.style}
  //         key={fieldItem.name || fieldItem.label || idx}
  //         ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
  //       >
  //         <img className='pos-abs trbl-0' src={fieldItem.imgSrc}></img>
  //         <div className='_av-field-viewItem-root flex-1 pad-8'>
  //           {fieldItem.items && this._renderVerticalLayout(fieldItem.items[0])}
  //         </div>
  //         {(this.state.designMode) && this._renderDesignFieldOverlay(fieldItem, idx, containerElement)}
  //       </div>
  //     )
  //   }
  //   if (fieldItem.viewItemType === 'tabs') {
  //     if (!fieldItem.items) {
  //       fieldItem.items = [
  //         {
  //           viewItemType: 'tab',
  //           label: 'tab 1',
  //           items: [{
  //             viewItemType: 'vertical-layout',
  //             items: [{
  //               viewItemType: 'space div'
  //             }]
  //           }]
  //         }
  //       ]
  //     }
  //     if (!fieldItem.selectedTabLabel) {
  //       fieldItem.selectedTabLabel = fieldItem.items[0].label;
  //     }
  //     return (
  //       <div className='_av-field-wrapper pos-rel col flex-1 margin-top-2'
  //              style={fieldItem.style}
  //              key={fieldItem.name || fieldItem.label || idx}
  //              ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
  //         >
  //         <div className='_av-field-viewItem-root flex-1 pad-8'>
  //             <div className='_tab-head row'>
  //               {fieldItem.items.map(tab => (
  //                   <div
  //                        className={['_tab-head-item', 'pad-0-4',
  //                          (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'border-2' : 'border',
  //                          (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'font-bold' : ''
  //                        ].join(' ')}
  //                        key={tab.label}
  //                        onClick={() => {
  //                          if (tab.redirectToUrl) {
  //                            window.open(tab.redirectToUrl);
  //                            // window.open(tab.redirectToUrl , '_blank');
  //                          } else {
  //                            fieldItem.selectedTabLabel = tab.label;
  //                            this.forceUpdate();
  //                          }
  //                        }}
  //                        onContextMenu={e => this._onTabContextMenu(e, tab, fieldItem, idx, containerElement)}
  //                   >{tab.label || 'tab1'}</div>
  //               ))}
  //               <div className='flex-1'></div>
  //             </div>
  //             {this.notEmpty(fieldItem.items.filter(tab => (fieldItem.selectedTabLabel === tab.label) && tab.redirectToUrl) ) ? null : (
  //               <div className='_tabs-body-container pad-8 border'>
  //                 {fieldItem.items.map(tab => (
  //                   <div className="_tab-body" key={tab.label} hidden={fieldItem.selectedTabLabel !== tab.label}>
  //                     {this._renderVerticalLayout(tab.items[0])}
  //                   </div>
  //                 ))}
  //               </div>
  //             )}
  //           </div>
  //           {(this.state.designMode && fieldItem.fullOverlayMode) && this._renderDesignFieldOverlay(fieldItem, idx, containerElement)}
  //         </div>
  //     )
  //   }

  //   return (
  //     <div
  //       className={`_av-field-wrapper pos-rel col flex-1 ${fieldItem.withoutPaddingAndMargin ? '' : 'margin-top-2'}`}
  //       style={fieldItem.style}
  //       key={fieldItem.name || idx}
  //     >
  //       <AVField
  //         refOnRootDiv={fieldDomElement => fieldItem.domElement = fieldDomElement}
  //         ref={fieldRef => this[`fieldRef_${fieldItem.name}`] = fieldRef}
  //         fieldItem={fieldItem}
  //         containerItem={containerElement}
  //         value={this.state._newData[fieldItem.name]}
  //         readOnly={this.state._newData.readOnly}
  //         onChangeFunc={value => {
  //           this.state._newData[fieldItem.name] = value;
  //           const classInstance = this.state._objectDocument.Class;
  //           const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
  //           if (moduleDefinition) {
  //             const methodOnNewDataChange = moduleDefinition.on_newDataChange;
  //             if (methodOnNewDataChange) {
  //               methodOnNewDataChange({ $objectDocument: this, fieldItemName: fieldItem.name, value })
  //             }
  //           }
  //           this._forceUpdateDebounced1Sec() // для подсветки кнопки сохранить
  //         }}
  //         labelPosition={fieldItem.dataType === 'array' ? 'top' : 'left'}
  //         $objectDocument={this}
  //       >
  //         {this.state.designMode && (this._renderDesignFieldOverlay(fieldItem, idx, containerElement))}
  //       </AVField>
  //     </div>
  //   )
  // }

  _renderDesignFieldOverlay(fieldItem, idx, containerElement, FieldWrapper) {
    return (
      <div className="field-overlay pos-abs trbl-0 row border-1 bg-transparent-25">
        <div className="flex-1 col">
          <div className="flex-1 row">
            <div className={`flex-1 ${fieldItem.viewItemType === 'items-container' ? 'z-index-9900' : 'z-index-10000' } `}
                 draggable
                 onDragStart={(e) => this.dragstart(
                   e,
                   {
                     designDragStarted: true,
                     designDragElement: fieldItem,
                     designDragElementIndex: idx,
                     designDragContainer: containerElement,
                     designDragElementOrigin: 'objectDocument'
                   },
                 )}
                 onDragOver={e => this._dragover(e, fieldItem, idx, containerElement)}
                 onDragLeave={e => this._dragleave(e, fieldItem, idx, containerElement)}
                 onDrop={(e) => this._drop(e, fieldItem, idx, containerElement)}
                 onDragEnd={e => this.setState({designDragStarted: false})}
                 onContextMenu={(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}
            ></div>
            <div className="_horizontal-resizer height-100prc width-4px cursor-col-resize"
              hidden={this.state.designDragStarted}
              onMouseDown={(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement, FieldWrapper)}
            ></div>
          </div>
          <div className="_vertical-resizer width-100prc height-2px cursor-row-resize"
            hidden={this.state.designDragStarted}
            onMouseDown={(e) => this._startVerticalResize(e, fieldItem, idx, containerElement, FieldWrapper)}
          ></div>
        </div>
      </div>
    )
  }

  _renderButtonsByServices() {
    const connectedServices = this.state._objectDocument.Class.metadata.connectedServices;
    const srvDefs = this.state._objectDocument.Class.classServiceDefinitions;
    let ButtonsAddedByServices = [];
    if (Array.isArray(connectedServices)) {
      connectedServices.forEach(srv => {
        const foundedService = srvDefs.find(srvDef => srvDef.name === srv.name);
        foundedService.methods.forEach(m => {
          if (m.target === 'objectDocument' && m.location === 'ok-cancel panel' && (!m.condition || m.condition(this))) {
            ButtonsAddedByServices.push((
              <AVButton key={m.name} onClick={()=> m.method(this)}>{m.name}</AVButton>
            ))
          }
        })
      })
    }
    return ButtonsAddedByServices;
  }

  showClass = async (id, onObjectDocumentSelected) => { // используется в Филде для линков на объекты
    const openedClassItem = await this.Host.getClassById(id);
    this.setState({
      isClassItemOpened: true,
      openedClassItem,
      onObjectDocumentSelectedInOpenedClassItem: (objDocItem) => {
        this.setState({isClassItemOpened: false})
        onObjectDocumentSelected(objDocItem);
      }
    })
  }
  // у Классов нет структуры, подразумевается Домен, возможно надо переименовать
  showItemStructure = async (name, onItemSelected) => { // используется в Филде для линков на Классы
    const itemInConfigTree = this.findDeepObjInItemsBy({name: name, itemType: 'domain'}, {items: this.Host.config})
    const selectedItem = await this.showDialog({text: 'Выберите item', itemTreeStructure: itemInConfigTree});
    onItemSelected(selectedItem);
  }

  _startVerticalResize = (msDownEvent, fieldItem, idx, containerElement, FieldWrapper) => {
    msDownEvent.preventDefault();
    const startResizePageY = msDownEvent.pageY;
    const resizeElem = fieldItem.domElement;
    const resizeElemRect = resizeElem.getBoundingClientRect();

    window.document.onmouseup = upEv => {
      upEv.preventDefault();
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    }

    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      const pageYDiff = moveEv.pageY - startResizePageY;

      let newHeight = (resizeElemRect.height + pageYDiff);
      newHeight = newHeight < 4 ? 4 : newHeight;
      newHeight = newHeight + 'px';
      
      let forStyleHeightObj;
      if (containerElement.viewItemType === 'horizontal-layout') {
        forStyleHeightObj = {
          height: newHeight
        }
      } else {
        forStyleHeightObj = {
          flexBasis: newHeight,
          flexGrow: 0
        }
      }
      if (fieldItem.style) {
        fieldItem.style = {
          ...fieldItem.style,
          ...forStyleHeightObj
        }
      } else {
        fieldItem.style = forStyleHeightObj;
      }

      // this.forceUpdate();
      FieldWrapper.forceUpdate();
    }

  }

  _startHorizontalResize = (msDownEvent, fieldItem, idx, containerElement, FieldWrapper) => {
    msDownEvent.preventDefault();
    // запрет на изменение ширины крайнего правого элемента
    if ((!fieldItem.viewItemType || fieldItem.viewItemType === 'field') &&
      !containerElement.container
    ) {
      return;
    }
    if (containerElement.viewItemType === 'horizontal-layout' &&
      idx === containerElement.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement)) {
        return;
      }
    }
    if (
      containerElement.viewItemType === 'vertical-layout' &&
      containerElement.container.items.findIndex(i => i === containerElement) === containerElement.container.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement.container)) {
        return;
      }
    }

    const startResizePageX = msDownEvent.pageX;
    const resizeElem = fieldItem.domElement;
    const resizeElemRect = resizeElem.getBoundingClientRect(); // долгая операция внутри моусмува не вариант использовать

    let firstVerticalNotRightest;
    let resizeVrtElemRect;
    if (
      (containerElement.viewItemType === 'horizontal-layout' && idx === containerElement.items.length - 1) ||
      containerElement.viewItemType === 'vertical-layout'
    ) {
      const firstVertical = containerElement.viewItemType === 'vertical-layout' ? containerElement : containerElement.container;
      firstVerticalNotRightest = this._findFirstVerticalNotRightestInHorizontal(firstVertical);
      if (firstVerticalNotRightest) { // TODO вот это предположительно не работает из того, что Дом теперь виртуальный
        resizeVrtElemRect = firstVerticalNotRightest.domElement.getBoundingClientRect();
      }
    }

    window.document.onmouseup = upEv => {
      upEv.preventDefault();
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    }
    // TODO убрать себя если ближайший вертикальный который не крайний правый
    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      const pageXDiff = moveEv.pageX - startResizePageX;

      if (containerElement.viewItemType === 'horizontal-layout' && idx !== containerElement.items.length - 1) {
        let newWidth = (resizeElemRect.width + pageXDiff);
        newWidth = newWidth < 4 ? 4 : newWidth;
        newWidth = newWidth + 'px';
        
        const forStyleWidthObj = {
          flexBasis: newWidth,
          flexGrow: 0
        }
        if (fieldItem.style) {
          fieldItem.style = {
            ...fieldItem.style,
            ...forStyleWidthObj
          }
        } else {
          fieldItem.style = forStyleWidthObj;
        }
        FieldWrapper.forceUpdate();
      }
      if (
        (containerElement.viewItemType === 'horizontal-layout' && idx === containerElement.items.length - 1) ||
        containerElement.viewItemType === 'vertical-layout'
      ) {
        if (firstVerticalNotRightest) {
          const newVrtWidth = (resizeVrtElemRect.width + pageXDiff) + 'px';
          const forStyleVrtWidthObj = {
            flexBasis: newVrtWidth,
            flexGrow: 0
          }
          if (firstVerticalNotRightest.style) {
            firstVerticalNotRightest.style = {
              ...firstVerticalNotRightest.style,
              ...forStyleVrtWidthObj
            }
          } else {
            firstVerticalNotRightest.style = forStyleVrtWidthObj;
          }
          firstVerticalNotRightest.VerticalLayout.forceUpdate();
        }
      }
    }
  }

  _findFirstVerticalNotRightestInHorizontal = (firstVertical) => {
    if (!firstVertical.container) {
      return false;
    }
    if (firstVertical.container.items.findIndex(i => i === firstVertical) === firstVertical.container.items.length - 1) {
      return this._findFirstVerticalNotRightestInHorizontal(firstVertical.container.container);
    } else {
      return firstVertical;
    }
  }

  _isHorizontalContainerFarRightInDesign(containerElement) {
    if (!containerElement.container.container) {
      return true;
    }
    if (
      containerElement.container.container.items.findIndex(i => i === containerElement.container) ===
      containerElement.container.container.items.length - 1
    ) {
      return this._isHorizontalContainerFarRightInDesign(containerElement.container.container)
    }
    return false;
  }

  _onDesignFieldContextMenu = async (e, fieldItem, idx, containerElement) => {
    e.preventDefault();
    let menu = [
      `Установить font-size`,
      'Установить style',
      'Сбросить style',
      'Установить presentationGroup'
    ];
    if (fieldItem.viewItemType === 'icon') {
      menu = ['Поменять иконку на', ...menu]
    }
    if (containerElement.viewItemType === 'vertical-layout') {
      menu.push('Установить style ближайшего vertical-layout');
      menu.push('Сбросить style ближайшего vertical-layout');
      menu.push('Установить presentationGroup ближайшего vertical-layout');
      if (containerElement.container?.viewItemType === 'horizontal-layout') {
        menu.push('Установить style ближайшего horizontal-layout');
        menu.push('Сбросить style ближайшего horizontal-layout');
        menu.push('Установить presentationGroup ближайшего horizontal-layout');
      }
    } else if (containerElement.viewItemType === 'horizontal-layout') {
      menu.push('Установить style ближайшего horizontal-layout');
      menu.push('Сбросить style ближайшего horizontal-layout');
      menu.push('Установить presentationGroup ближайшего horizontal-layout');
      if (containerElement.container?.viewItemType === 'vertical-layout') {
        menu.push('Установить style ближайшего vertical-layout');
        menu.push('Сбросить style ближайшего vertical-layout');
        menu.push('Установить presentationGroup ближайшего vertical-layout');
      }
    }    
    if (fieldItem.viewItemType === 'space div') {
      menu.push('Сделать контейнером');
    }
    if (fieldItem.viewItemType === 'items-container') {
      menu.push('Задать url фоновой картинки');
    }
    if (fieldItem.viewItemType === 'button') {
      menu.push('Установить buttonStyle');
      menu.push('Сбросить buttonStyle');
    }
    if (fieldItem.viewItemType === 'label' && !fieldItem.withoutPaddingAndMargin) {
      menu.push('Убрать margin-top-2 и pad-8');
    } else if (fieldItem.viewItemType === 'label' && fieldItem.withoutPaddingAndMargin) {
      menu.push('Вернуть margin-top-2 и pad-8');
    }
    if (fieldItem.viewItemType !== 'tabs' && fieldItem.viewItemType && fieldItem.viewItemType !== 'field') {
      menu.push('Убрать элемент')
    }
    if (fieldItem.fullOverlayMode) {
      menu.push('Убрать экранирование');
    }

    
    let menuResult;
    if (fieldItem.viewItemType === 'label' || fieldItem.viewItemType === 'button') {
      // menu.push('Изменить label');
      menu = ['Изменить label', ...menu];
      menuResult = await this.showContextMenu(e, menu);
      if (menuResult === 'Изменить label') {
        const newLabel = await this.showDialog({ text: 'Введите новый label', inputLabel: 'label', dialogInputValue: fieldItem.label });
        if (newLabel) {
          fieldItem.label = newLabel;
          this.forceUpdate();
        }
      }
      if (menuResult === 'Убрать margin-top-2 и pad-8') {
        fieldItem.withoutPaddingAndMargin = true;
        this.forceUpdate();
      }
      if (menuResult === 'Вернуть margin-top-2 и pad-8') {
        fieldItem.withoutPaddingAndMargin = false;
        this.forceUpdate();
      }
    } else {
      menuResult = await this.showContextMenu(e, menu);
    }
    if (menuResult === 'Поменять иконку на') {
      const iconName = await this.showDialog({ text: 'Введите name иконки', inputLabel: 'name', dialogInputValue: fieldItem.name });
      if (iconName) {
        fieldItem.name = iconName;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сделать контейнером') {
      fieldItem.viewItemType = 'items-container'
      this.forceUpdate()
    }
    if (menuResult === 'Задать url фоновой картинки') {
      const imgSrc = await this.showDialog({ text: 'Введите url картинки', inputLabel: 'src' });
      if (imgSrc) {
        fieldItem.imgSrc = imgSrc;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Убрать элемент') {
      if (!fieldItem.viewItemType || fieldItem.viewItemType === 'field') {
        return; // TODO Сделать плашку где отображаются скрытые поля, чтобы их можно было вернуть
      } else {
        containerElement.items.splice(idx, 1);
        this.forceUpdate();
      }
    }
    if (menuResult === 'Убрать экранирование') {
      delete fieldItem.fullOverlayMode;
      this.forceUpdate();
    }
    if (menuResult === 'Установить font-size') {
      const px = await this.showDialog({text: 'Введите число px', inputLabel: 'px'});
      if (px) {
        if (!fieldItem.style) fieldItem.style = {};
        fieldItem.style = {...fieldItem.style, fontSize: px+'px'};
        this.forceUpdate();
      }
    }
    if (menuResult === 'Установить style') {
      const style = await this.showDialog({
        text: ['Введите объект style,пример: {"background": "inherit"}',
          <br></br>,
          'Происходит мерджинг объекта, а не замена',
          <br></br>,
          `Текущий style: ${JSON.stringify(fieldItem.style)}`
        ],
        inputLabel: 'style object'
      });
      if (style) {
        if (!fieldItem.style) fieldItem.style = {};
        const styleObj = JSON.parse(style);
        fieldItem.style = {...fieldItem.style, ...styleObj};
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сбросить style') {
        fieldItem.style = null;
        this.forceUpdate();
    }
    if (menuResult === 'Установить buttonStyle') {
      const style = await this.showDialog({
        text: ['Введите объект style,пример: {"background": "inherit"}',
          <br></br>,
          'Происходит мерджинг объекта, а не замена',
          <br></br>,
          `Текущий style: ${JSON.stringify(fieldItem.buttonStyle)}`
        ],
        inputLabel: 'style object'
      });
      if (style) {
        if (!fieldItem.buttonStyle) fieldItem.buttonStyle = {};
        const styleObj = JSON.parse(style);
        fieldItem.buttonStyle = { ...fieldItem.buttonStyle, ...styleObj };
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сбросить buttonStyle') {
      fieldItem.buttonStyle = null;
      this.forceUpdate();
    }
    if (menuResult === 'Установить style ближайшего vertical-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'vertical-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      const style = await this.showDialog({
        text: ['Введите объект style,пример: {"background": "inherit"}',
          <br></br>,
          'Происходит мерджинг объекта, а не замена',
          <br></br>,
          `Текущий style: ${JSON.stringify(containerItem.style)}`
        ],
        inputLabel: 'style object'
      });
      if (style) {
        if (!containerItem.style) containerItem.style = {};
        const styleObj = JSON.parse(style);
        containerItem.style = { ...containerItem.style, ...styleObj };
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сбросить style ближайшего vertical-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'vertical-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      containerItem.style = null;
      this.forceUpdate();
    }
    if (menuResult === 'Установить style ближайшего horizontal-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'horizontal-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      const style = await this.showDialog({
        text: ['Введите объект style,пример: {"background": "inherit"}',
          <br></br>,
          'Происходит мерджинг объекта, а не замена',
          <br></br>,
          `Текущий style: ${JSON.stringify(containerItem.style)}`
        ],
        inputLabel: 'style object'
      });
      if (style) {
        if (!containerItem.style) containerItem.style = {};
        const styleObj = JSON.parse(style);
        containerItem.style = { ...containerItem.style, ...styleObj };
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сбросить style ближайшего horizontal-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'horizontal-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      containerItem.style = null;
      this.forceUpdate();
    }
    if (menuResult === 'Установить presentationGroup') {
      const presentationGroup = await this.showDialog({
        text: ['Введите имя presentationGroup, пример: ifParamYesNeedHide',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${fieldItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        dialogInputValue: fieldItem.presentationGroup
      });
      if (typeof presentationGroup === 'string') {
        fieldItem.presentationGroup = presentationGroup;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Установить presentationGroup ближайшего horizontal-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'horizontal-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      const presentationGroup = await this.showDialog({
        text: ['Введите имя presentationGroup, пример: ifParamYesNeedHide',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${containerItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        dialogInputValue: containerItem.presentationGroup
      });
      if (typeof presentationGroup === 'string') {
        containerItem.presentationGroup = presentationGroup;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Установить presentationGroup ближайшего vertical-layout') {
      let containerItem;
      if (containerElement.viewItemType === 'vertical-layout') {
        containerItem = containerElement;
      } else {
        containerItem = containerElement.container
      }
      const presentationGroup = await this.showDialog({
        text: ['Введите имя presentationGroup, пример: ifParamYesNeedHide',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${containerItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        dialogInputValue: containerItem.presentationGroup
      });
      if (typeof presentationGroup === 'string') {
        containerItem.presentationGroup = presentationGroup;
        this.forceUpdate();
      }
    }
  }

  _onTabContextMenu = async (e, tab, tabsFieldItem, idx, containerElement) => {
    e.preventDefault();
    if (!this.state.designMode) {
      return;
    }
    let menuResult;
    menuResult = await this.showContextMenu(
        e,
        [
          'Добавить вкладку',
          'Изменить label вкладки',
          'Расформировать вкладку',
          'Переместить правее',
          'Переместить левее',
          'Экранировать',
          'Сделать ссылкой',
          'Установить font-size',
        ]
    );
    if (menuResult === 'Добавить вкладку') {
      const newTabLabel = await this.showDialog({text: 'Введите label вкладки', inputLabel: 'label'});
      if (newTabLabel) {
        tabsFieldItem.items.push(
            {
              viewItemType: 'tab',
              label: newTabLabel,
              items: [{
                viewItemType: 'vertical-layout',
                items: [{
                  viewItemType: 'space div'
                }]
              }]
            }
        );
        this.forceUpdate();
      }
    }
    if (menuResult === 'Изменить label вкладки') {
      const newTabLabel = await this.showDialog({text: 'Введите label вкладки', inputLabel: 'label'});
      if (newTabLabel) {
        if (tab.label === tabsFieldItem.selectedTabLabel) {
          tabsFieldItem.selectedTabLabel = newTabLabel;
        }
        tab.label = newTabLabel;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Расформировать вкладку') {
      const confirmDelete = await this.showDialog({text: `Вы уверены что хотите расформировать вкладку ${tab.label}?`})
      if (!confirmDelete) return;
      const IndexToCut = tabsFieldItem.items.findIndex(tabInTabs => tabInTabs === tab);
      tabsFieldItem.items.splice(IndexToCut, 1);
      const itemsToRelocateInDesign = tab.items[0].items;
      // console.log('designJson in del tab:', this.state.designJson.items.concat(itemsToRelocateInDesign))
      this.state.designJson.items = this.state.designJson.items.concat(itemsToRelocateInDesign);
      if (tab.label === tabsFieldItem.selectedTabLabel) {
        if (tabsFieldItem.items.length === 0) {
          containerElement.items.splice(idx, 1); // remove tabs viewItem
        } else {
          tabsFieldItem.selectedTabLabel = tabsFieldItem.items[0].label
        }
      }
      this.forceUpdate();
    }
    if (menuResult === 'Переместить правее') {
      const IndexToCut = tabsFieldItem.items.findIndex(tabInTabs => tabInTabs === tab);
      tabsFieldItem.items.splice(IndexToCut, 1)
      tabsFieldItem.items.splice(IndexToCut+1, 0, tab);
      this.forceUpdate();
    }
    if (menuResult === 'Переместить левее') {
      const IndexToCut = tabsFieldItem.items.findIndex(tabInTabs => tabInTabs === tab);
      tabsFieldItem.items.splice(IndexToCut, 1)
      tabsFieldItem.items.splice(IndexToCut-1, 0, tab);
      this.forceUpdate();
    }
    if (menuResult === 'Экранировать') {
      tabsFieldItem.fullOverlayMode = true;
      this.forceUpdate();
    }
    if (menuResult === 'Сделать ссылкой') {
      const newUrl = await this.showDialog({text: 'Введите url ссылки', inputLabel: 'url'});
      if (newUrl) {
        tab.redirectToUrl = newUrl
        this.forceUpdate();
      }
    }
    if (menuResult === 'Установить font-size') {
      const px = await this.showDialog({text: 'Введите число px', inputLabel: 'px'});
      if (px) {
        if (!tabsFieldItem.style) tabsFieldItem.style = {};
        tabsFieldItem.style = {...tabsFieldItem.style, fontSize: px+'px'};
        this.forceUpdate();
      }
    }
  }

  dragstart = (e, {
    designDragStarted = true,
    designDragElement,
    designDragElementIndex,
    designDragContainer,
    designDragElementOrigin = 'objectDocument'
  }) => {
    // this.state.designDragStarted = designDragStarted; // для производительности в большом объекте
    // this.state.designDragElement = designDragElement;
    // this.state.designDragElementIndex = designDragElementIndex;
    // this.state.designDragContainer = designDragContainer;
    // this.state.designDragElementOrigin = designDragElementOrigin;
    this.setState({
      designDragStarted,
      designDragElement,
      designDragElementIndex,
      designDragContainer,
      designDragElementOrigin,
    })
  }

  _findFieldOverlay = (e) => {
    return e.target;
    // return e.target.closest('.field-overlay');
  }

  _dragover = (e, dropFieldItem, dropElementIndex, dropContainer) => {
    e.preventDefault();
    const fieldOverlay = this._findFieldOverlay(e);
    const elemRect = fieldOverlay.getBoundingClientRect();
    
    this._removeDragBorder(e);
    this._removeDragBorderFromDomELement(dropContainer.domElement);
    if (dropContainer.container) {
      this._removeDragBorderFromDomELement(dropContainer.container.domElement)
    }
    this.state.designDropTargetLevel2 = null;

    if (elemRect.left + elemRect.width / 10 > e.pageX) {
      if (elemRect.left + elemRect.width * 0.05 > e.pageX) {
        if (dropContainer.viewItemType === 'vertical-layout' && dropContainer.container) {
          dropContainer.domElement.classList.add('border-left-4');
          this.state.designDropTargetLevel2 = dropContainer;
        } else if (dropContainer.viewItemType === 'horizontal-layout' && dropElementIndex === 0 && dropContainer.container && dropContainer.container.container) {
          dropContainer.container.domElement.classList.add('border-left-4');
          this.state.designDropTargetLevel2 = dropContainer.container;
        } else { fieldOverlay.classList.add('border-left-4'); }
      } else {
        fieldOverlay.classList.add('border-left-4');
      }
      this.state.designDropSide = 'left';
    } else {
      if (elemRect.right - elemRect.width / 10 <= e.pageX) {
        if (elemRect.right - elemRect.width * 0.05 <= e.pageX) {
          if (dropContainer.viewItemType === 'vertical-layout' && dropContainer.container) {
            dropContainer.domElement.classList.add('border-right-4');
            this.state.designDropTargetLevel2 = dropContainer;
          } else if (dropContainer.viewItemType === 'horizontal-layout' && dropElementIndex === (dropContainer.items.length - 1) && dropContainer.container && dropContainer.container.container) {
            dropContainer.container.domElement.classList.add('border-right-4');
            this.state.designDropTargetLevel2 = dropContainer.container;
          } else { fieldOverlay.classList.add('border-right-4'); }
        } else {
          fieldOverlay.classList.add('border-right-4');
        }
        this.state.designDropSide = 'right';
      } else {
        if (elemRect.top + elemRect.height / 2 > e.pageY) {
          if (elemRect.top + elemRect.height / 4 > e.pageY) {
            if (dropContainer.viewItemType === 'vertical-layout' && dropElementIndex === 0 && dropContainer.container) {
              dropContainer.container.domElement.classList.add('border-top-4');
              this.state.designDropTargetLevel2 = dropContainer.container;
            } else if (dropContainer.viewItemType === 'horizontal-layout') {
              dropContainer.domElement.classList.add('border-top-4');
              this.state.designDropTargetLevel2 = dropContainer;
            } else { fieldOverlay.classList.add('border-top-4'); }
          } else {
            fieldOverlay.classList.add('border-top-4');
          }
          this.state.designDropSide = 'top';
        }
        if (elemRect.top + elemRect.height / 2 <= e.pageY) {
          if (elemRect.top + elemRect.height * 0.75 <= e.pageY) {
            if (dropContainer.viewItemType === 'vertical-layout' && dropElementIndex === (dropContainer.items.length - 1) && dropContainer.container) {
              dropContainer.container.domElement.classList.add('border-bottom-4');
              this.state.designDropTargetLevel2 = dropContainer.container;
            } else if (dropContainer.viewItemType === 'horizontal-layout') {
              dropContainer.domElement.classList.add('border-bottom-4');
              this.state.designDropTargetLevel2 = dropContainer;
            } else { fieldOverlay.classList.add('border-bottom-4'); }
          } else {
            fieldOverlay.classList.add('border-bottom-4');
          }
          this.state.designDropSide = 'bottom';
        }
      }
    }
  }

  _removeDragBorder = (e) => {
    const fieldOverlay = this._findFieldOverlay(e);
    fieldOverlay.classList.remove('border-top-4');
    fieldOverlay.classList.remove('border-bottom-4');
    fieldOverlay.classList.remove('border-left-4');
    fieldOverlay.classList.remove('border-right-4');
  }
  
  _removeDragBorderFromDomELement = (domELement) => {
    domELement.classList.remove('border-top-4');
    domELement.classList.remove('border-bottom-4');
    domELement.classList.remove('border-left-4');
    domELement.classList.remove('border-right-4');
  }

  _dragleave = (e, dropFieldItem, dropElementIndex, dropContainer) => {
    this._removeDragBorder(e);
    this._removeDragBorderFromDomELement(dropContainer.domElement);
    if (dropContainer.container) {
      this._removeDragBorderFromDomELement(dropContainer.container.domElement)
    }
  }

  _drop = (e, dropFieldItem, dropElementIndex, dropContainer) => {
    if (this.state.designDragElement === dropFieldItem && !this.state.designDropTargetLevel2) {
      this._removeDragBorder(e);
      this.setState({designDragStarted: false});
      return;
    }

    if (this.state.designDragElement.style) {
      // delete this.state.designDragElement.style.flexBasis;
      // delete this.state.designDragElement.style.flexGrow;
      this.state.designDragElement.style = { ...this.state.designDragElement.style, flexBasis: 0, flexGrow: 1 };
    }

    if (dropFieldItem.viewItemType === 'items-container') {
      dropFieldItem.items = [
        {
          viewItemType: 'vertical-layout',
          items: [this.state.designDragElement],
          container: dropFieldItem
        }
      ]
      let cutIndex = this.state.designDragElementIndex;
      if (this.state.designDragElementOrigin !== 'instrument panel') {
        this.state.designDragContainer.items.splice(cutIndex, 1);
        this._removeEmptyContainers(this.state.designDragContainer);
      }
      this._removeDragBorder(e);
      this.setState({ designDragStarted: false });
      return;
    }

    // const newDesign = [...this.designJson];
    let insertIndex = dropElementIndex;
    let cutIndex = this.state.designDragElementIndex;
    
    if (this.state.designDropTargetLevel2) {
      if (this.state.designDropSide === 'top' || this.state.designDropSide === 'left') {
        insertIndex = this.state.designDropTargetLevel2.container.items.findIndex(i => i === this.state.designDropTargetLevel2)
      }
      if (this.state.designDropSide === 'bottom' || this.state.designDropSide === 'right') {
        insertIndex = 1 + this.state.designDropTargetLevel2.container.items.findIndex(i => i === this.state.designDropTargetLevel2)
      }
      this.state.designDropTargetLevel2.container.items.splice(insertIndex, 0, this.state.designDragElement);
      
    } else {
      if (this.state.designDropSide === 'left' || this.state.designDropSide === 'right') {
        if (dropContainer.viewItemType === 'vertical-layout') {
          if (this.state.designDropSide === 'left') {
            dropContainer.items[dropElementIndex] = {
              container: dropContainer,
              viewItemType: 'horizontal-layout',
              items: [this.state.designDragElement, dropFieldItem]
            }
          }
          if (this.state.designDropSide === 'right') {
            dropContainer.items[dropElementIndex] = {
              container: dropContainer,
              viewItemType: 'horizontal-layout',
              items: [dropFieldItem, this.state.designDragElement]
            }
          }
        } else if (dropContainer.viewItemType === 'horizontal-layout') {
          if (this.state.designDropSide === 'left') {
            if (dropContainer === this.state.designDragContainer && cutIndex > insertIndex) {
              cutIndex = cutIndex + 1;
            }
          }
          if (this.state.designDropSide === 'right') {
            if (dropContainer === this.state.designDragContainer && cutIndex > insertIndex) {
              cutIndex = cutIndex + 1;
            }
            insertIndex = insertIndex + 1;
          }
          dropContainer.items.splice(insertIndex, 0, this.state.designDragElement);
        }
      }

      if (this.state.designDropSide === 'top' || this.state.designDropSide === 'bottom') {
        if (dropContainer.viewItemType === 'horizontal-layout') {
          let vrtElement;
          if (this.state.designDropSide === 'top') {
            vrtElement = {
              container: dropContainer,
              viewItemType: 'vertical-layout',
              items: [this.state.designDragElement, dropFieldItem]
            }
          }
          if (this.state.designDropSide === 'bottom') {
            vrtElement = {
              container: dropContainer,
              viewItemType: 'vertical-layout',
              items: [dropFieldItem, this.state.designDragElement]
            }
          }

          if (dropFieldItem.style) {
            if (dropFieldItem.style.flexBasis) { // Передать созданному Вертикалу длину Филда на его месте
              vrtElement.style = {
                flexBasis: dropFieldItem.style.flexBasis,
                flexGrow: dropFieldItem.style.flexGrow,
              }
            }
            // delete dropContainer.items[dropElementIndex].style.flexBasis;
            // delete dropContainer.items[dropElementIndex].style.flexGrow;
            dropFieldItem.style = {};
          }

          dropContainer.items.splice(insertIndex, 1)
          dropContainer.items.splice(insertIndex, 0, vrtElement);

        } else if (dropContainer.viewItemType === 'vertical-layout') {
          if (this.state.designDropSide === 'bottom') {
            insertIndex = insertIndex + 1;
          }
          if (dropContainer === this.state.designDragContainer && this.state.designDragElementIndex > dropElementIndex) {
            cutIndex = cutIndex + 1;
          }
          dropContainer.items.splice(insertIndex, 0, this.state.designDragElement);
        }
      }

    }


    if (this.state.designDragElementOrigin !== 'instrument panel') {
      this.state.designDragContainer.items.splice(cutIndex, 1);
      this._removeEmptyContainers(this.state.designDragContainer);
    }

    this._removeDragBorder(e);
    this._removeDragBorderFromDomELement(dropContainer.domElement);
    if (dropContainer.container) {
      this._removeDragBorderFromDomELement(dropContainer.container.domElement)
    }
    this.state.designDropTargetLevel2 = null;

    this.setState({designDragStarted: false, designJson: {...this.state.designJson}});
    // this.forceUpdate();
    // this.designJson = newDesign;
  }

  save = async () => {
    await this.state._objectDocument.saveData(this.state._newData);
    this.setState(state => ({_newDataBeforeUpdate: this.deepClone(state._newData)}));
    this.props.onSavedFunc();
  }

  saveAndClose = async () => {
    await this.save();
    this.Host.$hostElement.setState(state => ({
      designMode: false,
      $designObjectDocument: null
    }));
    this.props.onCloseFunc();
  }

  closeWithoutSave = () => {
    this.props.onCloseFunc();
    this.Host.$hostElement.setState(state => ({
      designMode: false,
      $designObjectDocument: null
    }));
  }

  toggleDesign = async () => {
    this.setState(
      state => ({designMode: !state.designMode}),
      async () => {
        if (this.state.designMode === false) {
          const saveDesignFlag = await this.showDialog({text: 'Сохранить дизайн?'});
          if (saveDesignFlag) {
            return this.saveDesign();
          }
        }
      }
    );
    console.log('this.Host', this.Host);
    this.Host.$hostElement.setState(state => ({
      designMode: !state.designMode,
      $designObjectDocument: this
    }));
  }

  toggleToJSON = () => {
    this.setState(state => ({isJSONshowed: !state.isJSONshowed}));
  }

  saveDesign = async () => {
    this._removeContainerReference(this.state.designJson);
    this._removeDomElementReference(this.state.designJson);
    this._removeVirtualDomElementReference(this.state.designJson);
    await this.state._objectDocument.saveDesignJson(this.deepClone(this.state.designJson));
    this._addContainerReference(this.state.designJson);
  }

  _removeDomElementReference = (layoutElememt) => {
    delete layoutElememt.domElement;
    if (layoutElememt.items) {
      layoutElememt.items.forEach(i => {
        this._removeDomElementReference(i);
      })
    }
  }
  
  _removeVirtualDomElementReference = (layoutElememt) => {
    delete layoutElememt.VerticalLayout;
    if (layoutElememt.items) {
      layoutElememt.items.forEach(i => {
        this._removeVirtualDomElementReference(i);
      })
    }
  }

  _addContainerReference = (layoutElement) => {
    if (!layoutElement.items) return;
    layoutElement.items.forEach((i) => {
      if (i.viewItemType === 'horizontal-layout' || i.viewItemType === 'vertical-layout') {
        i.container = layoutElement;
      }
      this._addContainerReference(i) // Вынесено чтоб внутрь табов и айтемс контейнеров ходил
    })
  }
  _removeContainerReference = (layoutElement) => {
    if (!layoutElement.items) return;
    layoutElement.items.forEach(i => {
      if (i.viewItemType === 'horizontal-layout' || i.viewItemType === 'vertical-layout') {
        if (i.container) {
          delete i.container;
        }
      }
      this._removeContainerReference(i)
    })
  }
  _removeEmptyContainers = (cont) => {
    if (cont.items.length === 0 && cont.container) {
      const DragContIndex = cont.container.items.findIndex(i => i === cont);
      cont.container.items.splice(DragContIndex, 1)
      this._removeEmptyContainers(cont.container)
    }
  }

  _findNewFieldDescriptors = (fields, fieldsInDesign) => {
    return fields.filter(f => fieldsInDesign.every(fInDesign => fInDesign.name !== f.name))
  }

  _findDeletedFieldDescriptors = (fields, fieldsInDesign) => {
    return fieldsInDesign.filter(fInDesign => fields.every(f => f.name !== fInDesign.name))
  }

  _removeDeletedItems = (designJson, deletedItems) => {
    deletedItems.forEach(delItem => {
      this._removeDeletedItemInContainer(delItem, designJson);
    })
  }
  _removeDeletedItemInContainer = (delItem, containerEl) => {
    if (containerEl.items) {
      const forDelItemIndex = containerEl.items.findIndex(i => i.name === delItem.name);
      if (forDelItemIndex > -1) {
        containerEl.items.splice(forDelItemIndex, 1);
        this._removeEmptyContainers(containerEl);
      } else {
        const containerElements = containerEl.items.filter(i => i.viewItemType && i.viewItemType !== 'field');
        containerElements.forEach(contEl => {
          this._removeDeletedItemInContainer(delItem, contEl)
        })
      }
    }
  }

  _forceUpdateDebounced1Sec = this.makeDebounced(() => this.forceUpdate(), 1000)
}
