import {html, css, AVItem} from './0-av-item.js';

import './av-auth.js';
import './4-av-object-document.js'

import '../V/av-tree.js';
import '../V/av-grid.js';

import {Host} from'../M/1-Host.js';

// const config = {
//   version: 1,
//   id: 'main',
//   name: 'Мой Хост',
//   itemType: 'host',
//   items: [
//     {version: 1, id: 'system', name: 'System', itemType: 'domain', items: [
//         {version: 1, id: 'users', name: 'Пользователи', itemType: 'class', items: []}
//       ]},
//     {version: 1, id: 'workspace', name: 'Workspace', itemType: 'domain', items: [
//         {version: 1, id: 'dictionaries', name: 'Справочники', itemType: 'domain', items: [
//             {version: 1, id: '1', name: 'Физ. лица', itemType: 'class', items: []}
//           ]},
//         {version: 1, id: 'documents', name: 'Документы', itemType: 'domain', items: [
//             {version: 1, id: '1', name: 'Приходная налкадная', itemType: 'class', items: []}
//           ]},
//         {version: 1, id: 'services', name: 'Сервисы', itemType: 'domain', items: [
//             {version: 1, id: '1', name: 'Журнал учёта', itemType: 'domain', items: [
//                 {version: 1, id: '1', name: 'Журнал учёта', itemType: 'class', items: []},
//                 {version: 1, id: '2', name: 'Проводки', itemType: 'class', items: []}
//               ]}
//           ]},
//         {version: 1, id: 'solutions', name: 'Решения', itemType: 'domain', items: []},
//         {version: 1, id: 'workplaces', name: 'Рабочие места', itemType: 'domain', items: []},
//       ]},
//   ],
// }

const userObjects = [
  {version: 1, id: '1', name: 'Admin', itemType: 'object', class: 'users', email:'me@mail.ru'},
  {version: 1, id: '2', name: 'User1', itemType: 'object', class: 'users', email:'myself@mail.ru'},
  {version: 1, id: '3', name: 'Account2', itemType: 'object', class: 'users', email:'I@mail.ru'},
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
    config: {},
    selectedObjectDocument: {}
  };

      // config = this.fromHost('config')

      constructor() {
        super();
        const host = new Host();
        AVItem.Host = host;
        this.config = [];
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
              <av-tree .items="${this.config}"></av-tree>
          </div>
          <div id="view-port" class="flex-1 margin-left-8 pad-8 border pos-rel">
              <av-grid
                .items="${userObjects}"
                .columns="${userFieldDescriptors}"
                @row-click="${this.onGridRowClick}"
              >
              </av-grid>
              <av-object-document
                ${this.showIf(this.selectedObjectDocument)}
                class="object-show"
                .object="${this.selectedObjectDocument}"
                @close="${() => {this.selectedObjectDocument = null}}"
              >
              </av-object-document>
          </div>
        </div>
      `
    }

    onGridRowClick(e) {
        console.log('onGridRow:' , e);
        this.selectedObjectDocument = e.detail.rowData;
        console.log('selectedObject:' , this.selectedObjectDocument);
    }

    async firstUpdated() {
      const config = await this.Host.getConfig();
      const reduceSubDomainsAndClassesToItems = (items => {
        items.forEach(i => {
          const classes = i.classes || [];
          const subDomains = i.subDomains || [];
          i.items = [...subDomains, ...classes]
          if (this.notEmpty(i.items)) {
            reduceSubDomainsAndClassesToItems(i.items)
          }
        })
      })
      config.forEach(d => {
        d.items = [...d.config.domains, ...d.config.classes]
        d.items.forEach(i => {
          const classes = i.classes || [];
          const subDomains = i.subDomains || [];
          i.items = [...subDomains, ...classes];
          reduceSubDomainsAndClassesToItems(i.items);
        })
      })
      this.config = config;
    }

    // async updated() {
    //     await this.updateComplete
    //   console.log('av-grid', this.$('av-grid'));
    //   this.$('av-grid').addEventListener('row-click', (e) => console.log('row-click-ev:', e));
    // }
}
window.customElements.define('av-host', AVHost);
