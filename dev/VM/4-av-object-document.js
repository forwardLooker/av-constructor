import {html, css, AVItem} from './0-av-item.js';

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
      
      .field {
      }
      .label {
        display: inline-block;
        padding: 0 4px;
      }

      .input {
        box-sizing: border-box;
        margin: 0;
        padding: 4px 11px;
        color: rgba(0, 0, 0, .88);
        font-size: 14px;
        line-height: 1.5714285714285714;
        list-style: none;
        font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial, noto sans, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji;
        position: relative;
        display: inline-block;
        min-width: 0;
        background-color: #fff;
        background-image: none;
        border-width: 1px;
        border-style: solid;
        border-color: #d9d9d9;
        border-radius: 6px;
        transition: all .2s;

        -webkit-box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
        box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
      }

      .input:hover {
        border-color: black;
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
    designMode: {},
    designJson: {},
    designDragElementIndex: {},
    designDragElement: {},
    designDragContainer: {},
    designDropSide: {enum: ['top', 'bottom', 'left', 'right', 'none']}
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
        this._addContainerReference(designJson);
        this.designJson = designJson;
      } else {
        this.designJson = {type: 'vertical-layout', items: this.deepClone(this.fieldDescriptors)};
      }
    }
  }

  render() {
    return html`
      <div class="col">
        ${this._renderVerticalLayout(this.designJson)}
        <div>
          <button @click="${this.saveAndClose}">OK</button>
          <button @click="${this.close}">Закрыть</button>
          <button @click="${this.toggleDesign}">Дизайнер</button>
        </div>
      </div>
    `
  }

  _renderVerticalLayout(vrtLayoutItem) {
    return html`
      <div class="vertical-layout col flex-1">
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
    return html`
      <div class="field pos-rel flex-1 row align-center">
        <div class="label">${fieldItem.name}</div>
        <input
          class="input flex-1"      
          value="${this._newData[fieldItem.name]}"
          @input="${(e) => {this._newData[fieldItem.name] = e.target.value} }"
        >
        ${this.if(this.designMode, html`
            <div
              class="field-overlay pos-abs"
              draggable="true"
              @dragstart="${(e) => this.dragstart(e, idx, containerElement)}"
              @dragover="${this.dragover}"
              @dragleave="${this.dragleave}"
              @drop="${(e) => this.drop(e, idx, containerElement)}"
              @contextmenu="${(e) => this._onDesignFieldContextMenu(e, idx, containerElement)}"
            ></div>
        `)}
      </div>
    `
  }

  async _onDesignFieldContextMenu(e, idx, containerElement) {
    const menuResult = await this.showContextMenu(e, ['Сгруппировать']);
  }

  dragstart(e, idx, container) {
    this.designDragElementIndex = idx;
    this.designDragElement = container.items[idx];
    this.designDragContainer = container;
  }

  dragover(e) {
    // console.log('dragover e:', e);
    e.preventDefault();
    const elemRect = e.target.getBoundingClientRect();

    if (elemRect.left + elemRect.width/10 > e.pageX) {
      e.target.classList.remove('dragover-top');
      e.target.classList.remove('dragover-bottom');
      e.target.classList.add('dragover-left');
      this.designDropSide = 'left';
    } else {
      e.target.classList.remove('dragover-left');

      if (elemRect.right - elemRect.width/10 <= e.pageX) {
        e.target.classList.remove('dragover-top');
        e.target.classList.remove('dragover-bottom');
        e.target.classList.add('dragover-right');
        this.designDropSide = 'right';
      } else {
        e.target.classList.remove('dragover-right');

        if (elemRect.top + elemRect.height/2 > e.pageY) {
          e.target.classList.add('dragover-top');
          this.designDropSide = 'top';
        } else {
          e.target.classList.remove('dragover-top');
        }

        if (elemRect.top + elemRect.height/2 <= e.pageY) {
          e.target.classList.add('dragover-bottom');
          this.designDropSide = 'bottom'
        } else {
          e.target.classList.remove('dragover-bottom');
        }
      }
    }
  }

  dragleave(e) {
    this._removeDragBorder(e);
  }

  drop(e, dropElementIndex, dropContainer) {
    if (this.designDragElement === dropContainer.items[dropElementIndex]) {
      this._removeDragBorder(e);
      return;
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
    e.target.classList.remove('dragover-top');
    e.target.classList.remove('dragover-bottom');
    e.target.classList.remove('dragover-left');
    e.target.classList.remove('dragover-right');
  }

  close() {
    this.fire('close');
  }
  saveAndClose() {
    this.objectDocument.saveData(this._newData);
    this.fire('saved');
    this.fire('close');
  }

  async toggleDesign() {
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

  async firstUpdated() {

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
}

window.customElements.define('av-object-document', AVObjectDocument);
