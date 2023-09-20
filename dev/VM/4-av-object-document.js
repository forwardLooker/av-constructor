import {html, css, AVItem} from './0-av-item.js';

import './5-av-field.js'

import {Host} from '../M/1-Host.js';

export class AVObjectDocument extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      #header {
        padding: 0 1.5em;
        box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
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
          type: 'vertical-layout',
          items: this.deepClone(this.fieldDescriptors),
          originalItems: this.deepClone(this.fieldDescriptors)
        };
      }
    }
  }

  render() {
    return html`
      <div class="col">
        ${this._renderVerticalLayout(this.designJson)}
        <div>
          <button @click="${this._saveAndClose}">OK</button>
          <button @click="${this.onCloseFunc}">Закрыть</button>
          <button @click="${this._toggleDesign}">Дизайнер</button>
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
      >
        ${this.repeat(vrtLayoutItem.items, vrtItem => vrtItem.name, (layoutElement, verticalIndex) => html`
          ${this.if(layoutElement.type === 'horizontal-layout', html`
            <div class="horizontal-layout row flex-1">
              ${this.repeat(
                layoutElement.items,
                hrzItem => hrzItem.name,
                (hrzItem, horizontalIndex) => {
                    if (hrzItem.type === 'vertical-layout') {
                      return this._renderVerticalLayout(hrzItem);
                    } else {
                        return this._renderField(hrzItem, horizontalIndex, layoutElement)
                    }
                }
              )}
            </div>
          `)}
          ${this.if(
            !layoutElement.type || layoutElement.type === 'field',
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
        .item="${fieldItem}"
        .value="${this._newData[fieldItem.name]}"
        .onInputFunc="${value => {this._newData[fieldItem.name] = value}}"
      >
        ${this.if(this.designMode, html`
            <div class="field-overlay pos-abs row">
              <div
                class="flex-1"
                draggable="true"
                @dragstart="${(e) => this._dragstart(e, idx, containerElement)}"
                @dragover="${this._dragover}"
                @dragleave="${this._dragleave}"
                @drop="${(e) => this._drop(e, idx, containerElement)}"
                @contextmenu="${(e) => this._onDesignFieldContextMenu(e, idx, containerElement)}"
              >
              </div>
              <div
                class="horizontal-resizer"
                @mousedown="${(e) => this._startHorizontalResize(e, idx, containerElement)}"
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

  _startHorizontalResize(e, idx, containerElement) {
    // запрет на изменение ширины крайнего правого элемента
    if ((!containerElement.items[idx].type ||
      containerElement.items[idx].type === 'field') &&
      !containerElement.container
    ) {
      return;
    }
    if (containerElement.type === 'horizontal-layout' &&
      idx === containerElement.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement)) {
        return;
      }
    }
    if (
      containerElement.type === 'vertical-layout' &&
      containerElement.container.items.findIndex(i => i === containerElement) === containerElement.container.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement.container)) {
        return;
      }
    }
    const resizeElem = e.target.closest('av-field');
    const resizeElemRect = resizeElem.getBoundingClientRect();
    const startResizeElemWidth = resizeElemRect.width;
    // console.log('elemRect', elemRect);
    console.log('mousedown', e);
    const startResizePageX = e.pageX;
    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      window.document.onmouseup = upEv => {
        window.document.onmousemove = null;
        window.document.onmouseup = null;
      }

      console.log('move e', moveEv);
      const pageXDiff = moveEv.pageX - startResizePageX;
      const newWidth = (startResizeElemWidth + pageXDiff) + 'px';
      console.log('newWidth:', newWidth);
      const forStyleWidthObj = {
        'flex-basis': newWidth,
        'flex-grow': 0,
      };
      if (containerElement.type === 'vertical-layout') {
        if (containerElement.style) {
          containerElement.style = {
            ...containerElement.style,
            ...forStyleWidthObj
          }
        } else {
          containerElement.style = forStyleWidthObj;
        }
      } else {
        if (
          containerElement.type === 'horizontal-layout' &&
          idx === containerElement.items.length - 1
        ) {
          if (containerElement.container.style) {
            containerElement.container.style = {
              ...containerElement.container.style,
              ...forStyleWidthObj
            }
          } else {
            containerElement.container.style = forStyleWidthObj;
          }
        } else {
          if (containerElement.items[idx].style) {
            containerElement.items[idx].style = {
              ...containerElement.items[idx].style,
              ...forStyleWidthObj
            }
          } else {
            containerElement.items[idx].style = forStyleWidthObj;
          }
        }
      }

      this.requestUpdate();
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

  async _onDesignFieldContextMenu(e, idx, containerElement) {
    const menuResult = await this.showContextMenu(e, ['Сгруппировать']);
  }

  _dragstart(e, idx, container) {
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

  _drop(e, dropElementIndex, dropContainer) {
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
      if (dropContainer.type === 'vertical-layout') {
        if (this.designDropSide === 'left') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, type: 'horizontal-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'right') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, type: 'horizontal-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement]}
        }
      } else if (dropContainer.type === 'horizontal-layout') {
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
      if (dropContainer.type === 'horizontal-layout') {
        let vrtElement;
        if (this.designDropSide === 'top') {
          vrtElement = {container: dropContainer, type: 'vertical-layout', items: [this.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.designDropSide === 'bottom') {
          vrtElement = {container: dropContainer, type: 'vertical-layout', items: [dropContainer.items[dropElementIndex], this.designDragElement ]}
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

      } else if (dropContainer.type === 'vertical-layout') {
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
        this._removeContainerReference(this.designJson);
        await this.objectDocument.saveDesignJson(this.designJson);
        this._addContainerReference(this.designJson);
      }
    }
  }

  _addContainerReference(layoutElememt) {
    layoutElememt.items.forEach((i) => {
      if (i.type && i.type !== 'field') {
        i.container = layoutElememt;
        this._addContainerReference(i)
      }
    })
  }
  _removeContainerReference(layoutElement) {
    layoutElement.items.forEach(i => {
      if (i.type && i.type !== 'field') {
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
      const containerElements = containerEl.items.filter(i => i.type && i.type !== 'field');
      containerElements.forEach(contEl => {
        this._removeDeletedItemInContainer(delItem, contEl)
      })
    }

  }
}

window.customElements.define('av-object-document', AVObjectDocument);
