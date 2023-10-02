import {html, css, AVItem} from './0-av-item.js';

import './3-av-class.js';
import './2-av-domain.js';
import './1-av-host/av-auth.js';

import '../V/av-text-header.js';
import '../V/av-label.js';
import '../V/av-text-input.js';

import '../V/av-tree.js';
import '../V/av-context-menu.js';
import '../V/av-property-grid.js';

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
      #view-port {
        overflow: scroll;
      }
      \
      #dialog-container {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0,0,0,0.45);
        z-index: 1000;
      }
      #dialog-form {
        background: white;
      }
      #context-menu {
        
      }
    `;
  }

  static properties = {
    config: {},
    selectedTreeItem: {},
    dialogShowed: {},
    dialogText: {},
    dialogInputLabel: {},
    dialogInputValue: {},
    contextMenuOpened: {},
    contextMenuItems: {},
  };

      // config = this.fromHost('config') row justify-center align-center

  constructor() {
    super();
    AVItem.Host = new Host(this);
    this.config = [];
    this.dialogInputValue = '';
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem')) {
      this.currentViewName = this.classItem.defaultViewName
    }
  }

  render() {
    return html`
      <div id="header" class="row space-between">
        <h3>Хост тест</h3>
        <div ${this.showIf(this.user)} class="col align-center justify-center">
            <div>${this.user?.email}</div>
            <av-button @click="${() => this.auth.signOut()}">Выйти</av-button>
        </div>
      </div>
      <div id="main" class="flex-1 row pad-8 border">
        ${this.user ?  this._renderMain() : html`<av-auth></av-auth>`}
      </div>
      <div ${this.showIf(this.dialogShowed)} id="dialog-container" class="pos-fixed row justify-center align-center">
          <div id="dialog-form">
              <div>${this.dialogText}</div>
              <div ${this.showIf(this.dialogInputLabel)}>
                  <label>${this.dialogInputLabel}:</label>
                  <input .value="${this.dialogInputValue}" @input="${e => {this.dialogInputValue = e.target.value}}">
              </div>
              <div>
                  <av-button @click="${() => {this.fire('dialog-submitted')}}">OK</av-button>
                  <av-button @click="${() => {this.fire('dialog-closed')}}">Отмена</av-button>
              </div>
          </div>
      </div>
      <av-context-menu></av-context-menu>
    `
  }

  _renderMain() {
    return html`
      <div class="flex-1 row">
        <div id="left-sidebar" class="col pad-8 border">
            <av-tree
              .items="${this.config}"
              .onItemSelectFunc="${this._onTreeItemSelect}"
              .onItemContextMenuFunc="${this._onTreeItemContextMenu}"
            ></av-tree>
        </div>
        <div id="view-port" class="col flex-1 margin-left-8 pad-8 border pos-rel">
            ${this.selectedTreeItem?.itemType === 'class' ?
              html`<av-class .classItem="${this.selectedTreeItem}"></av-class>` : this.nothing}
            ${this.selectedTreeItem?.itemType === 'domain' ?
              html`<av-domain .domainItem="${this.selectedTreeItem}"></av-domain>` : this.nothing}
        </div>
      </div>
    `
  }

  async firstUpdated() {
    const config = await this.Host.getConfig();
    this.config = config;
  }

  updated(changedProps) {

  }

  _onTreeItemContextMenu = async (e, item) => {
    e.preventDefault();
    if (item.itemType !== 'domain' || item.id === 'system') {
      return;
    }
    const menuChoice = await this.showContextMenu(e, ['Создать вложенный класс', 'Создать вложенный домен']);
    if (menuChoice === 'Создать вложенный класс') {
      const className = await this.showDialog({text: 'Введите название класса', input: 'name'});
      if (className) {
        const domain = this.Host.getDomain(item.reference);
        await domain.createClass(className);
        const config = await this.Host.getConfig();
        this.config = config;
      }
      // if (className) {
      //   if (this.notEmpty(item.items) && item.items.every(f => f.name !== fieldName)) {
      //     item.items.push({name: fieldName, label: fieldName, dataType: 'string'})
      //   }
      //   if (this.isEmpty(item.items)) {
      //     item.items = [{name: fieldName, label: fieldName, dataType: 'string'}];
      //   }
      //   this._newFieldDescriptors = [...this._newFieldDescriptors];
      // }
    }
  }

  async showContextMenu(e, menuItems) {
      e.preventDefault();
      const menu = this.$('av-context-menu');
      return menu.show(e, menuItems);
  }

  async showDialog({text, input}) {
    this.dialogShowed = true;
    this.dialogText = text;
    this.dialogInputLabel = input;
    return new Promise((resolve, reject) => {
      const listenerOnClose = () => {
        this.removeEventListener('dialog-closed', listenerOnClose);
        this.dialogShowed = false;
        this.dialogText = '';
        this.dialogInputLabel = '';
        resolve(false);
      }
      this.addEventListener('dialog-closed', listenerOnClose);

      const listenerOnSubmit = () => {
        this.removeEventListener('dialog-submitted', listenerOnSubmit);
        const resolveValue = this.dialogInputValue || true;
        this.dialogShowed = false;
        this.dialogText = '';
        this.dialogInputLabel = '';
        this.dialogInputValue = '';
        resolve(resolveValue);
      }
      this.addEventListener('dialog-submitted', listenerOnSubmit)
    })
  }

  _onTreeItemSelect = async (item) => {
    // console.log('onTreeItemSelect:', e);
    if (item.itemType === 'class') {
      this.selectedTreeItem = this.Host.getClass(item.reference);
    }
    if (item.itemType === 'domain') {
      this.selectedTreeItem = this.Host.getDomain(item.reference)
    }
  }
}
window.customElements.define('av-host', AVHost);
