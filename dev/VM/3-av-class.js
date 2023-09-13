import {html, css, AVItem} from './0-av-item.js';

import './4-av-object-document.js'
import './3-av-class/av-class-configurator.js'
import './3-av-class/av-class-panel.js'

import '../V/av-grid.js';


export class AVClass extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .object-show {
        position: absolute;
        padding: 4px;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
        background: white;
      }
    `;
  }

  static properties = {
    classItem: {},
    currentViewName: {},
    fieldDescriptors: {},
    objectDocuments:{},
    selectedObjectDocument: {},
  };

  constructor() {
    super();
    this.classItem = null;
    this.currentViewName = '';
    this.fieldDescriptors = [];
    this.objectDocuments = [];
    this.selectedObjectDocument = null;
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem')) {
      this.currentViewName = this.classItem.defaultViewName
    }
  }

  render() {
    return html`
      <av-class-panel
        .item="${this.classItem}"
        .onClassViewChangedFunc="${viewName => this.currentViewName = viewName}"
        .onCreateFunc="${(e) => {this.selectedObjectDocument = this.classItem.getNewObjectDocument()}}"
      ></av-class-panel>
      ${this.currentViewName === 'Grid' ? this._renderGrid() : this.nothing}
      ${this.currentViewName === 'Configurator' ? this._renderConfigurator() : this.nothing}
    `
  }

  _renderGrid() {
    return html`
      <av-grid
        .items="${this.objectDocuments}"
        .columns="${this.fieldDescriptors}"
        @row-click="${this._onGridRowClick}"
      >
      </av-grid>
      ${this.if(this.selectedObjectDocument, html`
          <av-object-document
            class="object-show"
            .fieldDescriptors="${this.fieldDescriptors}"
            .objectDocument="${this.selectedObjectDocument}"
            @close="${this._onObjectClose}"
            @saved="${this._onObjectSaved}"
          >
          </av-object-document>
      `)}
    `
  }

  _renderConfigurator() {
    return html`
      <av-class-configurator
              .item="${this.classItem}"
              @saved="${this._onFieldDescriptorsChanged}"
      ></av-class-configurator>
    `
  }

  firstUpdated() {

  }

  async updated(changedProps) {
    if (changedProps.has('classItem')) {
      this.fieldDescriptors = await this.classItem.getFieldDescriptors();
      this.objectDocuments = await this.classItem.getObjectDocuments();
    }
  }

  async _onGridRowClick(e) {
    console.log('onGridRow:' , e);
    //TODO инстанцирование объекта
    this.selectedObjectDocument = await this.classItem.getObjectDocument(e.detail.rowData._reference);;
    console.log('selectedObject:' , this.selectedObjectDocument);
  }

  _onObjectClose() {
    this.selectedObjectDocument = null
  }

  async _onObjectSaved() {
    this.objectDocuments = await this.classItem.getObjectDocuments();
  }

  async _onFieldDescriptorsChanged() {
    this.fieldDescriptors = await this.classItem.getFieldDescriptors();
  }
}

window.customElements.define('av-class', AVClass);
