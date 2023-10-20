import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVAuth} from "./1-av-host/AVAuth.jsx";
import {AVTree} from '../V/AVTree.jsx'
import {AVDomain} from './2-AVDomain.jsx';
import {AVClass} from './3-AVClass.jsx';

import {AVButton} from "../V/AVButton.jsx";
import {AVLabel} from "../V/AVLabel.jsx";

import {Host} from'../M/1-Host.js';

const css = () => {};
const html = () => {};

export class AVHost extends AVItem {
  static styles = {
    header: this.styled.div`
      padding: 0 1.5em;
      box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
    `,
    leftSidebar: this.styled.div`
      width: 20%;
    `,
  };

  state = {
    config: [],
    selectedTreeItem: null,

    isDialogOpened: false,
    dialogText: '',
    dialogInputLabel: '',
    dialogInputValue: '',

    isContextMenuOpened: false,
    contextMenuItems: [],
  }

  constructor() {
    super();
    AVItem.Host = new Host(this);
  }

  render() {
    return (
        <div className="flex-1 col">
          {this._renderHeader()}
          <div className="flex-1 row pad-8 border">
            {this.user ?  this._renderMain() : <AVAuth></AVAuth>}
          </div>
          {this.state.isDialogOpened && this._renderDialog()}
          <div>av-context-menu</div>
        </div>
    )
  }

  _renderHeader() {
    return (
      <AVHost.styles.header className="row space-between">
        <h3>Хост тест</h3>
        {this.user && (
          <div className="col align-center justify-center">
            <div>{this.user?.email}</div>
            <AVButton onClick={() => this.auth.signOut()}>Выйти</AVButton>
          </div>
        )}
      </AVHost.styles.header>
    )
  }

  _renderMain() {
    return (
      <div className="flex-1 row">
        <AVHost.styles.leftSidebar className="col pad-8 border">
          <AVTree
            items={this.state.config}
            onItemSelectFunc={this._onTreeItemSelect}
            onItemContextMenuFunc={this._onTreeItemContextMenu}
          ></AVTree>
        </AVHost.styles.leftSidebar>
        <div className="pos-rel flex-1 col margin-left-8 pad-8 border scroll-y">
          {this.state.selectedTreeItem?.itemType === 'class' ?
            (<AVClass classItem={this.state.selectedTreeItem}></AVClass>) : ''}
          {this.state.selectedTreeItem?.itemType === 'domain' ?
            (<AVDomain domainItem={this.state.selectedTreeItem}></AVDomain>)  : ''}
        </div>
      </div>
    )
  }

  _renderDialog() {
    return (
      <div className="pos-fixed trbl-0 row justify-center align-center z-index-1000 bg-transparent-45">
        <div className="bg-white">
          <div>{this.state.dialogText}</div>
          {this.state.dialogInputLabel && (
            <div>
              <AVLabel>${this.state.dialogInputLabel}:</AVLabel>
              <input value={this.state.dialogInputValue} onChange={e => {this.setState({dialogInputValue: e.target.value})}}></input>
            </div>
          )}
          <div>
            <AVButton onClick={() => {this.fire('dialog-submitted')}}>OK</AVButton>
            <AVButton onClick={() => {this.fire('dialog-closed')}}>Отмена</AVButton>
          </div>
        </div>
      </div>
    )
  }

  async componentDidMount() {
    const config = await this.Host.getConfig();
    this.setState({config});
  }

  _onTreeItemSelect = async (item) => {
    // console.log('onTreeItemSelect:', e);
    if (item.itemType === 'class') {
      this.setState({selectedTreeItem: this.Host.getClass(item.reference)})
    }
    if (item.itemType === 'domain') {
      this.setState({selectedTreeItem: this.Host.getDomain(item.reference)})
    }
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
        this.setState({config});
      }
    }
  }

  // async showContextMenu(e, menuItems) {
  //   e.preventDefault();
  //   const menu = this.$('av-context-menu');
  //   return menu.show(e, menuItems);
  // }

  async showDialog({text, input}) {
    this.setState({
      isDialogOpened: true,
      dialogText: text,
      dialogInputLabel: input
    })
    return new Promise((resolve, reject) => {
      const listenerOnClose = () => {
        this.removeEventListener('dialog-closed', listenerOnClose);
        this.setState({
          isDialogOpened: true,
          dialogText: '',
          dialogInputLabel: ''
        })
        resolve(false);
      }
      this.addEventListener('dialog-closed', listenerOnClose);

      const listenerOnSubmit = () => {
        this.removeEventListener('dialog-submitted', listenerOnSubmit);
        const resolveValue = this.state.dialogInputValue || true;
        this.setState({
          isDialogOpened: false,
          dialogText: '',
          dialogInputLabel: '',
          dialogInputValue: ''
        })
        resolve(resolveValue);
      }
      this.addEventListener('dialog-submitted', listenerOnSubmit)
    })
  }
}

class AVHost2 extends AVItem {
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
