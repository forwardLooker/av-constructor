import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClass} from './3-AVClass.jsx';
import {AVField} from './5-AVField.jsx';

import {AVButton} from "../V/AVButton.jsx";


export class AVObjectDocument extends AVItem {
  styles = {
    horizontalResizer: this.styled.div`
      width: 4px;
      height: 100%;
      cursor: col-resize;
    `
  }

  static defaultProps = {
    fieldDescriptors: [],
    objectDocument: null,
    onSavedFunc: this.noop,
    onCloseFunc: this.noop,
  }
  state = {
    _newData: this.props.objectDocument.data,

    designMode: false,
    designJson: null,
    designDragElementIndex: null,
    designDragElement: null,
    designDragContainer: null,
    designDropSide: 'none', // enum: ['top', 'bottom', 'left', 'right', 'none']

    isClassItemOpened: false,
    openedClassItem: null,
    onObjectDocumentSelectedInOpenedClassItem: this.noop
  }

  constructor(props) {
    super(props);

    this._prepareDesignJson();
  }

  _prepareDesignJson = () => {
    if (this.props.objectDocument) {
      if (this.props.objectDocument.designJson) {
        const designJson = this.deepClone(this.props.objectDocument.designJson);
        const fieldDescriptors = this.deepClone(this.props.fieldDescriptors);

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
          items: this.deepClone(this.props.fieldDescriptors),
          originalItems: this.deepClone(this.props.fieldDescriptors)
        };
      }
    }
  }

  render() {
    return (
      <div className="flex-1 col font-apple">
        <div className="flex-1 col space-between line-height-1-5">
          <div>
            {this._renderVerticalLayout(this.state.designJson)}
          </div>
          <div className="row justify-end">
            <div>
              <AVButton onClick={this._saveAndClose}>OK</AVButton>
              <AVButton onClick={this.props.onCloseFunc}>Отмена</AVButton>
              <AVButton onClick={this._toggleDesign}>Дизайнер</AVButton>
            </div>
          </div>
        </div>
        {this.state.isClassItemOpened && (
          <div className="pos-abs trbl-0 z-index-100 bg-white">
            <AVClass
              classItem={this.state.openedClassItem}
              onObjectDocumentSelectedFunc={this.state.onObjectDocumentSelectedInOpenedClassItem}
            ></AVClass>
          </div>
        )}
      </div>
    )
  }

  _renderVerticalLayout(vrtLayoutItem, vrtLayoutItemIndex) {
    return (
      <div
        className="vertical-layout flex-1 col"
        style={vrtLayoutItem.style}
        ref={vrtDomElement => vrtLayoutItem.domElement = vrtDomElement}
        key={vrtLayoutItemIndex || 0}
      >
        {vrtLayoutItem.items.map((vrtItem, vrtIndex) => {
          if (vrtItem.viewItemType === 'horizontal-layout') {
            return (
              <div
                className="horizontal-layout flex-1 row"
                key={vrtIndex}
                ref={hrzDomElement => vrtItem.domElement = hrzDomElement}
              >
                {vrtItem.items.map((hrzItem, hrzIndex) => {
                  if (hrzItem.viewItemType === 'vertical-layout') {
                    return this._renderVerticalLayout(hrzItem, hrzIndex);
                  } else {
                    return this._renderField(hrzItem, hrzIndex, vrtItem)
                  }
                })}
              </div>
            )
          }
          if (vrtItem.viewItemType === 'field' || !vrtItem.viewItemType) {
            return this._renderField(vrtItem, vrtIndex, vrtLayoutItem)
          }
        })}
      </div>
    )
  }

  _renderField(fieldItem, idx, containerElement) {
    return (
      <div className="flex-1 pos-rel margin-top-2" key={fieldItem.name || idx}>
        <AVField
          style={fieldItem.style}
          ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
          fieldItem={fieldItem}
          value={this.state._newData[fieldItem.name]}
          onChangeFunc={value => {this.state._newData[fieldItem.name] = value}}
          labelPosition={fieldItem.dataType === 'array' ? 'top' : 'left'}
          $objectDocument={this}
        >
          {this.state.designMode && (
            <div className="field-overlay pos-abs trbl-0 row border-1 bg-transparent-25">
              <div className="flex-1"
                   draggable="true"
                   onDragStart={(e) => this._dragstart(e, fieldItem, idx, containerElement)}
                   onDragOver={this._dragover}
                   onDragLeave={this._dragleave}
                   onDrop={(e) => this._drop(e, fieldItem, idx, containerElement)}
                   onContextMenu={(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}
              ></div>
              <this.styles.horizontalResizer
                   onMouseDown={(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement)}
              ></this.styles.horizontalResizer>
            </div>
          )}
        </AVField>
      </div>
    )
  }

  showClass = async (name, onObjectDocumentSelected) => {
    const openedClassItem = await this.Host.getClassByName(name);
    this.setState({
      isClassItemOpened: true,
      openedClassItem,
      onObjectDocumentSelectedInOpenedClassItem: (objDocItem) => {
        this.setState({isClassItemOpened: false})
        onObjectDocumentSelected(objDocItem);
      }
    })
  }

  _startHorizontalResize(msDownEvent, fieldItem, idx, containerElement) {
    msDownEvent.preventDefault();
    // запрет на изменение ширины крайнего правого элемента
    if ((!containerElement.items[idx].viewItemType ||
        containerElement.items[idx].viewItemType === 'field') &&
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
      if (firstVerticalNotRightest) {
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
        const newWidth = (resizeElemRect.width + pageXDiff) + 'px';
        console.log('newWidth:', newWidth);
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
        }
      }

      this.forceUpdate();
    }
  }

  _findFirstVerticalNotRightestInHorizontal(firstVertical) {
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

  async _onDesignFieldContextMenu(e, fieldItem, idx, containerElement) {
    const menuResult = await this.showContextMenu(e, ['Сгруппировать']);
  }

  _dragstart = (e, fieldItem, idx, container) => {
    this.setState({
      designDragElementIndex: idx,
      designDragElement: container.items[idx],
      designDragContainer: container
    })
  }

  _findFieldOverlay(e) {
    return e.target.closest('.field-overlay');
  }

  _dragover = (e) => {
    // console.log('dragover e:', e);
    e.preventDefault();
    const fieldOverlay = this._findFieldOverlay(e);
    const elemRect = fieldOverlay.getBoundingClientRect();

    if (elemRect.left + elemRect.width/10 > e.pageX) {
      fieldOverlay.classList.remove('dragover-top');
      fieldOverlay.classList.remove('dragover-bottom');
      fieldOverlay.classList.add('dragover-left');
      this.designDropSide = 'left';
    } else {
      fieldOverlay.classList.remove('dragover-left');

      if (elemRect.right - elemRect.width/10 <= e.pageX) {
        fieldOverlay.classList.remove('dragover-top');
        fieldOverlay.classList.remove('dragover-bottom');
        fieldOverlay.classList.add('dragover-right');
        this.designDropSide = 'right';
      } else {
        fieldOverlay.classList.remove('dragover-right');

        if (elemRect.top + elemRect.height/2 > e.pageY) {
          fieldOverlay.classList.add('dragover-top');
          this.designDropSide = 'top';
        } else {
          fieldOverlay.classList.remove('dragover-top');
        }

        if (elemRect.top + elemRect.height/2 <= e.pageY) {
          fieldOverlay.classList.add('dragover-bottom');
          this.designDropSide = 'bottom'
        } else {
          fieldOverlay.classList.remove('dragover-bottom');
        }
      }
    }
  }

  _dragleave = (e) => {
    this._removeDragBorder(e);
  }

  _drop = (e, fieldItem, dropElementIndex, dropContainer) => {
    if (this.designDragElement === dropContainer.items[dropElementIndex]) {
      this._removeDragBorder(e);
      return;
    }

    if (this.designDragElement.style) {
      delete this.designDragElement.style['flex-basis'];
      delete this.designDragElement.style['flex-grow'];
    }

    // const newDesign = [...this.designJson];
    let insertIndex = dropElementIndex;
    let cutIndex = this.designDragElementIndex;

    if (this.designDropSide === 'left' || this.designDropSide === 'right') {
      if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.designDropSide === 'left') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'right') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement]}
        }
      } else if (dropContainer.viewItemType === 'horizontal-layout') {
        if (this.designDropSide === 'left') {
          if (dropContainer === this.designDragContainer) {
            cutIndex = cutIndex + 1;
          }
        }
        if (this.designDropSide === 'right') {
          insertIndex = insertIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.designDragElement);
      }
    }

    if (this.designDropSide === 'top' || this.designDropSide === 'bottom') {
      if (dropContainer.viewItemType === 'horizontal-layout') {
        let vrtElement;
        if (this.designDropSide === 'top') {
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'bottom') {
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement ]}
        }

        if (dropContainer.items[dropElementIndex].style) {
          vrtElement.style = {
            'flex-basis': dropContainer.items[dropElementIndex].style['flex-basis'],
            'flex-grow': dropContainer.items[dropElementIndex].style['flex-grow'],
          }
          delete dropContainer.items[dropElementIndex].style['flex-basis'];
          delete dropContainer.items[dropElementIndex].style['flex-grow'];
        }

        dropContainer.items.splice(insertIndex, 1)
        dropContainer.items.splice(insertIndex, 0, vrtElement);

      } else if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.designDropSide === 'bottom') {
          insertIndex = insertIndex + 1;
        }
        if (dropContainer === this.designDragContainer && this.designDragElementIndex > dropElementIndex) {
          cutIndex = cutIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.designDragElement);
      }
    }

    this.designDragContainer.items.splice(cutIndex, 1);
    this._removeEmptyContainers(this.designDragContainer);

    this.requestUpdate();
    // this.designJson = newDesign;
    this._removeDragBorder(e);
  }

  _removeDragBorder = (e) => {
    const fieldOverlay = this._findFieldOverlay(e);
    fieldOverlay.classList.remove('dragover-top');
    fieldOverlay.classList.remove('dragover-bottom');
    fieldOverlay.classList.remove('dragover-left');
    fieldOverlay.classList.remove('dragover-right');
  }

  _saveAndClose = async () => {
    await this.props.objectDocument.saveData(this.state._newData);
    this.props.onSavedFunc();
    this.props.onCloseFunc();
  }

  _toggleDesign = async () => {
    this.setState(
      state => ({designMode: !state.designMode}),
      async () => {
        if (this.state.designMode === false) {
          const saveDesignFlag = await this.showDialog({text: 'Сохранить дизайн?'});
          if (saveDesignFlag) {
            return this._saveDesign();
          }
        }
      }
    );
  }

  async _saveDesign() {
    this._removeContainerReference(this.state.designJson);
    this._removeDomElementReference(this.state.designJson);
    await this.props.objectDocument.saveDesignJson(this.deepClone(this.state.designJson));
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

  _addContainerReference = (layoutElememt) => {
    layoutElememt.items.forEach((i) => {
      if (i.viewItemType && i.viewItemType !== 'field') {
        i.container = layoutElememt;
        this._addContainerReference(i)
      }
    })
  }
  _removeContainerReference = (layoutElement) => {
    layoutElement.items.forEach(i => {
      if (i.viewItemType && i.viewItemType !== 'field') {
        if (i.container) {
          delete i.container;
        }
        this._removeContainerReference(i)
      }
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

export class AVObjectDocument2 extends AVItem {
  static get styles() {
    return css`
      :host {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
        line-height: 1.5;
        word-wrap: break-word;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      av-field {
        margin-top: 2px;
      }
      
      .horizontal-resizer {
        width: 4px;
        height: 100%;
        cursor: col-resize;
      }

      .field-overlay {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0,0,0,0.25);
        border: 1px solid black;
      }
      
      .dragover-top {
        border-top: 4px solid black;
      }
      .dragover-bottom {
        border-bottom: 4px solid black;
      }
      .dragover-left {
        border-left: 4px solid black;
      }
      .dragover-right {
        border-right: 4px solid black;
      }
      
      #class-in-obj {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 100;
        background: white;
      }
    `;
  }

  static properties = {
    fieldDescriptors: {},
    objectDocument: {},
    _newData: {},
    onSavedFunc: {},
    onCloseFunc: {},

    designMode: {},
    designJson: {},
    designDragElementIndex: {},
    designDragElement: {},
    designDragContainer: {},
    designDropSide: {enum: ['top', 'bottom', 'left', 'right', 'none']},
  };

  constructor() {
    super();
    this.fieldDescriptors = [];
    this.objectDocument = null;
    this._newData = {};
    this.designMode = false;
    this.designJson = null;
    this.designDropSide = 'none';
  }

  willUpdate(changedProps) {
    if (changedProps.has('objectDocument')) {
      this._newData = this.objectDocument.data;
      if (this.objectDocument.designJson) {
        const designJson = this.deepClone(this.objectDocument.designJson);
        const fieldDescriptors = this.deepClone(this.fieldDescriptors);

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
        this.designJson = designJson;
      } else {
        this.designJson = {
          viewItemType: 'vertical-layout',
          items: this.deepClone(this.fieldDescriptors),
          originalItems: this.deepClone(this.fieldDescriptors)
        };
      }
    }
  }

  render() {
    return html`
      <div class="col space-between height-100">
        <div>
          ${this._renderVerticalLayout(this.designJson)}
        </div>  
        <div class="row justify-end">
          <div>
            <av-button @click="${this._saveAndClose}">OK</av-button>
            <av-button @click="${this.onCloseFunc}">Отмена</av-button>
            <av-button @click="${this._toggleDesign}">Дизайнер</av-button>
          </div>  
        </div>
      </div>
      <av-class id="class-in-obj" hideOnfirstUpdate></av-class>
    `
  }

  _renderVerticalLayout(vrtLayoutItem) {
    let vrtLayoutItemStyle;
    if (vrtLayoutItem.style) {
      vrtLayoutItemStyle = this.styleMap(vrtLayoutItem.style);
    } else {
      vrtLayoutItemStyle = this.nothing;
    }
    return html`
      <div 
        class="vertical-layout col flex-1"
        style="${vrtLayoutItemStyle}"
        ${this.ref(vrtDomElement => vrtLayoutItem.domElement = vrtDomElement)}
      >
        ${this.repeat(vrtLayoutItem.items, vrtItem => vrtItem.name, (layoutElement, verticalIndex) => html`
          ${this.if(layoutElement.viewItemType === 'horizontal-layout', html`
            <div
              class="horizontal-layout row flex-1"
              ${this.ref(hrzDomElement => layoutElement.domElement = hrzDomElement)}
            >
              ${this.repeat(
                layoutElement.items,
                hrzItem => hrzItem.name,
                (hrzItem, horizontalIndex) => {
                    if (hrzItem.viewItemType === 'vertical-layout') {
                      return this._renderVerticalLayout(hrzItem);
                    } else {
                        return this._renderField(hrzItem, horizontalIndex, layoutElement)
                    }
                }
              )}
            </div>
          `)}
          ${this.if(
            !layoutElement.viewItemType || layoutElement.viewItemType === 'field',
            this._renderField(layoutElement, verticalIndex, vrtLayoutItem)
        )}
      `)}
      </div>
    `
  }

  _renderField(fieldItem, idx, containerElement) {
    let fieldStyle;
    if (fieldItem.style) {
      fieldStyle = this.styleMap(fieldItem.style);
    } else {
      fieldStyle = this.nothing;
    }
    return html`
      <av-field
        class="pos-rel row"
        style="${fieldStyle}"
        ${this.ref(fieldDomElement => fieldItem.domElement = fieldDomElement)}
        .fieldItem="${fieldItem}"
        .value="${this._newData[fieldItem.name]}"
        .onInputFunc="${value => {this._newData[fieldItem.name] = value}}"
        .$objectDocument="${this}"
      >
        ${this.if(this.designMode, html`
            <div class="field-overlay pos-abs row">
              <div
                class="flex-1"
                draggable="true"
                @dragstart="${(e) => this._dragstart(e, fieldItem, idx, containerElement)}"
                @dragover="${this._dragover}"
                @dragleave="${this._dragleave}"
                @drop="${(e) => this._drop(e, fieldItem, idx, containerElement)}"
                @contextmenu="${(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}"
              >
              </div>
              <div
                class="horizontal-resizer"
                @mousedown="${(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement)}"
              ></div>
            </div>
        `)}
      </av-field>
    `
  }

  async firstUpdated() {

  }

  updated(changedProps) {

  }

  async showClass(name, onObjectDocumentSelected) {
    const classInObj = this.$('#class-in-obj');
    classInObj.display();
    classInObj.classItem = await this.Host.getClassByName(name);
    classInObj.onObjectDocumentSelected = (objDocItem) => {
      classInObj.hide();
      onObjectDocumentSelected(objDocItem);
      classInObj.selectedObjectDocument = null;
    };
  }

  _startHorizontalResize(msDownEvent, fieldItem, idx, containerElement) {
    msDownEvent.preventDefault();
    // запрет на изменение ширины крайнего правого элемента
    if ((!containerElement.items[idx].viewItemType ||
      containerElement.items[idx].viewItemType === 'field') &&
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
      if (firstVerticalNotRightest) {
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
        const newWidth = (resizeElemRect.width + pageXDiff) + 'px';
        console.log('newWidth:', newWidth);
        const forStyleWidthObj = {
          'flex-basis': newWidth,
          'flex-grow': 0,
        }
        if (fieldItem.style) {
          fieldItem.style = {
            ...fieldItem.style,
            ...forStyleWidthObj
          }
        } else {
          fieldItem.style = forStyleWidthObj;
        }
      }
      if (
          (containerElement.viewItemType === 'horizontal-layout' && idx === containerElement.items.length - 1) ||
          containerElement.viewItemType === 'vertical-layout'
      ) {
        if (firstVerticalNotRightest) {
          const newVrtWidth = (resizeVrtElemRect.width + pageXDiff) + 'px';
          const forStyleVrtWidthObj = {
            'flex-basis': newVrtWidth,
            'flex-grow': 0,
          }
          if (firstVerticalNotRightest.style) {
            firstVerticalNotRightest.style = {
              ...firstVerticalNotRightest.style,
              ...forStyleVrtWidthObj
            }
          } else {
            firstVerticalNotRightest.style = forStyleVrtWidthObj;
          }
        }
      }

      this.requestUpdate();
    }
  }

  _findFirstVerticalNotRightestInHorizontal(firstVertical) {
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

  async _onDesignFieldContextMenu(e,fieldItem, idx, containerElement) {
    const menuResult = await this.showContextMenu(e, ['Сгруппировать']);
  }

  _dragstart(e, fieldItem, idx, container) {
    this.designDragElementIndex = idx;
    this.designDragElement = container.items[idx];
    this.designDragContainer = container;
  }

  _findFieldOverlay(e) {
    return e.target.closest('.field-overlay');
  }

  _dragover(e) {
    // console.log('dragover e:', e);
    e.preventDefault();
    const fieldOverlay = this._findFieldOverlay(e);
    const elemRect = fieldOverlay.getBoundingClientRect();

    if (elemRect.left + elemRect.width/10 > e.pageX) {
      fieldOverlay.classList.remove('dragover-top');
      fieldOverlay.classList.remove('dragover-bottom');
      fieldOverlay.classList.add('dragover-left');
      this.designDropSide = 'left';
    } else {
      fieldOverlay.classList.remove('dragover-left');

      if (elemRect.right - elemRect.width/10 <= e.pageX) {
        fieldOverlay.classList.remove('dragover-top');
        fieldOverlay.classList.remove('dragover-bottom');
        fieldOverlay.classList.add('dragover-right');
        this.designDropSide = 'right';
      } else {
        fieldOverlay.classList.remove('dragover-right');

        if (elemRect.top + elemRect.height/2 > e.pageY) {
          fieldOverlay.classList.add('dragover-top');
          this.designDropSide = 'top';
        } else {
          fieldOverlay.classList.remove('dragover-top');
        }

        if (elemRect.top + elemRect.height/2 <= e.pageY) {
          fieldOverlay.classList.add('dragover-bottom');
          this.designDropSide = 'bottom'
        } else {
          fieldOverlay.classList.remove('dragover-bottom');
        }
      }
    }
  }

  _dragleave(e) {
    this._removeDragBorder(e);
  }

  _drop(e, fieldItem, dropElementIndex, dropContainer) {
    if (this.designDragElement === dropContainer.items[dropElementIndex]) {
      this._removeDragBorder(e);
      return;
    }

    if (this.designDragElement.style) {
      delete this.designDragElement.style['flex-basis'];
      delete this.designDragElement.style['flex-grow'];
    }

    // const newDesign = [...this.designJson];
    let insertIndex = dropElementIndex;
    let cutIndex = this.designDragElementIndex;

    if (this.designDropSide === 'left' || this.designDropSide === 'right') {
      if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.designDropSide === 'left') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'right') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement]}
        }
      } else if (dropContainer.viewItemType === 'horizontal-layout') {
        if (this.designDropSide === 'left') {
          if (dropContainer === this.designDragContainer) {
            cutIndex = cutIndex + 1;
          }
        }
        if (this.designDropSide === 'right') {
          insertIndex = insertIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.designDragElement);
      }
    }

    if (this.designDropSide === 'top' || this.designDropSide === 'bottom') {
      if (dropContainer.viewItemType === 'horizontal-layout') {
        let vrtElement;
        if (this.designDropSide === 'top') {
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'bottom') {
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement ]}
        }

        if (dropContainer.items[dropElementIndex].style) {
          vrtElement.style = {
            'flex-basis': dropContainer.items[dropElementIndex].style['flex-basis'],
            'flex-grow': dropContainer.items[dropElementIndex].style['flex-grow'],
          }
          delete dropContainer.items[dropElementIndex].style['flex-basis'];
          delete dropContainer.items[dropElementIndex].style['flex-grow'];
        }

        dropContainer.items.splice(insertIndex, 1)
        dropContainer.items.splice(insertIndex, 0, vrtElement);

      } else if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.designDropSide === 'bottom') {
          insertIndex = insertIndex + 1;
        }
        if (dropContainer === this.designDragContainer && this.designDragElementIndex > dropElementIndex) {
          cutIndex = cutIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.designDragElement);
      }
    }

    this.designDragContainer.items.splice(cutIndex, 1);
    this._removeEmptyContainers(this.designDragContainer);

    this.requestUpdate();
    // this.designJson = newDesign;
    this._removeDragBorder(e);
  }

  _removeDragBorder(e) {
    const fieldOverlay = this._findFieldOverlay(e);
    fieldOverlay.classList.remove('dragover-top');
    fieldOverlay.classList.remove('dragover-bottom');
    fieldOverlay.classList.remove('dragover-left');
    fieldOverlay.classList.remove('dragover-right');
  }

  async _saveAndClose() {
    await this.objectDocument.saveData(this._newData);
    this.onSavedFunc();
    this.onCloseFunc();
  }

  async _toggleDesign() {
    this.designMode = !this.designMode;
    if (this.designMode === false) {
      const saveDesignFlag = await this.showDialog({text: 'Сохранить дизайн?'});
      if (saveDesignFlag) {
        return this._saveDesign();
      }
    }
  }

  async _saveDesign() {
    this._removeContainerReference(this.designJson);
    this._removeDomElementReference(this.designJson);
    await this.objectDocument.saveDesignJson(this.deepClone(this.designJson));
    this._addContainerReference(this.designJson);
  }

  _removeDomElementReference(layoutElememt) {
    delete layoutElememt.domElement;
    if (layoutElememt.items) {
      layoutElememt.items.forEach(i => {
        this._removeDomElementReference(i);
      })
    }
  }

  _addContainerReference(layoutElememt) {
    layoutElememt.items.forEach((i) => {
      if (i.viewItemType && i.viewItemType !== 'field') {
        i.container = layoutElememt;
        this._addContainerReference(i)
      }
    })
  }
  _removeContainerReference(layoutElement) {
    layoutElement.items.forEach(i => {
      if (i.viewItemType && i.viewItemType !== 'field') {
        if (i.container) {
          delete i.container;
        }
        this._removeContainerReference(i)
      }
    })
  }
  _removeEmptyContainers(cont) {
    if (cont.items.length === 0 && cont.container) {
      const DragContIndex = cont.container.items.findIndex(i => i === cont);
      cont.container.items.splice(DragContIndex, 1)
      this._removeEmptyContainers(cont.container)
    }
  }

  _findNewFieldDescriptors(fields, fieldsInDesign) {
    return fields.filter(f => fieldsInDesign.every(fInDesign => fInDesign.name !== f.name))
  }

  _findDeletedFieldDescriptors(fields, fieldsInDesign) {
    return fieldsInDesign.filter(fInDesign => fields.every(f => f.name !== fInDesign.name))
  }

  _removeDeletedItems(designJson, deletedItems) {
    deletedItems.forEach(delItem => {
      this._removeDeletedItemInContainer(delItem, designJson);
    })
  }
  _removeDeletedItemInContainer(delItem, containerEl) {
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

window.customElements.define('av-object-document', AVObjectDocument);
