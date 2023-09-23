import {html, css, AVItem} from './0-av-item.js';

import './5-av-field.js';

import '../V/av-button.js';

export class AVObjectDocument extends AVItem {
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
      
      .standart-button {
        text-align: center;
        color: white;
        background-color: black;
        border-color: black;
        box-shadow: gray;
        transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
        transition-property: color,background-color,box-shadow,border-color;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: var(--base-text-weight-medium, 500);
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid;
        border-radius: 6px;
        appearance: none;
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
        const fieldDescriptors = this.deepClone(this.fieldDescriptors)

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
    await this.objectDocument.saveDesignJson(this.designJson);
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
