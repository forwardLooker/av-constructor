import {html, css, AVItem} from './0-av-item.js';

import './4-av-object-document.js'
import './av-item-panel.js'
import './av-configurator.js'

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
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
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

  render() {
    return html`
      <av-item-panel
        .item="${this.classItem}"
        @item-view-changed="${this.onItemViewChanged}"
      ></av-item-panel>
      ${this.currentViewName === 'Grid' ? this.renderGrid() : this.nothing}
      ${this.currentViewName === 'Configurator' ? this.renderConfigurator() : this.nothing}
    `
  }

  onItemViewChanged(e) {
    this.currentViewName = e.detail.newViewName
  }

  renderGrid() {
    return html`
      <av-grid
        .items="${this.objectDocuments}"
        .columns="${this.fieldDescriptors}"
        @row-click="${this.onGridRowClick}"
      >
      </av-grid>
      <av-object-document
        ${this.showIf(this.selectedObjectDocument)}
        class="object-show"
        .fieldDescriptors="${this.fieldDescriptors}"
        .objectDocument="${this.selectedObjectDocument}"
        @close="${this.onObjectClose}"
        @saved="${this.onObjectSaved}"
      >
      </av-object-document>
    `
  }

  async onGridRowClick(e) {
    console.log('onGridRow:' , e);
    //TODO инстанцирование объекта
    this.selectedObjectDocument = await this.classItem.getObjectDocument(e.detail.rowData.reference);;
    console.log('selectedObject:' , this.selectedObjectDocument);
  }

  onObjectClose() {
    this.selectedObjectDocument = null
  }

  async onObjectSaved() {
    this.objectDocuments = await this.classItem.getObjectDocuments();
  }

  renderConfigurator() {
    return html`
      <av-configurator
              .item="${this.classItem}"
              @saved="${this.onFieldDescriptorsChanged}"
      ></av-configurator>
    `
  }

  async onFieldDescriptorsChanged() {
    this.fieldDescriptors = await this.classItem.getFieldDescriptors();
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem')) {
      this.currentViewName = this.classItem.defaultViewName
    }
    if (changedProps.has('classItem') && this.classItem !== null) {
      this.classItem.addEventListener('openNewObjectDocument', () => {
        this.selectedObjectDocument = this.classItem.getNewObjectDocument();
      })
    }
  }

  async updated(changedProps) {
    if (changedProps.has('classItem')) {
      this.fieldDescriptors = await this.classItem.getFieldDescriptors();
      this.objectDocuments = await this.classItem.getObjectDocuments();
    }
  }
}

window.customElements.define('av-class', AVClass);
