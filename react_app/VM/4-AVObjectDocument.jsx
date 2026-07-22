import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClass} from './3-AVClass.jsx';
import {AVField} from './5-AVField.jsx';

import {AVButton} from "../V/AVButton.jsx";
import {AVIcon} from '../V/icons/AVIcon.jsx';

import { JSONTree } from 'react-json-tree';
import { AVContextMenu } from '../V/AVContextMenu.jsx';

export class AVObjectDocument extends AVItem {
  static defaultProps = {
    classItem: null,
    fieldDescriptors: [],
    objectDocument: null,
    objectDocumentPath: '', // применяется вместо выше представленных полей за счёт дидимаунта, для организации роута на объект на весь экран
    onSavedFunc: this.noop,
    onCloseFunc: this.noop,

    noOkCancelPanel: false,
    
    itemFullScreenMode: false,
    
    onButtonClickFunc: this.noop,
    onLabelClickFunc: this.noop,
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

    isLeftPanelOpened: false, // для инструментов дизайна
    isRightPanelOpened: false,
    
    customDivContent: null,
    
    hiddenDesignFieldOverlayItems: [],
  }
  
  $rootDivDomElement;
  
  actionHandlerList = {};

  constructor(props) {
    super(props);

    this._prepareDesignJson();
  }

  //render
  
  async componentDidMount() {
    console.log(`AVObjectDocument(name=${this.state._newData?.name}, id=${this.state._newData?.id}) componentDidMount, props:`, this.props);
    console.log(`AVObjectDocument(name=${this.state._newData?.name}, id=${this.state._newData?.id}) actionHandlerList`, this.actionHandlerList);
    if (this.props.objectDocumentPath) {
      const objectDocument = this.Host.getObjectDocumentByPath(this.props.objectDocumentPath);
      let fieldDescriptors = objectDocument.Class?.metadata?.fieldDescriptors;
      if (!objectDocument.preloaded) {
        console.log('not preloaded objectDocumentPath');
        await objectDocument.getData();
        const classItem = this.Host.getClass(objectDocument.data.classReference);
        fieldDescriptors = await classItem.getFieldDescriptors();
        objectDocument.Class = classItem;
      }

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
      this._makeDidMountByModule();
      
      window.document.addEventListener('keydown', this._f4Listener);

    }
    
    window.document.addEventListener('click', this._outClickListener)

    // this.setState({
    //   _newData: this.deepClone(this.props.objectDocument.data),
    //   _newDataBeforeUpdate: this.deepClone(this.props.objectDocument.data),
    // })
  }
  
  _outClickListener = e => {
    this.actionHandlerList['Outclick']?.forEach(({ item, listenerAVFieldComponent, actionHandlerFunction }) => {
      if (!e.target.closest('#' + item.attributes.id)) {
        let f = new Function('item', '$objectDocument', 'e', actionHandlerFunction);
        f = f.bind(listenerAVFieldComponent);
        f(item, this, e);
      }
    })
    
  }
  
  _f4Listener = e => {
    if (e.key === 'F4') {
      e.preventDefault();
      this.toggleDesign();
    }
  }

