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
    if (changedProps.has('fieldDescriptors') && this.fieldDescriptors) {
      this._newFieldDescriptors = this.deepClone(this.fieldDescriptors);
    }
  }

  render() {
    const prGridItems = [
      {name: 'label'},
      {name: 'dataType', dataType: 'string', variant: 'select', valuesList: 'string,number,boolean,array,object, link, include-link'},
      {name: 'variant'},
      {name: 'valuesList'},
      {name: 'defaultValue'},
    ];
    return html`
        <div class="col space-between flex-1">
          <div class="col flex-1">
            <av-text-header class="margin-top-8">Fields:</av-text-header>
            <div>
              <av-button @click="${this._addField}">Добавить поле</av-button>
            </div>
            <div class="row flex-1 margin-top-8">
              <av-tree
                class="fields-tree border"
                .items="${this._newFieldDescriptors}"
                .onItemSelectFunc="${item => this.selectedField = item}"
                .onItemContextMenuFunc="${this._onTreeItemContextMenu}"
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

  _onTreeItemContextMenu = async (e, item) => {
    const menuChoice = await this.showContextMenu(e, ['Добавить вложенное поле', 'Удалить поле']);
    if (menuChoice === 'Добавить вложенное поле') {
      const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
      if (fieldName) {
        if (this.notEmpty(item.items) && item.items.every(f => f.name !== fieldName)) {
          item.items.push({name: fieldName, label: fieldName, dataType: 'string'})
        }
        if (this.isEmpty(item.items)) {
          item.items = [{name: fieldName, label: fieldName, dataType: 'string'}];
        }
        this._newFieldDescriptors = [...this._newFieldDescriptors];
      }
    }
  }

  async _addField() {
    const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
    if (fieldName && this._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'string'};
      this._newFieldDescriptors = [...this._newFieldDescriptors, field];
    }
  }

  async _saveFieldDescriptors() {
    await this.classItem.saveFieldDescriptors(this._newFieldDescriptors);
    this.onSaveFunc();
  }
}

window.customElements.define('av-class-configurator', AvClassConfigurator);
