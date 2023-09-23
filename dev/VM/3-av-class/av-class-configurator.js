import {html, css, AVItem} from '../0-av-item.js';

import '../../V/av-tree.js';

export class AvClassConfigurator extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .fields-tree {
        flex-basis: 200px;
        flex-grow: 0;
      }
    `;
  }

  static properties = {
    classItem: {},
    fieldDescriptors: {},
    _newFieldDescriptors: {},
    selectedField: {},
    onSaveFunc: {},
  };

  constructor() {
    super();
    this.fieldDescriptors = [];
    this._newFieldDescriptors = [];
  }

  willUpdate(changedProps) {
    if (changedProps.has('fieldDescriptors')) {
      this._newFieldDescriptors = this.deepClone(this.fieldDescriptors);
    }
  }

  render() {
    const prGridItems = [{name: 'label'}, {name: 'dataType'}];
    return html`
        <div class="col space-between flex-1">
          <div class="col">
            <av-text-header class="margin-top-8">Fields:</av-text-header>
            <div>
              <av-button @click="${this._addField}">Добавить поле</av-button>
            </div>
            <div class="row margin-top-8">
              <av-tree
                class="fields-tree border"
                .items="${this._newFieldDescriptors}"
                .onItemSelectFunc="${item => this.selectedField = item}"
              ></av-tree>
              <av-property-grid
                class="flex-1 margin-left-8 border"
                .inspectedItem="${this.selectedField}"
                .propertyItems="${prGridItems}"
              ></av-property-grid>
            </div>
          </div>
          <div class="row justify-end">
            <av-button @click="${this._saveFieldDescriptors}">Сохранить</av-button>
          </div>
        </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {
    if (changedProps.has('classItem')) {
      this.fieldDescriptors = await this.classItem.getFieldDescriptors();
    }
  }

  async _addField() {
    const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
    if (fieldName && this._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'Строка'};
      this._newFieldDescriptors = [...this._newFieldDescriptors, field];
    }
  }

  async _saveFieldDescriptors() {
    await this.classItem.saveFieldDescriptors(this._newFieldDescriptors);
    this.onSaveFunc();
  }
}

window.customElements.define('av-class-configurator', AvClassConfigurator);