  async componentDidUpdate(prevProps) {
    console.log(`AVObjectDocument(name=${this.state._newData?.name}, id=${this.state._newData?.id}) componentDidUpdate, props:`, this.props, 'prevProps:', prevProps);
    if (this.props.objectDocumentPath !== prevProps.objectDocumentPath) {
      const objectDocument = this.Host.getObjectDocumentByPath(this.props.objectDocumentPath);
      let fieldDescriptors = objectDocument.Class?.metadata?.fieldDescriptors;
      if (!objectDocument.preloaded) {
        console.log('not preloaded objectDocumentPath');
        await objectDocument.getData();
        const classItem = this.Host.getClass(objectDocument.data.classReference);
        fieldDescriptors = await classItem.getFieldDescriptors();
        objectDocument.Class = classItem;
      }

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
    if (this.state._objectDocument) {
      const classInstance = this.state._objectDocument.Class;
      const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
      if (moduleDefinition) {
        const methodOnComponentDidMount = moduleDefinition.onComponentDidMount;
        if (methodOnComponentDidMount) {
          methodOnComponentDidMount(this)
        }
      }
    }
  }
  
  componentWillUnmount() {
    window.document.removeEventListener('keydown', this._f4Listener);
    window.document.removeEventListener('click', this._outClickListener)

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
      <div ref={domEl => this.$rootDivDomElement = domEl} className={`_av-object-document-root pos-rel flex-1 col line-height-20px ${this.state.designMode ?  'bg-white' : 'bg-app-back'}`}>
        <div className="flex-1 col space-between">
          {this.state.isJSONshowed ? (
            <JSONTree data={this.state._newData}/>
          ) : (
            <div>
                <this.VerticalLayout
                  vrtLayoutItem={this.state.designJson}
                  _newData={this.state._newData}
                  $objDoc={this}
                  designMode={this.state.designMode}
                  isLeftPanelOpened={this.state.isLeftPanelOpened}
                  isRightPanelOpened={this.state.isRightPanelOpened}
                ></this.VerticalLayout>
            </div>
          )}
          <div className={`${this.props.noOkCancelPanel ? 'no-display' : 'row'} justify-end`}>
            <div className="row align-center justify-center">
              {this._renderButtonsByServices()}
              {!window.vk_app && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
        {this.state.isClassItemOpened && (
          <div className="pos-fixed rb-0-top-11prc-left-20prc z-index-100 bg-app-back">
            <AVClass
              classItem={this.state.openedClassItem}
              onObjectDocumentSelectedFunc={this.state.onObjectDocumentSelectedInOpenedClassItem}
              onCancelFunc={() => { this.setState({ isClassItemOpened: false })}}
            ></AVClass>
          </div>
        )}
        {(this.state.designMode && this.props.itemFullScreenMode) && (this._renderLeftPanel())}
        {(this.state.designMode && this.props.itemFullScreenMode) && (this._renderRightPanel())}
        {this.state.customDivContent}
      </div>
    )
  }
  
  _renderLeftPanel() {
    return (
      <div className={this.state.isLeftPanelOpened ? '_panel-instruments pos-fixed tbl-0 row align-center z-index-100000' : ''}>
        {this.state.isLeftPanelOpened && (
          <div className='bg-tree'>{this.Host.$hostElement._renderInstrumentPanel()}</div>
        )}
        <div className={this.state.isLeftPanelOpened ? 'row align-center' : ''}>
          <div className={`_panel-instruments-opener ${this.state.isLeftPanelOpened ? '' : 'pos-fixed left-0 top-50prc'} row align-center height-56px bg-link cursor-pointer z-index-100000`}
            onClick={e => this.setState(state => ({ isLeftPanelOpened: !this.state.isLeftPanelOpened }))}
          >....</div>
        </div>
      </div>
    )
  }
  
  _renderRightPanel() {
    return (
      <div className={this.state.isRightPanelOpened ? '_panel-instruments pos-fixed trb-0 row align-center z-index-100000' : ''}>
        <div className={this.state.isRightPanelOpened ? 'row align-center' : ''}>
          <div className={`_panel-instruments-opener ${this.state.isRightPanelOpened ? '' : 'pos-fixed right-0 top-50prc'} row align-center height-56px bg-link cursor-pointer z-index-100000`}
            onClick={e => this.setState(state => ({ isRightPanelOpened: !this.state.isRightPanelOpened }))}
          >....</div>
        </div>
        {this.state.isRightPanelOpened && (
          <div className='bg-tree'>{this.Host.$hostElement._renderInstrumentPanel()}</div>
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

      isLeftPanelOpened: false,
      isRightPanelOpened: false,
    }
        
    shouldComponentUpdate(nextProps) {
      if (this.props.isLeftPanelOpened !== nextProps.isLeftPanelOpened || this.props.isRightPanelOpened !== nextProps.isRightPanelOpened) {
        return false
      }
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
              return (<$objDoc.HorizontalLayout
                key={vrtIndex}
                ref={virtualDomElement => vrtItem.HorizontalLayout = virtualDomElement}
                hrzLayoutItem={vrtItem}
                hrzLayoutItemIndex={vrtIndex}
                _newData={_newData}
                $objDoc={$objDoc}
                designMode={designMode}
              ></$objDoc.HorizontalLayout>);
            }
            if (vrtItem.viewItemType === 'field' || !vrtItem.viewItemType ||
              (vrtItem.viewItemType !== 'vertical-layout' && vrtItem.viewItemType !== 'horizontal-layout')
            ) {
              return (<$objDoc.FieldWrapper
                key={vrtIndex}
                fieldItem={vrtItem}
                idx={vrtIndex}
                containerElement={vrtLayoutItem}
                $objDoc={$objDoc}
                designMode={designMode}
                _newData={_newData}
                designDragStarted={$objDoc.state.designDragStarted}
              ></$objDoc.FieldWrapper>)
            }
          })}
        </div>
      )
    }
  }

  HorizontalLayout = class HorizontalLayout extends React.Component {
    static defaultProps = {
      hrzLayoutItem: null,
      hrzLayoutItemIndex: null,
      _newData: null,
      $objDoc: null,
      designMode: false,
    }

    render() {
      let hrzLayoutItem = this.props.hrzLayoutItem;
      let hrzLayoutItemIndex = this.props.hrzLayoutItemIndex;
      let _newData = this.props._newData;
      let $objDoc = this.props.$objDoc;
      let designMode = this.props.designMode;

      if ($objDoc.state.presentationGroupsHidden.includes(hrzLayoutItem.presentationGroup)) {
        return null
      }
      return (
        <div
          className="horizontal-layout flex-1 row"
          style={hrzLayoutItem.style}
          ref={hrzDomElement => hrzLayoutItem.domElement = hrzDomElement}
        >
          {hrzLayoutItem.items.map((hrzItem, hrzIndex) => {
            if (hrzItem.viewItemType === 'vertical-layout') {
              return (<$objDoc.VerticalLayout
                key={hrzIndex}
                ref={virtualDomElement => hrzItem.VerticalLayout = virtualDomElement}
                vrtLayoutItem={hrzItem}
                vrtLayoutItemIndex={hrzIndex}
                _newData={_newData}
                $objDoc={$objDoc}
                designMode={designMode}
              ></$objDoc.VerticalLayout>);
            } else {
              return (<$objDoc.FieldWrapper
                key={hrzIndex}
                fieldItem={hrzItem}
                idx={hrzIndex}
                containerElement={hrzLayoutItem}
                $objDoc={$objDoc}
                designMode={designMode}
                _newData={_newData}
                designDragStarted={$objDoc.state.designDragStarted}
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
  
  FieldWrapper = class FieldWrapper extends React.Component {
    static defaultProps = {
      fieldItem: null,
      idx: null,
      containerElement: null,
      $objDoc: null,
      designMode: false,
      _newData: null,
      designDragStarted: false,
    }

    state = {
      tabLabelHovered: ''
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
            <div className='_av-field-viewItem-root flex-1 pad-8' style={fieldItem.viewItemRootStyle}>
              <div className='_tab-head row' style={fieldItem.tabHeadStyle}>
                {fieldItem.items.map(tab => tab && (
                  <div
                    className={['_tab-head-item', 'pad-4-8',
                      (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'border-2' : 'border',
                      (fieldItem.selectedTabLabel === tab.label) && !tab.redirectToUrl ? 'font-weight-500' : ''
                    ].join(' ')}
                    style={fieldItem.selectedTabLabel === tab.label ? { ...fieldItem.tabHeadItemStyle, ...fieldItem.selectedTabHeadItemStyle, ...(this.state.tabLabelHovered === tab.label ? fieldItem.selectedTabHeadItemHoveredStyle : {}) } : { ...fieldItem.tabHeadItemStyle, ...(this.state.tabLabelHovered === tab.label ? fieldItem.tabHeadItemHoveredStyle : {}) } }
                    onMouseEnter={e => { this.setState({ tabLabelHovered: tab.label }) }}
                    onMouseLeave={e => { this.setState({ tabLabelHovered: '' }) }}
                    key={tab.label}
                    onClick={() => {
                      if (tab.redirectToUrl) {
                        window.open(tab.redirectToUrl);
                        // window.open(tab.redirectToUrl , '_blank');
                      } else {
                        fieldItem.selectedTabLabel = tab.label;
                        this.forceUpdate();
                      }
                      if (tab.onClickFunc) {
                        tab.onClickFunc()
                      }
                    }}
                    onContextMenu={e => $objDoc._onTabContextMenu(e, tab, fieldItem, idx, containerElement)}
                  ><div style={fieldItem.selectedTabLabel === tab.label ? { ...fieldItem.tabHeadItemLabelStyle, ...fieldItem.selectedTabHeadItemLabelStyle, ...(this.state.tabLabelHovered === tab.label ? fieldItem.selectedTabHeadItemLabelHoveredStyle : {}) } : { ...fieldItem.tabHeadItemLabelStyle, ...(this.state.tabLabelHovered === tab.label ? fieldItem.tabHeadItemLabelHoveredStyle : {}) }}
                    className={`${fieldItem.selectedTabLabel === tab.label ? 'border-bottom-2' : ''}`}>{tab.label || 'tab1'}</div></div>
                ))}
              </div>
              {$objDoc.notEmpty(fieldItem.items.filter(tab => (fieldItem.selectedTabLabel === tab?.label) && tab?.redirectToUrl)) ? null : (
                <div className='_tabs-body-container pad-8 border' style={fieldItem.tabBodyContainerStyle}>
                  {fieldItem.items.map(tab => tab && (
                    <div className="_tab-body" key={tab.label} hidden={fieldItem.selectedTabLabel !== tab.label}>
                      {tab.renderCustomBody ? tab.renderCustomBody() : $objDoc._renderVerticalLayout(tab.items[0])}
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
            onBlurFunc={event => {
              const classInstance = $objDoc.state._objectDocument.Class;
              const moduleDefinition = classInstance.classModuleDefinitions.find(m => m.id === classInstance.id);
              if (moduleDefinition) {
                const methodOnFieldBlur = moduleDefinition.on_fieldBlur;
                if (methodOnFieldBlur) {
                  methodOnFieldBlur({ $objectDocument: $objDoc, fieldItemName: fieldItem.name, value: $objDoc.state._newData[fieldItem.name] , fieldItem, event })
                }
              }
            }}
            labelPosition={fieldItem.dataType === 'array' ? 'top' : 'left'}
            $objectDocument={$objDoc}
            onButtonClickFunc={$objDoc.props.onButtonClickFunc}
            onLabelClickFunc={$objDoc.props.onLabelClickFunc}
          >
            {designMode && (!$objDoc.state.hiddenDesignFieldOverlayItems.some(hdn => hdn === fieldItem) && $objDoc._renderDesignFieldOverlay(fieldItem, idx, containerElement, this))}
          </AVField>
        </div>
      )
    }
  }
  
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
                 onDragEnd={e => {
                   console.log('onDragend');
                   this.setState(state => ({ designDragStarted: false, }))
                 }}
                 onContextMenu={(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}
            ></div>
            <div className="_horizontal-resizer height-100prc width-4px z-index-10000 cursor-col-resize"
              hidden={this.state.designDragStarted}
              onMouseDown={(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement, FieldWrapper)}
            ></div>
          </div>
          <div className="_vertical-resizer width-100prc height-2px z-index-10000 cursor-row-resize"
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
  
  renderCustomDiv = ({ content }) => {
    this.setState({ customDivContent: content });
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
    let resizeElem = fieldItem.domElement;
    if (containerElement.viewItemType === 'vertical-layout' && idx === (containerElement.items.length - 1) && containerElement.container?.viewItemType === 'horizontal-layout') {
      resizeElem = containerElement.container.domElement;
    }
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
          flexBasis: newHeight,
          flexGrow: 0
        }
        
        if (containerElement.style) {
          containerElement.style = {
            ...containerElement.style,
            ...forStyleHeightObj
          }
        } else {
          containerElement.style = forStyleHeightObj;
        }

        containerElement.HorizontalLayout.forceUpdate();
        
      } else if (containerElement.viewItemType === 'vertical-layout' && idx === (containerElement.items.length -1) && containerElement.container?.viewItemType === 'horizontal-layout') {
        forStyleHeightObj = {
          flexBasis: newHeight,
          flexGrow: 0
        }
        
        const hrzContainer = containerElement.container;

        if (hrzContainer.style) {
          hrzContainer.style = {
            ...hrzContainer.style,
            ...forStyleHeightObj
          }
        } else {
          hrzContainer.style = forStyleHeightObj;
        }

        hrzContainer.HorizontalLayout.forceUpdate();
        
      } else {
        forStyleHeightObj = {
          flexBasis: newHeight,
          flexGrow: 0
        }
        
        if (fieldItem.style) {
          fieldItem.style = {
            ...fieldItem.style,
            ...forStyleHeightObj
          }
        } else {
          fieldItem.style = forStyleHeightObj;
        }
        
        FieldWrapper.forceUpdate();

      }

      // this.forceUpdate();
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
    e.stopPropagation();
    let menu = [
      `Установить font-size`,
      'Установить style',
      'Сбросить style',
      'Установить presentationGroup'
    ];
    
    if (fieldItem.viewItemType === 'space div') {
      menu.splice(1, 0, 'Дизайнер div в div-е');
    }
    if (fieldItem.viewItemType === 'label') {
      menu.splice(1, 0, 'Установить justifyMode');
    }
    if (fieldItem.viewItemType === 'icon') {
      menu = ['Установить icon name', ...menu]
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
      menu.push('Установить iconName вместо label');
      menu.push('Установить buttonStyle');
      menu.push('Сбросить buttonStyle');
    }
    if ((fieldItem.viewItemType === 'label' || fieldItem.viewItemType === 'button') && !fieldItem.withoutPaddingAndMargin) {
      menu.push('Убрать margin-top-2 и pad-8');
    } else if ((fieldItem.viewItemType === 'label' || fieldItem.viewItemType === 'button') && fieldItem.withoutPaddingAndMargin) {
      menu.push('Вернуть margin-top-2 и pad-8');
    }
    if (fieldItem.viewItemType !== 'tabs' && fieldItem.viewItemType && fieldItem.viewItemType !== 'field') {
      menu.push('Убрать элемент')
    }
    if (fieldItem.fullOverlayMode) {
      menu.push('Установить style для tabs структуры')
      menu.push('Убрать экранирование');
    } else {
      menu.push('Убрать экранирование');
    }

    
    let menuResult;
    if (fieldItem.viewItemType === 'label' || fieldItem.viewItemType === 'button') {
      // menu.push('Изменить label');
      menu = ['Изменить label', ...menu];
      menuResult = await this.showContextMenu(e, menu);
      if (menuResult === 'Изменить label') {
        const newLabel = await this.showDialog({ text: 'Введите новый label', inputLabel: 'label', inputValue: fieldItem.label });
        if (newLabel) {
          fieldItem.label = newLabel;
          this.forceUpdate();
        }
      }
      if (menuResult === 'Установить iconName вместо label') {
        const iconName = await this.showDialog({ text: 'Введите новый iconName', inputLabel: 'iconName', inputValue: fieldItem.iconName });
        if (iconName) {
          fieldItem.iconName = iconName;
          this.forceUpdate();
        }
      }
      if (menuResult === 'Установить justifyMode') {
        const justifyMode = await this.showDialog({
          text: ['Введите строку justifyMode, пример: center',
            <br></br>,
            'enum [start, center, end]',
            <br></br>,
            `Текущий justifyMode: ${fieldItem.justifyMode}`
          ],
          inputLabel: 'justifyMode',
          inputValue: fieldItem.justifyMode || ''
        });
        if (justifyMode) {
          fieldItem.justifyMode = justifyMode;
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
    if (menuResult === 'Установить icon name') {
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
      const imgSrc = await this.showDialog({ text: 'Введите url картинки', inputLabel: 'src', inputValue: fieldItem.imgSrc });
      if (imgSrc) {
        fieldItem.imgSrc = imgSrc;
        this.forceUpdate();
      }
    }
    if (menuResult === 'Убрать элемент') {
      if (!fieldItem.viewItemType || fieldItem.viewItemType === 'field') {
        return; // TODO Сделать плашку где отображаются скрытые поля, чтобы их можно было вернуть
      } else {
        if (idx === (containerElement.items.length - 1) && containerElement.items.length > 1) {
          if (containerElement.items[idx - 1].style?.flexBasis) {
            containerElement.items[idx - 1].style = { ...containerElement.items[idx - 1].style, flexBasis: 0, flexGrow: 1 }
          }
        }
        containerElement.items.splice(idx, 1);
        if (containerElement.items.length === 1 && containerElement.container) { // Если в Хрз или Врт остался 1 то вытащить филд на 1 этаж выше
          if (containerElement.items[0].viewItemType === 'vertical-layout' && containerElement.viewItemType === 'horizontal-layout') {
            this.forceUpdate();
            return; //Вертикал на место Горизонтала встать не может
          }
          const replaceIdx = containerElement.container.items.findIndex(item => item === containerElement);
          containerElement.container.items.splice(replaceIdx, 1, containerElement.items[0]);
        }
        this._removeEmptyContainers(containerElement);
        this.forceUpdate();
      }
    }
    if (menuResult === 'Убрать экранирование') {
      if (fieldItem.fullOverlayMode) {
        delete fieldItem.fullOverlayMode;
        this.forceUpdate();
      } else {
        this.state.hiddenDesignFieldOverlayItems.push(fieldItem);
        this.forceUpdate();
      }
    }
    if (menuResult === 'Установить font-size') {
      const fontSize = await this.showDialog({text: 'Введите число px', inputLabel: 'px'});
      if (fontSize) {
        if (!fieldItem.style) fieldItem.style = {};
        fieldItem.style = {...fieldItem.style, fontSize: fontSize+'px'};
        this.forceUpdate();
      }
    }
    
    if (menuResult === 'Дизайнер div в div-е') {
      let oldStyleObj = fieldItem.viewItemRootStyle; // У нас 2-этажный style на fieldItem, один идёт в ФилдРаппер

      let newStyleObj = { ...oldStyleObj };
      let rootStyleObj = newStyleObj;
      let rootHoverStyleObj = { ...fieldItem.viewItemRootHoverStyle };

      let newOnActionsObj = { ...(fieldItem.onActions || {}) };
      let rootOnActionsObj = newOnActionsObj;
      
      let newActionListenersArr = [...(fieldItem.actionListeners || []) ];
      let rootActionListenersArr = newActionListenersArr;

      let newAttributes = { ...(fieldItem.attributes || {}) };
      let rootAttributes = newAttributes;
      

      let innerStruct = this.deepClone(fieldItem.items) || [];
      let setStyleEmpty = (struct) => {
        struct.forEach(i => {
          if (!i.style) {
            i.style = {}
          }
          if (i.items?.length > 0) {
            setStyleEmpty(i.items)
          }
        })
      };
      setStyleEmpty(innerStruct);
      
      let itemSelected = fieldItem;
      
      let _renderDivInItem = (i, idx, arr) => {
        return (
          <div key={(i.viewItemType || 0) + idx} className='col border'>
            <div className='d+ row'>
              <div className='d+ col'>
                <div className='_toUp+ text-center cursor-default' onClick={async e => {
                  let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType' });
                  if (newItemType) {
                    const idxToReplace = arr.findIndex(item => item === i);
                    arr.splice(idxToReplace, 1, { viewItemType: newItemType, style: {}, items: [i], onActions: {}, actionListeners: [] })
                    this.Host.$hostElement.forceUpdate();
                  }
                }}>+</div>
                <div className='row'>
                  <div className='_toLeft+ cursor-default' onClick={async e => {
                    let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType' });
                    if (newItemType) {
                      arr.splice(idx, 0, { viewItemType: newItemType, style: {}, onActions: {}, actionListeners: [] });
                      this.Host.$hostElement.forceUpdate();
                    }
                  }}>+</div>
                  <div className={`_viewItemType ${itemSelected === i ? 'font-bold border-bottom-2' : ''} cursor-pointer`}
                    onContextMenu={async e => {
                      let menuResult = await this.showContextMenu(e, ['Удалить', 'Переименовать', 'Копировать', ...(this.Host.$hostElement.divInDivInnerItemCopy ? ['Вставить вправо', 'Вставить вниз', 'Вставить влево'] : [])]);
                      if (menuResult === 'Удалить') {
                        let ok = await this.showDialog2({ text: `Точно хотите удалить ${i.viewItemType}?` });
                        if (ok) {
                          arr.splice(idx, 1);
                        }
                      }
                      if (menuResult === 'Переименовать') {
                        let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType', inputValue: i.viewItemType });
                        if (newItemType) {
                          i.viewItemType = newItemType
                        }
                      }
                      if (menuResult === 'Копировать') {
                        this._removeContainerReference(i);
                        this._removeDomElementReference(i);
                        this._removeVirtualDomElementReference(i);
                        this.Host.$hostElement.divInDivInnerItemCopy = this.deepClone(i);
                        this._addContainerReference(i);
                      }

                      if (menuResult === 'Вставить вправо') {
                        arr.splice(idx + 1, 0, this.Host.$hostElement.divInDivInnerItemCopy);
                        this.Host.$hostElement.divInDivInnerItemCopy = null;
                      }
                      if (menuResult === 'Вставить вниз') {
                        if (i.items?.length > 0) {
                          i.items = [this.Host.$hostElement.divInDivInnerItemCopy, ...i.items];
                        } else {
                          i.items = [this.Host.$hostElement.divInDivInnerItemCopy];
                        }
                        this.Host.$hostElement.divInDivInnerItemCopy = null;
                      }
                      if (menuResult === 'Вставить влево') {
                        arr.splice(idx, 0, this.Host.$hostElement.divInDivInnerItemCopy);
                        this.Host.$hostElement.divInDivInnerItemCopy = null;
                      }

                      this.Host.$hostElement.forceUpdate();
                    }}
                    onClick={e => {
                      itemSelected = i;
                      newStyleObj = itemSelected.style;
                      newOnActionsObj = itemSelected.onActions
                      newActionListenersArr = itemSelected.actionListeners;
                      newAttributes = itemSelected.attributes;
                      tabItemForFieldWrapper.selectedTabLabel = tabItemForFieldWrapper.items[0].label
                      this.Host.$hostElement.forceUpdate();
                    }}>
                    {i.asPropRender?.isAsPropRenderMode ? i.asPropRender?.propName + '=' : ''}{'<' + (i.viewItemType || 'field') + '>'}
                  </div>
                  <div className='_toRight+ cursor-default' onClick={async e => {
                    let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType' });
                    if (newItemType) {
                      arr.splice(idx + 1, 0, { viewItemType: newItemType, style: {}, onActions: {}, actionListeners: [] });
                      this.Host.$hostElement.forceUpdate();
                    }
                  }}>+</div>
                </div>
                <div className='_toDown+ text-center cursor-default' onClick={async e => {
                  let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType' });
                  if (newItemType) {
                    i.items = [{ viewItemType: newItemType, style: {}, items: i.items || [], onActions: {}, actionListeners: [] }];
                    this.Host.$hostElement.forceUpdate();
                  }
                }}>+</div>
              </div>
              <div className='flex-1'></div>
            </div>
            
            {i.items && i.items.length > 0 && (
              <div className='row'>
                {i.items.map((i2, idx2, arr2) => {
                  return (_renderDivInItem(i2, idx2, arr2))
                })}
              </div>
            )}    
          </div>
        )
      }
            
      const _renderContentPlusCSS = (p) => {
        return (
          <div className='col'>
            {!p?.withoutContent && itemSelected !== fieldItem && (
              <div className='row'>
                {itemSelected.viewItemType !== 'img' && itemSelected.viewItemType !== 'AVIcon' && itemSelected.viewItemType !== 'AVObjectDocument' && (
                  <AVField
                    style={{ width: '150px' }}
                    fieldItem={{
                      label: 'label',
                      dataType: 'string',
                      variant: 'Gazprombank-string',
                      size: 7,
                    }}
                    value={itemSelected.label}
                    onChangeFunc={(value) => itemSelected.label = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                )}
                
                {itemSelected.viewItemType === 'AVObjectDocument' && (
                  <AVField
                    style={{ width: '150px' }}
                    fieldItem={{
                      label: 'objectDocumentPath',
                      dataType: 'string',
                      variant: 'Gazprombank-string',
                      size: 7,
                    }}
                    value={itemSelected.objectDocumentPath}
                    onChangeFunc={(value) => itemSelected.objectDocumentPath = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                )}

                {itemSelected.viewItemType === 'img' && (
                  <div className='flex-1 row'>
                    <AVField
                      style={{ width: '150px' }}
                      fieldItem={{
                        label: 'src',
                        dataType: 'string',
                        variant: 'Gazprombank-string',
                        size: 7,
                      }}
                      value={itemSelected.src}
                      onChangeFunc={(value) => itemSelected.src = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                    <AVField
                      style={{ width: '150px' }}
                      fieldItem={{
                        label: 'objectFit',
                        dataType: 'string',
                        variant: 'Gazprombank-string',
                        size: 7,
                      }}
                      value={newStyleObj.objectFit}
                      onChangeFunc={(value) => newStyleObj.objectFit = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                  </div>
                )}
                {itemSelected.viewItemType === 'AVIcon' && (
                  <div className='flex-1 row'>
                    <AVField
                      style={{ width: '150px' }}
                      fieldItem={{
                        label: 'name',
                        dataType: 'string',
                        variant: 'Gazprombank-string',
                        size: 7,
                      }}
                      value={itemSelected.name}
                      onChangeFunc={(value) => itemSelected.name = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                  </div>
                )}
              </div>
            )}
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexGrow',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexGrow}
                onChangeFunc={(value) => newStyleObj.flexGrow = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexBasis',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexBasis}
                onChangeFunc={(value) => newStyleObj.flexBasis = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'alignSelf',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.alignSelf}
                onChangeFunc={(value) => newStyleObj.alignSelf = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'width',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.width}
                onChangeFunc={(value) => newStyleObj.width = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'height',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.height}
                onChangeFunc={(value) => newStyleObj.height = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'fontSize',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.fontSize}
                onChangeFunc={(value) => newStyleObj.fontSize = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'fontWeight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.fontWeight}
                onChangeFunc={(value) => newStyleObj.fontWeight = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'color',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.color}
                onChangeFunc={(value) => newStyleObj.color = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'background',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.background}
                onChangeFunc={(value) => newStyleObj.background = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>

            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'padding',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.padding}
                onChangeFunc={(value) => newStyleObj.padding = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'margin',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.margin}
                onChangeFunc={(value) => newStyleObj.margin = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'border',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.border}
                onChangeFunc={(value) => newStyleObj.border = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderRadius',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderRadius}
                onChangeFunc={(value) => newStyleObj.borderRadius = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderTop',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderTop}
                onChangeFunc={(value) => newStyleObj.borderTop = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderRight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderRight}
                onChangeFunc={(value) => newStyleObj.borderRight = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderLeft',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderLeft}
                onChangeFunc={(value) => newStyleObj.borderLeft = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderBottom',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderBottom}
                onChangeFunc={(value) => newStyleObj.borderBottom = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'boxShadow',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.boxShadow}
                onChangeFunc={(value) => newStyleObj.boxShadow = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'display',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.display}
                onChangeFunc={(value) => newStyleObj.display = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexDirection',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexDirection}
                onChangeFunc={(value) => newStyleObj.flexDirection = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'alignItems',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.alignItems}
                onChangeFunc={(value) => newStyleObj.alignItems = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'justifyContent',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.justifyContent}
                onChangeFunc={(value) => newStyleObj.justifyContent = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'gap',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.gap}
                onChangeFunc={(value) => newStyleObj.gap = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexWrap',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexWrap}
                onChangeFunc={(value) => newStyleObj.flexWrap = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'position',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.position}
                onChangeFunc={(value) => newStyleObj.position = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'top',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.top}
                onChangeFunc={(value) => newStyleObj.top = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'right',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.right}
                onChangeFunc={(value) => newStyleObj.right = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'bottom',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.bottom}
                onChangeFunc={(value) => newStyleObj.bottom = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'left',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.left}
                onChangeFunc={(value) => newStyleObj.left = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'overflow',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.overflow}
                onChangeFunc={(value) => newStyleObj.overflow = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'cursor',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.cursor}
                onChangeFunc={(value) => newStyleObj.cursor = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'textAlign',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.textAlign}
                onChangeFunc={(value) => newStyleObj.textAlign = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'lineHeight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.lineHeight}
                onChangeFunc={(value) => newStyleObj.lineHeight = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'zIndex',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.zIndex}
                onChangeFunc={(value) => newStyleObj.zIndex = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'opacity',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.opacity}
                onChangeFunc={(value) => newStyleObj.opacity = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'transition',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.transition}
                onChangeFunc={(value) => newStyleObj.transition = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'transform',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.transform}
                onChangeFunc={(value) => newStyleObj.transform = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'animation',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.animation}
                onChangeFunc={(value) => newStyleObj.animation = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>

          </div>
        )
      }
      
      const FieldWrapper = this.FieldWrapper;
      
      let tabItemForFieldWrapper;
      let getTabItemForFieldWrapper = function() {
        let propsTab;
        let mapTab;
        let asPropRenderTab;
        if (itemSelected !== fieldItem) {
          propsTab = {
            viewItemType: 'tab',
            label: 'props',
            onClickFunc: () => {
              if (!itemSelected.props) {
                itemSelected.props = []
              }

              this.Host.$hostElement.forceUpdate();
            },
            renderCustomBody: () => {
              return (
                <div>
                  <AVField
                    fieldItem={{
                      label: 'props',
                      dataType: 'array',
                      labelPosition: 'top',
                      items: [{
                        name: 'propName',
                        gridColumnWidth: '200px',
                      },
                      {
                        name: 'propValue',
                        label: 'propValue',
                        dataType: 'string',
                        // variant: 'textarea'
                      },
                      {
                        name: 'type',
                        label: 'type',
                        dataType: 'string',
                        variant: 'select',
                        valuesList: ['string', 'number', 'boolean', 'dispatch', 'objDocFromClassByFunction', 'functionWithThis'],
                        gridColumnWidth: '200px',
                      }]
                    }}
                    value={itemSelected?.props}
                    onChangeFunc={(value) => itemSelected.props = value}
                  ></AVField>
                </div>
              )
            },
          };
          mapTab = {
            viewItemType: 'tab',
            label: 'map',
            onClickFunc: () => {
              if (!itemSelected.map) {
                itemSelected.map = {}
              }

              this.Host.$hostElement.forceUpdate();
            },
            renderCustomBody: () => {
              return (
                <div>
                  <AVField
                    fieldItem={{
                      label: 'isMapMode',
                      dataType: 'boolean',
                    }}
                    value={itemSelected.map?.isMapMode}
                    onChangeFunc={(value) => itemSelected.map.isMapMode = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                  <AVField
                    fieldItem={{
                      label: 'sourceClassName',
                      dataType: 'string',
                    }}
                    value={itemSelected.map?.sourceClassName}
                    onChangeFunc={(value) => itemSelected.map.sourceClassName = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                  <AVField
                    fieldItem={{
                      label: 'transformationFunction(return objDocArr)',
                      dataType: 'string',
                      variant: 'textarea'
                    }}
                    value={itemSelected.map?.transformationFunction}
                    onChangeFunc={(value) => itemSelected.map.transformationFunction = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>


                  {/* <AVField
                    fieldItem={{
                      label: 'sourceClassPath',
                      dataType: 'string',
                    }}
                    value={itemSelected.map?.sourceClassPath}
                    onChangeFunc={(value) => itemSelected.map.sourceClassPath = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField> */}
                </div>
              )
            },
          }
          asPropRenderTab = {
            viewItemType: 'tab',
            label: 'asPropRender',
            onClickFunc: () => {
              if (!itemSelected.asPropRender) {
                itemSelected.asPropRender = {}
              }

              this.Host.$hostElement.forceUpdate();
            },
            renderCustomBody: () => {
              return (
                <div>
                  <AVField
                    fieldItem={{
                      label: 'isAsPropRenderMode',
                      dataType: 'boolean',
                    }}
                    value={itemSelected.asPropRender?.isAsPropRenderMode}
                    onChangeFunc={(value) => itemSelected.asPropRender.isAsPropRenderMode = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                  <AVField
                    fieldItem={{
                      label: 'propName',
                      dataType: 'string',
                    }}
                    value={itemSelected.asPropRender?.propName}
                    onChangeFunc={(value) => itemSelected.asPropRender.propName = value}
                    onBlurFunc={e => {
                      this.Host.$hostElement.forceUpdate();
                    }}
                  ></AVField>
                </div>
              )
            },

          }
        }
        let tabsObj = {
          selectedTabLabel: tabItemForFieldWrapper?.selectedTabLabel || 'content+css',
          viewItemType: 'tabs',
          items: [
            {
              viewItemType: 'tab',
              label: 'content+css',
              onClickFunc: () => {
                newStyleObj = itemSelected === fieldItem ? rootStyleObj : itemSelected.style;
                this.Host.$hostElement.forceUpdate();
              },
              renderCustomBody: () => {
                return _renderContentPlusCSS()
              },
            },
            {
              viewItemType: 'tab',
              label: 'css(:hover)',
              onClickFunc: () => {
                if (!itemSelected.hoverStyle) {
                  itemSelected.hoverStyle = {}
                }
                newStyleObj = itemSelected === fieldItem ? rootHoverStyleObj : itemSelected.hoverStyle;
                this.Host.$hostElement.forceUpdate();
              },
              renderCustomBody: () => {
                return _renderContentPlusCSS({ withoutContent: true })
              },
            },
            {
              viewItemType: 'tab',
              label: 'attributes',
              onClickFunc: () => {
                if (!itemSelected.attributes) {
                  itemSelected.attributes = {}
                }

                newAttributes = itemSelected === fieldItem ? rootAttributes : itemSelected.attributes;
                this.Host.$hostElement.forceUpdate();
              },
              renderCustomBody: () => {
                return (
                  <div>
                    <AVField
                      fieldItem={{
                        label: 'title',
                        dataType: 'string',
                      }}
                      value={newAttributes?.title}
                      onChangeFunc={(value) => newAttributes.title = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                    <AVField
                      fieldItem={{
                        label: 'id',
                        dataType: 'string',
                      }}
                      value={newAttributes?.id}
                      onChangeFunc={(value) => newAttributes.id = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                  </div>
                )
              },
            },
            {
              viewItemType: 'tab',
              label: 'onActions',
              onClickFunc: () => {
                if (!itemSelected.onActions) {
                  itemSelected.onActions = {}
                }

                newOnActionsObj = itemSelected === fieldItem ? rootOnActionsObj : itemSelected.onActions;
                this.Host.$hostElement.forceUpdate();
              },
              renderCustomBody: () => {
                return (
                  <div>
                    <AVField
                      fieldItem={{
                        label: 'onClick',
                        dataType: 'string',
                      }}
                      value={newOnActionsObj?.onClick}
                      onChangeFunc={(value) => newOnActionsObj.onClick = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                    <AVField
                      fieldItem={{
                        label: 'onMouseEnter',
                        dataType: 'string',
                      }}
                      value={newOnActionsObj?.onMouseEnter}
                      onChangeFunc={(value) => newOnActionsObj.onMouseEnter = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                    <AVField
                      fieldItem={{
                        label: 'onMouseLeave',
                        dataType: 'string',
                      }}
                      value={newOnActionsObj?.onMouseLeave}
                      onChangeFunc={(value) => newOnActionsObj.onMouseLeave = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                  </div>
                )
              },
            },
            {
              viewItemType: 'tab',
              label: 'Action Listeners',
              onClickFunc: () => {
                if (!itemSelected.actionListeners) {
                  itemSelected.actionListeners = []
                }

                newActionListenersArr = itemSelected === fieldItem ? rootActionListenersArr : itemSelected.actionListeners;
                this.Host.$hostElement.forceUpdate();
              },
              renderCustomBody: () => {
                return (
                  <div>
                    <AVField
                      fieldItem={{
                        label: 'Action Listeners (Встроенные: Outclick (по id), componentDidMount, constructor)',
                        dataType: 'array',
                        labelPosition: 'top',
                        items: [{
                          name: 'actionName',
                          gridColumnWidth: '400px',
                        }, {
                          name: 'actionHandlerFunction',
                          label: 'actionHandlerFunction(this, item, $objectDocument, e||e[], sourceAVFieldComponent, sourceObjDoc)',
                          dataType: 'string',
                          variant: 'textarea'
                        }]
                      }}
                      value={newActionListenersArr}
                      onChangeFunc={(value) => newActionListenersArr = value}
                      onBlurFunc={e => {
                        this.Host.$hostElement.forceUpdate();
                      }}
                    ></AVField>
                  </div>
                )
              },
            },
          ]
        };
        
        if (propsTab) {
          tabsObj.items.splice(3, 0, propsTab);
        }
        if (mapTab) {
          tabsObj.items.splice(6, 0, mapTab);
        }
        if (asPropRenderTab) {
          tabsObj.items.splice(7, 0, asPropRenderTab);
        }
        return tabsObj;
      };
      
      getTabItemForFieldWrapper = getTabItemForFieldWrapper.bind(this);
      
      tabItemForFieldWrapper = getTabItemForFieldWrapper();

      
      const ok = await this.showDialog({
        content: () => (
          <div className='_dialog-content-divInDiv scroll-y' style={{ width: '90vw', height: '90vh' }}>
            <div className='margin-left-16'>
              {[<br></br>,
                `Дизайнер div в div-е. Текущий ${itemSelected === fieldItem ? 'root(space div)' : ((itemSelected.label && (itemSelected.viewItemType + '(' + itemSelected.label + ')')) || (itemSelected.viewItemType + '(' + itemSelected.items?.map(o => o.viewItemType).toString() + ')'))} style: ${JSON.stringify(newStyleObj)}`,
              <div className='margin-bottom-8'></div>,
              ]}
            </div>
            <div className='row margin-left-16'>
              <div className='col'>
                <div className={`${itemSelected === fieldItem ? 'font-bold border-bottom-2' : ''} cursor-pointer`} onClick={e => {
                  itemSelected = fieldItem;
                  newStyleObj = rootStyleObj;
                  newOnActionsObj = rootOnActionsObj;
                  newActionListenersArr = rootActionListenersArr;
                  newAttributes = rootAttributes;
                  tabItemForFieldWrapper.selectedTabLabel = tabItemForFieldWrapper.items[0].label
                  this.Host.$hostElement.forceUpdate();
                }}>root(space div)<AVButton onClick={() => {
                    this.Host.$hostElement.divInDivItemsCopy = this.deepClone(innerStruct);
                    // this.Host.$hostElement.divInDivRootStyle = this.deepClone(rootStyleObj);
                    
                    this.Host.$hostElement.divInDivFieldItemCopy = this.deepClone(fieldItem);
  
                  }}>Копировать структуру</AVButton>{this.Host.$hostElement.divInDivItemsCopy && (<AVButton onClick={() => {
                    innerStruct = this.Host.$hostElement.divInDivItemsCopy;
                    
                    rootStyleObj = this.Host.$hostElement.divInDivFieldItemCopy.viewItemRootStyle;
                    rootHoverStyleObj = this.Host.$hostElement.divInDivFieldItemCopy.viewItemRootHoverStyle;
                    
                    rootOnActionsObj = this.Host.$hostElement.divInDivFieldItemCopy.onActions;
                    rootActionListenersArr = this.Host.$hostElement.divInDivFieldItemCopy.actionListeners;
                    rootAttributes = this.Host.$hostElement.divInDivFieldItemCopy.attributes;    
                    

                    newStyleObj = rootStyleObj;
                    
                    newOnActionsObj = rootOnActionsObj;
                    newActionListenersArr = rootActionListenersArr;
                    newAttributes = rootAttributes;
                    

                    
                    this.Host.$hostElement.divInDivItemsCopy = null;
                    this.Host.$hostElement.divInDivFieldItemCopy = null;
                    // this.Host.$hostElement.divInDivRootStyle = null;
                    this.Host.$hostElement.forceUpdate();
                  }}>Вставить копию</AVButton>)}</div>
                <div onClick={async e => {
                  let newItemType = await this.showDialog2({ text: 'Введите viewItemType(d, b, img, AVIcon, AVObjectDocument, vertical-layout, vkui_v7(*))', inputLabel: 'viewItemType' });
                  if (newItemType) {
                    if (innerStruct.length === 0) {
                      innerStruct = [{ viewItemType: newItemType, style: {}, onActions: {}, actionListeners: [] }]
                    } else {
                      innerStruct = [{ viewItemType: newItemType, style: {}, onActions: {}, actionListeners: [], items: innerStruct }]
                    }
                    this.Host.$hostElement.forceUpdate();

                  }
                }}>+</div>
              </div>
              <div className='flex-1'></div>
            </div>
            <div className='margin-left-16'>
              <div className='row'>
                {innerStruct.map((i, idx, arr) => {
                  return (_renderDivInItem(i, idx, arr))
                })}
              </div>
            </div>
            <div style={{ height: '16px' }}></div>
            <FieldWrapper
              $objDoc={this}
              fieldItem={(() => {
                tabItemForFieldWrapper = getTabItemForFieldWrapper();
                return tabItemForFieldWrapper;
              })()}
            ></FieldWrapper>
            
          </div>
        ),
        // inputLabel: 'style object'
      });
      if (ok) {
        if (innerStruct.length > 0) {
          let cleanEmptyProps = (arr = []) => {
            arr.forEach(i => {
              if (i.style) {
                Object.keys(i.style).forEach(propName => {
                  if (i.style[propName] === 'delete' || i.style[propName] === '') {
                    delete i.style[propName];
                  }
                })
              }
              cleanEmptyProps(i.items)
            })
          }
          cleanEmptyProps(innerStruct)

          fieldItem.items = innerStruct;
          this.forceUpdate();
        }
        if (!this.isDeepEqual(rootStyleObj, oldStyleObj)) {
          fieldItem.viewItemRootStyle = { ...rootStyleObj };
          Object.keys(rootStyleObj).forEach(propName => {
            if (rootStyleObj[propName] === 'delete' || rootStyleObj[propName] === '') {
              delete fieldItem.viewItemRootStyle[propName];
            }
          })
          this.forceUpdate();
        }
        if (!this.isDeepEqual(rootHoverStyleObj, fieldItem.viewItemRootHoverStyle)) {
          fieldItem.viewItemRootHoverStyle = { ...rootHoverStyleObj };
          Object.keys(rootHoverStyleObj).forEach(propName => {
            if (rootHoverStyleObj[propName] === 'delete' || rootHoverStyleObj[propName] === '') {
              delete fieldItem.viewItemRootHoverStyle[propName];
            }
          })
          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(rootOnActionsObj, fieldItem.onActions)) {
          fieldItem.onActions = { ...rootOnActionsObj };
          Object.keys(rootHoverStyleObj).forEach(propName => {
            if (rootOnActionsObj[propName] === 'delete' || rootOnActionsObj[propName] === '') {
              delete fieldItem.onActions[propName];
            }
          })
          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(rootActionListenersArr, fieldItem.actionListeners)) {
          fieldItem.actionListeners = [...rootActionListenersArr];
          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(rootAttributes, fieldItem.attributes)) {
          fieldItem.attributes = {...rootAttributes};
          this.forceUpdate();
        }
        
        fieldItem.isHotReload = true; // will be deleted in AVField didUpdate

      }
    }
    
    if (menuResult === 'Установить style для tabs структуры') {
      let oldViewItemRootStyleObj = fieldItem.viewItemRootStyle;
      let oldTabHeadStyleObj = fieldItem.tabHeadStyle;
      
      let oldTabHeadItemStyleObj = fieldItem.tabHeadItemStyle;
      let oldTabHeadItemHoveredStyleObj = fieldItem.tabHeadItemHoveredStyle;
      let oldSelectedTabHeadItemStyleObj = fieldItem.selectedTabHeadItemStyle;
      let oldSelectedTabHeadItemHoveredStyleObj = fieldItem.selectedTabHeadItemHoveredStyle;
      //ItemLabel для полного контроля над табами
      let oldTabHeadItemLabelStyleObj = fieldItem.tabHeadItemLabelStyle;
      let oldTabHeadItemLabelHoveredStyleObj = fieldItem.tabHeadItemLabelHoveredStyle;
      let oldSelectedTabHeadItemLabelStyleObj = fieldItem.selectedTabHeadItemLabelStyle;
      let oldSelectedTabHeadItemLabelHoveredStyleObj = fieldItem.selectedTabHeadItemLabelHoveredStyle;

      
      let oldTabBodyContainerStyleObj = fieldItem.tabBodyContainerStyle;

      let newStyleObj = { ...oldViewItemRootStyleObj };
      
      let rootStyleObj = newStyleObj;
      let tabHeadStyleObj = { ...oldTabHeadStyleObj };
      
      let tabHeadItemStyleObj = { ...oldTabHeadItemStyleObj };
      let tabHeadItemHoveredStyleObj = { ...oldTabHeadItemHoveredStyleObj };
      let selectedTabHeadItemStyleObj = { ...oldSelectedTabHeadItemStyleObj };
      let selectedTabHeadItemHoveredStyleObj = { ...oldSelectedTabHeadItemHoveredStyleObj };
      //ItemLabel
      let tabHeadItemLabelStyleObj = { ...oldTabHeadItemLabelStyleObj };
      let tabHeadItemLabelHoveredStyleObj = { ...oldTabHeadItemLabelHoveredStyleObj };
      let selectedTabHeadItemLabelStyleObj = { ...oldSelectedTabHeadItemLabelStyleObj };
      let selectedTabHeadItemLabelHoveredStyleObj = { ...oldSelectedTabHeadItemLabelHoveredStyleObj };


      
      let tabBodyContainerStyleObj = { ...oldTabBodyContainerStyleObj };

      const ok = await this.showDialog({
        content: () => (
          <div className='scroll-y' style={{ width: '100vw', height: '90vh' }}>
            <div className='margin-left-16'>
              {[<br></br>,
                `Установить style для tabs структуры. Текущий style: ${JSON.stringify(newStyleObj)}`,
              <div className='margin-bottom-8'></div>,
              ]}
            </div>
            <div className='row margin-left-16'>
              <div className='col'>
                <div className={`${newStyleObj === rootStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = rootStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>root(tabs)</div>
                
                <div className={`${newStyleObj === tabHeadStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabHeadStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabHead(tabs)</div>
                
                <div className='pad-8'></div>
                
                <div className={`${newStyleObj === tabHeadItemStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabHeadItemStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabHead-Item(tabs)</div>
                <div className={`${newStyleObj === tabHeadItemHoveredStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabHeadItemHoveredStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabHead-Item-Hovered(tabs)</div>
                <div className={`${newStyleObj === selectedTabHeadItemStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = selectedTabHeadItemStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>selected-TabHead-Item(tabs)</div>
                <div className={`${newStyleObj === selectedTabHeadItemHoveredStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = selectedTabHeadItemHoveredStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>selected-TabHead-Item-Hovered(tabs)</div>

                <div className='pad-8'></div>
                
                <div className={`${newStyleObj === tabHeadItemLabelStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabHeadItemLabelStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabHead-Item-Label(tabs)</div>
                <div className={`${newStyleObj === tabHeadItemLabelHoveredStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabHeadItemLabelHoveredStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabHead-Item-Label-Hovered(tabs)</div>
                <div className={`${newStyleObj === selectedTabHeadItemLabelStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = selectedTabHeadItemLabelStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>selected-TabHead-Item-Label(tabs)</div>
                <div className={`${newStyleObj === selectedTabHeadItemLabelHoveredStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = selectedTabHeadItemLabelHoveredStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>selected-TabHead-Item-Label-Hovered(tabs)</div>
                
                <div className='pad-8'></div>

                <div className={`${newStyleObj === tabBodyContainerStyleObj ? 'font-bold' : ''} cursor-pointer`} onClick={e => {
                  newStyleObj = tabBodyContainerStyleObj;
                  this.Host.$hostElement.forceUpdate();
                }}>tabBodyContainer(tabs)</div>

              </div>
              <div className='flex-1'></div>
            </div>
            <div style={{ height: '16px' }}></div>
            <div className='col'>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'flexGrow',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.flexGrow}
                  onChangeFunc={(value) => newStyleObj.flexGrow = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'flexBasis',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.flexBasis}
                  onChangeFunc={(value) => newStyleObj.flexBasis = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'alignSelf',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.alignSelf}
                  onChangeFunc={(value) => newStyleObj.alignSelf = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'width',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.width}
                  onChangeFunc={(value) => newStyleObj.width = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'height',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.height}
                  onChangeFunc={(value) => newStyleObj.height = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'fontSize',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.fontSize}
                  onChangeFunc={(value) => newStyleObj.fontSize = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'fontWeight',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.fontWeight}
                  onChangeFunc={(value) => newStyleObj.fontWeight = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'color',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.color}
                  onChangeFunc={(value) => newStyleObj.color = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'background',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.background}
                  onChangeFunc={(value) => newStyleObj.background = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>

              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'padding',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.padding}
                  onChangeFunc={(value) => newStyleObj.padding = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'margin',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.margin}
                  onChangeFunc={(value) => newStyleObj.margin = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'border',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.border}
                  onChangeFunc={(value) => newStyleObj.border = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'borderRadius',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.borderRadius}
                  onChangeFunc={(value) => newStyleObj.borderRadius = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'borderTop',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.borderTop}
                  onChangeFunc={(value) => newStyleObj.borderTop = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'borderRight',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.borderRight}
                  onChangeFunc={(value) => newStyleObj.borderRight = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'borderLeft',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.borderLeft}
                  onChangeFunc={(value) => newStyleObj.borderLeft = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'borderBottom',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.borderBottom}
                  onChangeFunc={(value) => newStyleObj.borderBottom = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'boxShadow',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.boxShadow}
                  onChangeFunc={(value) => newStyleObj.boxShadow = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'display',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.display}
                  onChangeFunc={(value) => newStyleObj.display = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'flexDirection',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.flexDirection}
                  onChangeFunc={(value) => newStyleObj.flexDirection = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'alignItems',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.alignItems}
                  onChangeFunc={(value) => newStyleObj.alignItems = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'justifyContent',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.justifyContent}
                  onChangeFunc={(value) => newStyleObj.justifyContent = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'gap',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.gap}
                  onChangeFunc={(value) => newStyleObj.gap = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'flexWrap',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.flexWrap}
                  onChangeFunc={(value) => newStyleObj.flexWrap = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'position',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.position}
                  onChangeFunc={(value) => newStyleObj.position = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'top',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.top}
                  onChangeFunc={(value) => newStyleObj.top = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'right',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.right}
                  onChangeFunc={(value) => newStyleObj.right = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'bottom',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.bottom}
                  onChangeFunc={(value) => newStyleObj.bottom = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'left',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.left}
                  onChangeFunc={(value) => newStyleObj.left = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'overflow',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.overflow}
                  onChangeFunc={(value) => newStyleObj.overflow = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'cursor',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.cursor}
                  onChangeFunc={(value) => newStyleObj.cursor = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'textAlign',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.textAlign}
                  onChangeFunc={(value) => newStyleObj.textAlign = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'lineHeight',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.lineHeight}
                  onChangeFunc={(value) => newStyleObj.lineHeight = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'zIndex',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.zIndex}
                  onChangeFunc={(value) => newStyleObj.zIndex = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'opacity',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.opacity}
                  onChangeFunc={(value) => newStyleObj.opacity = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>
              <div className='row'>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'transition',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.transition}
                  onChangeFunc={(value) => newStyleObj.transition = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'transform',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.transform}
                  onChangeFunc={(value) => newStyleObj.transform = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
                <AVField
                  style={{ width: '150px' }}
                  fieldItem={{
                    label: 'animation',
                    dataType: 'string',
                    variant: 'Gazprombank-string',
                    size: 7,
                  }}
                  value={newStyleObj?.animation}
                  onChangeFunc={(value) => newStyleObj.animation = value}
                  onBlurFunc={e => {
                    this.Host.$hostElement.forceUpdate();
                  }}
                ></AVField>
              </div>

            </div>
          </div>
        ),
        // inputLabel: 'style object'
      });
      if (ok) {

        if (!this.isDeepEqual(rootStyleObj, oldViewItemRootStyleObj)) {
          fieldItem.viewItemRootStyle = { ...rootStyleObj };
          Object.keys(rootStyleObj).forEach(propName => {
            if (rootStyleObj[propName] === 'delete' || rootStyleObj[propName] === '') {
              delete fieldItem.viewItemRootStyle[propName];
            }
          })

          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(tabHeadStyleObj, oldTabHeadStyleObj)) {
          fieldItem.tabHeadStyle = { ...tabHeadStyleObj };
          Object.keys(tabHeadStyleObj).forEach(propName => {
            if (tabHeadStyleObj[propName] === 'delete' || tabHeadStyleObj[propName] === '') {
              delete fieldItem.tabHeadStyle[propName];
            }
          })

          this.forceUpdate();
        }
        if (!this.isDeepEqual(tabHeadItemStyleObj, oldTabHeadItemStyleObj)) {
          fieldItem.tabHeadItemStyle = { ...tabHeadItemStyleObj };
          Object.keys(tabHeadItemStyleObj).forEach(propName => {
            if (tabHeadItemStyleObj[propName] === 'delete' || tabHeadItemStyleObj[propName] === '') {
              delete fieldItem.tabHeadItemStyle[propName];
            }
          })

          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(tabHeadItemHoveredStyleObj, oldTabHeadItemHoveredStyleObj)) {
          fieldItem.tabHeadItemHoveredStyle = { ...tabHeadItemHoveredStyleObj };
          Object.keys(tabHeadItemHoveredStyleObj).forEach(propName => {
            if (tabHeadItemHoveredStyleObj[propName] === 'delete' || tabHeadItemHoveredStyleObj[propName] === '') {
              delete fieldItem.tabHeadItemHoveredStyle[propName];
            }
          })

          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(selectedTabHeadItemStyleObj, oldSelectedTabHeadItemStyleObj)) {
          fieldItem.selectedTabHeadItemStyle = { ...selectedTabHeadItemStyleObj };
          Object.keys(selectedTabHeadItemStyleObj).forEach(propName => {
            if (selectedTabHeadItemStyleObj[propName] === 'delete' || selectedTabHeadItemStyleObj[propName] === '') {
              delete fieldItem.selectedTabHeadItemStyle[propName];
            }
          })

          this.forceUpdate();
        }
        
        if (!this.isDeepEqual(selectedTabHeadItemHoveredStyleObj, oldSelectedTabHeadItemHoveredStyleObj)) {
          fieldItem.selectedTabHeadItemHoveredStyle = { ...selectedTabHeadItemHoveredStyleObj };
          Object.keys(selectedTabHeadItemHoveredStyleObj).forEach(propName => {
            if (selectedTabHeadItemHoveredStyleObj[propName] === 'delete' || selecselectedTabHeadItemHoveredStyleObjtedTabHeadItemStyleObj[propName] === '') {
              delete fieldItem.selectedTabHeadItemHoveredStyle[propName];
            }
          })

          this.forceUpdate();
        }


        if (!this.isDeepEqual(tabHeadItemLabelStyleObj, oldTabHeadItemLabelStyleObj)) {
          fieldItem.tabHeadItemLabelStyle = { ...tabHeadItemLabelStyleObj };
          Object.keys(tabHeadItemLabelStyleObj).forEach(propName => {
            if (tabHeadItemLabelStyleObj[propName] === 'delete' || tabHeadItemLabelStyleObj[propName] === '') {
              delete fieldItem.tabHeadItemLabelStyle[propName];
            }
          })

          this.forceUpdate();
        }

        if (!this.isDeepEqual(tabHeadItemLabelHoveredStyleObj, oldTabHeadItemLabelHoveredStyleObj)) {
          fieldItem.tabHeadItemLabelHoveredStyle = { ...tabHeadItemLabelHoveredStyleObj };
          Object.keys(tabHeadItemLabelHoveredStyleObj).forEach(propName => {
            if (tabHeadItemLabelHoveredStyleObj[propName] === 'delete' || tabHeadItemLabelHoveredStyleObj[propName] === '') {
              delete fieldItem.tabHeadItemLabelHoveredStyle[propName];
            }
          })

          this.forceUpdate();
        }

        if (!this.isDeepEqual(selectedTabHeadItemLabelStyleObj, oldSelectedTabHeadItemLabelStyleObj)) {
          fieldItem.selectedTabHeadItemLabelStyle = { ...selectedTabHeadItemLabelStyleObj };
          Object.keys(selectedTabHeadItemLabelStyleObj).forEach(propName => {
            if (selectedTabHeadItemLabelStyleObj[propName] === 'delete' || selectedTabHeadItemLabelStyleObj[propName] === '') {
              delete fieldItem.selectedTabHeadItemLabelStyle[propName];
            }
          })

          this.forceUpdate();
        }

        if (!this.isDeepEqual(selectedTabHeadItemLabelHoveredStyleObj, oldSelectedTabHeadItemLabelHoveredStyleObj)) {
          fieldItem.selectedTabHeadItemLabelHoveredStyle = { ...selectedTabHeadItemLabelHoveredStyleObj };
          Object.keys(selectedTabHeadItemLabelHoveredStyleObj).forEach(propName => {
            if (selectedTabHeadItemLabelHoveredStyleObj[propName] === 'delete' || selecselectedTabHeadItemLabelHoveredStyleObjtedTabHeadItemStyleObj[propName] === '') {
              delete fieldItem.selectedTabHeadItemLabelHoveredStyle[propName];
            }
          })

          this.forceUpdate();
        }

        
        
        
        if (!this.isDeepEqual(tabBodyContainerStyleObj, oldTabBodyContainerStyleObj)) {
          fieldItem.tabBodyContainerStyle = { ...tabBodyContainerStyleObj };
          Object.keys(tabBodyContainerStyleObj).forEach(propName => {
            if (tabBodyContainerStyleObj[propName] === 'delete' || tabBodyContainerStyleObj[propName] === '') {
              delete fieldItem.tabBodyContainerStyle[propName];
            }
          })
          this.forceUpdate();
        }

      }
    }
    
    if (menuResult === 'Установить style') {      
      let styleAfterDialog = await this._enterNewStyleObj(fieldItem.style);
      
      if (styleAfterDialog) {
        if (!fieldItem.style) fieldItem.style = {};
        const styleObj = styleAfterDialog;
        fieldItem.style = { ...fieldItem.style, ...styleObj };
        Object.keys(styleObj).forEach(propName => {
          if (styleObj[propName] === 'delete' || styleObj[propName] === '') {
            delete fieldItem.style[propName];
          }
        })
        this.forceUpdate();
      }
    }
    if (menuResult === 'Сбросить style') {
        fieldItem.style = null;
        this.forceUpdate();
    }
    if (menuResult === 'Установить buttonStyle') {
      let styleAfterDialog = await this._enterNewStyleObj(fieldItem.buttonStyle);

      if (styleAfterDialog) {
        if (!fieldItem.buttonStyle) fieldItem.buttonStyle = {};
        const styleObj = styleAfterDialog;
        fieldItem.buttonStyle = { ...fieldItem.buttonStyle, ...styleObj };
        Object.keys(styleObj).forEach(propName => {
          if (styleObj[propName] === 'delete' || styleObj[propName] === '') {
            delete fieldItem.buttonStyle[propName];
          }
        })
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

      let styleAfterDialog = await this._enterNewStyleObj(containerItem.style);

      if (styleAfterDialog) {
        if (!containerItem.style) containerItem.style = {};
        const styleObj = styleAfterDialog;
        containerItem.style = { ...containerItem.style, ...styleObj };
        Object.keys(styleObj).forEach(propName => {
          if (styleObj[propName] === 'delete' || styleObj[propName] === '') {
            delete containerItem.style[propName];
          }
        })
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

      let styleAfterDialog = await this._enterNewStyleObj(containerItem.style);

      if (styleAfterDialog) {
        if (!containerItem.style) containerItem.style = {};
        const styleObj = styleAfterDialog;
        containerItem.style = { ...containerItem.style, ...styleObj };
        Object.keys(styleObj).forEach(propName => {
          if (styleObj[propName] === 'delete' || styleObj[propName] === '') {
            delete containerItem.style[propName];
          }
        })
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
        text: ['Введите имя presentationGroup, пример: Регион',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${fieldItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        inputValue: fieldItem.presentationGroup
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
        text: ['Введите имя presentationGroup, пример: Регион',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${containerItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        inputValue: containerItem.presentationGroup
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
        text: ['Введите имя presentationGroup, пример: Регион',
          <br></br>,
          'Значение строковое, для сброса передайте пустую строку',
          <br></br>,
          `Текущий presentationGroup: ${containerItem.presentationGroup}`
        ],
        inputLabel: 'presentationGroup',
        inputValue: containerItem.presentationGroup
      });
      if (typeof presentationGroup === 'string') {
        containerItem.presentationGroup = presentationGroup;
        this.forceUpdate();
      }
    }
  }

  _enterNewStyleObj = async (oldStyleObj) => {
    let newStyleObj = { ...oldStyleObj };
    
    const ok = await this.showDialog({
      // text: ['Введите объект style,пример: {"background": "inherit"}',
      //   <br></br>,
      //   'Происходит мерджинг объекта, а не замена',
      //   <br></br>,
      //   `Текущий style: ${JSON.stringify(fieldItem.style)}`,
      //   <br></br>,
      //   'Пример удаления: {"position": "delete"}'
      // ],
      content: () => (
        <div style={{ width: '100vw', height: '90vh' }}>
          <div>
            {[<br></br>,
              `Установка style. Текущий style: ${JSON.stringify(oldStyleObj)}`,
              <div className='margin-bottom-8'></div>,
            ]}
          </div>
          <div className='col'>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexGrow',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexGrow}
                onChangeFunc={(value) => newStyleObj.flexGrow = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexBasis',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexBasis}
                onChangeFunc={(value) => newStyleObj.flexBasis = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'alignSelf',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.alignSelf}
                onChangeFunc={(value) => newStyleObj.alignSelf = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'width',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.width}
                onChangeFunc={(value) => newStyleObj.width = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'height',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={oldStyleObj?.height}
                onChangeFunc={(value) => newStyleObj.height = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'fontSize',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.fontSize}
                onChangeFunc={(value) => newStyleObj.fontSize = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'fontWeight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.fontWeight}
                onChangeFunc={(value) => newStyleObj.fontWeight = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'color',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.color}
                onChangeFunc={(value) => newStyleObj.color = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'background',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.background}
                onChangeFunc={(value) => newStyleObj.background = value}
              ></AVField>

            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'padding',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.padding}
                onChangeFunc={(value) => newStyleObj.padding = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'margin',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.margin}
                onChangeFunc={(value) => newStyleObj.margin = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'border',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.border}
                onChangeFunc={(value) => newStyleObj.border = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderRadius',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderRadius}
                onChangeFunc={(value) => newStyleObj.borderRadius = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderTop',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderTop}
                onChangeFunc={(value) => newStyleObj.borderTop = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderRight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderRight}
                onChangeFunc={(value) => newStyleObj.borderRight = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderLeft',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderLeft}
                onChangeFunc={(value) => newStyleObj.borderLeft = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'borderBottom',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.borderBottom}
                onChangeFunc={(value) => newStyleObj.borderBottom = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>

            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'boxShadow',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.boxShadow}
                onChangeFunc={(value) => newStyleObj.boxShadow = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'display',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.display}
                onChangeFunc={(value) => newStyleObj.display = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexDirection',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexDirection}
                onChangeFunc={(value) => newStyleObj.flexDirection = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'alignItems',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.alignItems}
                onChangeFunc={(value) => newStyleObj.alignItems = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'justifyContent',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.justifyContent}
                onChangeFunc={(value) => newStyleObj.justifyContent = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'gap',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.gap}
                onChangeFunc={(value) => newStyleObj.gap = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'flexWrap',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.flexWrap}
                onChangeFunc={(value) => newStyleObj.flexWrap = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'position',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.position}
                onChangeFunc={(value) => newStyleObj.position = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'top',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.top}
                onChangeFunc={(value) => newStyleObj.top = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'right',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.right}
                onChangeFunc={(value) => newStyleObj.right = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'bottom',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.bottom}
                onChangeFunc={(value) => newStyleObj.bottom = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'left',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.left}
                onChangeFunc={(value) => newStyleObj.left = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'transform',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.transform}
                onChangeFunc={(value) => newStyleObj.transform = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'cursor',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.cursor}
                onChangeFunc={(value) => newStyleObj.cursor = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'textAlign',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.textAlign}
                onChangeFunc={(value) => newStyleObj.textAlign = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'lineHeight',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.lineHeight}
                onChangeFunc={(value) => newStyleObj.lineHeight = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'zIndex',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.zIndex}
                onChangeFunc={(value) => newStyleObj.zIndex = value}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'opacity',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.opacity}
                onChangeFunc={(value) => newStyleObj.opacity = value}
              ></AVField>
            </div>
            <div className='row'>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'transition',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.transition}
                onChangeFunc={(value) => newStyleObj.transition = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'transform',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.transform}
                onChangeFunc={(value) => newStyleObj.transform = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
              <AVField
                style={{ width: '150px' }}
                fieldItem={{
                  label: 'animation',
                  dataType: 'string',
                  variant: 'Gazprombank-string',
                  size: 7,
                }}
                value={newStyleObj?.animation}
                onChangeFunc={(value) => newStyleObj.animation = value}
                onBlurFunc={e => {
                  this.Host.$hostElement.forceUpdate();
                }}
              ></AVField>
            </div>

          </div>
        </div>
      ),
      // inputLabel: 'style object'
    });
    if (ok) {
      return newStyleObj
    } else {
      return false
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
      const newTabLabel = await this.showDialog({text: 'Введите label вкладки', inputLabel: 'label', inputValue: tab.label});
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
      const newUrl = await this.showDialog({ text: 'Введите url ссылки', inputLabel: 'url', inputValue: tab.redirectToUrl });
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
    if (dropContainer.container && dropContainer.container.viewItemType !== 'tab') {
      this._removeDragBorderFromDomELement(dropContainer.container.domElement)
    }
    this.state.designDropTargetLevel2 = null;

    if (elemRect.left + elemRect.width / 10 > e.pageX) {
      if (elemRect.left + elemRect.width * 0.05 > e.pageX) {
        if (dropContainer.viewItemType === 'vertical-layout' && dropContainer.container && dropContainer.container.viewItemType !== 'tab') {
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
          if (dropContainer.viewItemType === 'vertical-layout' && dropContainer.container && dropContainer.container.viewItemType !== 'tab') {
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
    domELement?.classList.remove('border-top-4');
    domELement?.classList.remove('border-bottom-4');
    domELement?.classList.remove('border-left-4');
    domELement?.classList.remove('border-right-4');
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
            if (dropFieldItem.style?.flexBasis) {
              dropFieldItem.style = { ...dropFieldItem.style, flexGrow: 1, flexBasis: 0 };
            }
            dropContainer.items[dropElementIndex] = {
              container: dropContainer,
              viewItemType: 'horizontal-layout',
              items: [this.state.designDragElement, dropFieldItem]
            }
          }
          if (this.state.designDropSide === 'right') {
            if (dropFieldItem.style?.flexBasis) {
              dropFieldItem.style = { ...dropFieldItem.style, flexGrow: 1, flexBasis: 0 };
            }
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
            let newDropFieldItemStyle = { ...dropFieldItem.style };
            delete newDropFieldItemStyle.flexBasis;
            delete newDropFieldItemStyle.flexGrow;
            dropFieldItem.style = newDropFieldItemStyle;
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
      if (this.state.designDragContainer !== dropContainer) { // растягивание элемента левее при удалении крайнего правого, или ниже при удалении крайнего нижнего
        if (cutIndex === (this.state.designDragContainer.items.length - 1) && this.state.designDragContainer.items.length > 1) {
          if (this.state.designDragContainer.items[cutIndex - 1].style?.flexBasis && this.state.designDragContainer.container) {
            this.state.designDragContainer.items[cutIndex - 1].style = { ...this.state.designDragContainer.items[cutIndex - 1].style, flexBasis: 0, flexGrow: 1 }
          }
        }
      }
      this.state.designDragContainer.items.splice(cutIndex, 1);
      if (this.state.designDragContainer.items.length === 1 && this.state.designDragContainer.container && (this.state.designDragContainer.container.viewItemType === 'vertical-layout' || this.state.designDragContainer.container.viewItemType === 'horizontal-layout')) { // Если в Хрз или Врт остался 1 то вытащить филд на 1 этаж выше
        const replaceIdx = this.state.designDragContainer.container.items.findIndex(item => item === this.state.designDragContainer);
        this.state.designDragContainer.container.items.splice(replaceIdx, 1, this.state.designDragContainer.items[0]);
      }
      this._removeEmptyContainers(this.state.designDragContainer);
    }

    this._removeDragBorder(e);
    this._removeDragBorderFromDomELement(dropContainer.domElement);
    if (dropContainer.container && dropContainer.container.viewItemType !== 'tab') {
      this._removeDragBorderFromDomELement(dropContainer.container.domElement)
    }
    this.state.designDropTargetLevel2 = null;

    this.setState({designDragStarted: false,});
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
    // this._cleanFromEmptyContainers(this.state.designJson) // Для возможного очищения дизайна
    this.setState(
      state => ({designMode: !state.designMode}),
      async () => {
        console.log('designMode switched, state.designMode=', this.state.designMode);
        if (this.state.designMode === false) {
          this.state.hiddenDesignFieldOverlayItems = [];
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
  
  _cleanFromEmptyContainers = (layoutElement) => {
    if (!layoutElement.items) return;
    layoutElement.items.forEach((i, idx) => {
      if (i.viewItemType === 'horizontal-layout' || i.viewItemType === 'vertical-layout') {
        if (i.items?.length === 0) {
          layoutElement.items.splice(idx, 1);
          this._removeEmptyContainers(layoutElement);
        }
      }
      this._cleanFromEmptyContainers(i)
    })
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
    this.forceUpdate(); // add dom references
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
    delete layoutElememt.HorizontalLayout;
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
    if (layoutElement.container) { delete layoutElement.container; }
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
  
  // Для Филдов
  registerActionHandler = (listenerObj, item, listenerAVFieldComponent) => {
    const commonJustInMomentActions = ['componentDidMount', 'constructor'];
    if (commonJustInMomentActions.some(a => a === listenerObj.actionName)) {
      return;
    }
    if (!this.actionHandlerList[listenerObj.actionName]) {
      this.actionHandlerList[listenerObj.actionName] = [{ item, listenerAVFieldComponent,  actionHandlerFunction: listenerObj.actionHandlerFunction }];
    } else {
      this.actionHandlerList[listenerObj.actionName].push({ item, listenerAVFieldComponent, actionHandlerFunction: listenerObj.actionHandlerFunction });
    }
  }
  
  activateActionHandler = ({ e, actionName, sourceAVFieldComponent, sourceObjDoc }) => {
    console.log(`AVObjectDocument.activateActionHandler() ${actionName} this.actionHandlerList:`, this.actionHandlerList);
    if (this.actionHandlerList[actionName]) {
      this.actionHandlerList[actionName].forEach(({ item, listenerAVFieldComponent, actionHandlerFunction }) => {
        let f = new Function('item', '$objectDocument', 'e', 'sourceAVFieldComponent', 'sourceObjDoc', actionHandlerFunction);
        f = f.bind(listenerAVFieldComponent);
        f(item, this, e, sourceAVFieldComponent, sourceObjDoc);

      })
    }
  }
}
