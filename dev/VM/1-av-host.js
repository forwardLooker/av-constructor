import {html, css, AVItem} from './0-av-item.js';

import './av-auth.js';

import '../V/av-tree.js';

import {Host} from'../M/1-Host.js';

const domains = [
  {id:'system', name: 'System'},
  {id: 'workspace', name: 'Workspace'}
]
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
      #sidebar {
        width: 20%;
      }
    `;
  }

  static properties = {
    domainsList: {},
    docList: {}
  };

      // config = this.fromHost('config')

      constructor() {
        super();
        const host = new Host();
        AVItem.Host = host;
        this.domainsList = [];
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
        <main class="flex-1 row pad-8 border">
          ${
            this.user ?  this.renderDomainsList() : html`<av-auth></av-auth>`
          }
        </main>
      `
    }

    renderDomainsList() {
      return html`
        <div class="flex-1 row">
          <div id="sidebar" class="col pad-8 border">
              <av-tree .items="${config.items}"></av-tree>
          </div>
          <div id="content" class="flex-1 margin-left-8 pad-8 border">
              Manage complexity by building large, complex components
              out of smaller, simpler components that do one thing well.
          </div>
        </div>
      `
    }

    async firstUpdated() {
      const domainsList = await this.Host.getConfig();
      this.domainsList = domainsList.map(doc => doc.data());
      this.docList = domainsList;
    }
}
window.customElements.define('av-host', AVHost);
