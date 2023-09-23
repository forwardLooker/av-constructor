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
    `;
  }

  static properties = {
    item: {},
    fieldDescriptors: {},
    onSaveFunc: {}
  };

  constructor() {
    super();
    this.fieldDescriptors = [];
  }

  willUpdate(changedProps) {

  }

  render() {
    return html`
        <div class="col space-between flex-1">
          <div class="col">
            <av-text-header class="margin-top-8">Fields:</av-text-header>
            <av-button @click="${this._addField}">Добавить поле</av-button>
            <av-tree .items="${this.fieldDescriptors}"></av-tree>
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
    if (changedProps.has('item')) {
      this.fieldDescriptors = await this.item.getFieldDescriptors();
    }
  }

  async _addField() {
    const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
    if (fieldName && this.fieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName};
      this.fieldDescriptors = [...this.fieldDescriptors, field];
    }
  }

  async _saveFieldDescriptors() {
    await this.item.saveFieldDescriptors(this.fieldDescriptors);
    this.onSaveFunc();
  }
}

window.customElements.define('av-class-configurator', AvClassConfigurator);
