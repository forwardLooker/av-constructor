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
    `;
  }

  static properties = {
    fieldDescriptors: {},
    objectDocument: {},
    _newData: {},
    designMode: {},
    designJson: {},
    designDragElementIndex: {},
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
      this.designJson = this.objectDocument.designJson || this.fieldDescriptors;
    }
  }

  render() {
    return html`
      <div>
        ${this.repeat(this.designJson,  f => f.name, (f, idx) => html`
            <div class="field pos-rel flex-1 row align-center">
              <div class="label">${f.name}</div>
              <input
                class="input flex-1"      
                value="${this._newData[f.name]}"
                @input="${(e) => {this._newData[f.name] = e.target.value} }"
              >
                ${
                  this.designMode ?
                          html`
                            <div
                              class="field-overlay pos-abs"
                              draggable="true"
                              @dragstart="${(e) => this.dragstart(e, idx)}"
                              @dragover="${this.dragover}"
                              @dragleave="${this.dragleave}"
                              @drop="${(e) => this.drop(e, idx)}"
                            ></div>
                          ` : this.nothing
                }
            </div>
        `)}
        <div>
          <button @click="${this.saveAndClose}">OK</button>
          <button @click="${this.close}">Закрыть</button>
          <button @click="${this.toggleDesign}">Дизайнер</button>
        </div>
      </div>
    `
  }

  dragstart(e, idx) {
    this.designDragElementIndex = idx;
  }

  dragover(e) {
    // console.log('dragover e:', e);
    e.preventDefault();
    const elemRect = e.target.getBoundingClientRect();
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

  dragleave(e) {
    e.target.classList.remove('dragover-top');
    e.target.classList.remove('dragover-bottom');
  }

  drop(e, idx) {
    if (this.designDragElementIndex === idx) {
      return;
    }
    const dragElement = this.designJson[this.designDragElementIndex];
    const newDesign = [...this.designJson];
    newDesign.splice(this.designDragElementIndex, 1);
    let dropIndex = idx;
    if (this.designDropSide === 'top') {
      dropIndex = idx;
    }
    if (this.designDropSide === 'bottom') {
      dropIndex = idx + 1;
    }
    if (this.designDragElementIndex < idx) {
      dropIndex = dropIndex - 1;
    }
    newDesign.splice(dropIndex, 0, dragElement);
    this.designJson = newDesign;
    e.target.classList.remove('dragover-top');
    e.target.classList.remove('dragover-bottom');
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
        this.objectDocument.saveDesignJson(this.designJson)
      }
    }
  }

  async firstUpdated() {

  }
}

window.customElements.define('av-object-document', AVObjectDocument);
