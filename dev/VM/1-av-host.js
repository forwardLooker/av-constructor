import {html, css, AVItem} from './0-av-item.js';

import './av-auth.js';

import '../V/av-tree.js';

import {Host} from'../M/1-Host.js';

const config = {
  version: 1,
  id: 'main',
  name: 'Мой Хост',
  itemType: 'host',
  items: [
    {version: 1, id: 'system', name: 'System', itemType: 'domain', items: [
        {version: 1, id: 'users', name: 'Пользователи', itemType: 'class', items: []}
      ]},
    {version: 1, id: 'workspace', name: 'Workspace', itemType: 'domain', items: [
        {version: 1, id: 'dictionaries', name: 'Справочники', itemType: 'domain', items: [
            {version: 1, id: '1', name: 'Физ. лица', itemType: 'class', items: []}
          ]},
        {version: 1, id: 'documents', name: 'Документы', itemType: 'domain', items: [
            {version: 1, id: '1', name: 'Приходная налкадная', itemType: 'class', items: []}
          ]},
        {version: 1, id: 'services', name: 'Сервисы', itemType: 'domain', items: [
            {version: 1, id: '1', name: 'Журнал учёта', itemType: 'domain', items: [
                {version: 1, id: '1', name: 'Журнал учёта', itemType: 'class', items: []},
                {version: 1, id: '2', name: 'Проводки', itemType: 'class', items: []}
              ]}
          ]},
        {version: 1, id: 'solutions', name: 'Решения', itemType: 'domain', items: []},
        {version: 1, id: 'workplaces', name: 'Рабочие места', itemType: 'domain', items: []},
      ]},
  ],
}

const userObjects = [
  {version: 1, id: '1', name: 'Admin', itemType: 'object', email:'my@mail.ru'},
  {version: 1, id: '1', name: 'Admin', itemType: 'object', email:'my@mail.ru'},
  {version: 1, id: '1', name: 'Admin', itemType: 'object', email:'my@mail.ru'},
];
const userFieldDescriptors = [
  {name: 'id', itemType: 'field'},
  {name: 'name', itemType: 'field'},
  {name: 'email', itemType: 'field'}
];

export class AVHost extends AVItem {
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
      #left-sidebar {
        width: 20%;
      }
    `;
  }

  static properties = {
    config: {},
  };

      // config = this.fromHost('config')

      constructor() {
        super();
        const host = new Host();
        AVItem.Host = host;
      }

    render() {
      return html`
        <div id="header" class="row space-between">
          <h3>Хост тест</h3>
          <div ${this.showIf(this.user)} class="col align-center justify-center">
              <div>${this.user?.email}</div>
              <button @click="${() => this.auth.signOut()}">Выйти</button>
          </div>
        </div>
        <div id="main" class="flex-1 row pad-8 border">
          ${
            this.user ?  this.renderMain() : html`<av-auth></av-auth>`
          }
        </div>
      `
    }

    renderMain() {
      return html`
        <div class="flex-1 row">
          <div id="left-sidebar" class="col pad-8 border">
              <av-tree .items="${config.items}"></av-tree>
          </div>
          <div id="view-port" class="flex-1 margin-left-8 pad-8 border">
              <av-grid .items="${userObjects}" .columns="${userFieldDescriptors}"></av-grid>
          </div>
        </div>
      `
    }

    async firstUpdated() {
      const config = await this.Host.getConfig();
      this.config = config.map(doc => doc.data());
    }
}
window.customElements.define('av-host', AVHost);
