import {html, css, AVItem} from './0-av-item.js';

import './4-av-object-document.js'
import './item-panel.js'

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
      <item-panel
        .item="${this.classItem}"
        @item-view-changed="${this.onItemViewChanged}"
      ></item-panel>
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
        .object="${this.selectedObjectDocument}"
        @close="${this.onObjectClose}"
      >
      </av-object-document>
    `
  }

  onGridRowClick(e) {
    console.log('onGridRow:' , e);
    //TODO инстанцирование объекта
    this.selectedObjectDocument = e.detail.rowData;
    console.log('selectedObject:' , this.selectedObjectDocument);
  }

  onObjectClose() {
    this.selectedObjectDocument = null
  }

  renderConfigurator() {
    return this.nothing
  }

  willUpdate(changedProps) {
    //TODO
    if (changedProps.has('classItem') && this.notEmpty(changedProps.get('classItem'))) {
      this.currentViewName = this.classItem.defaultViewName
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
