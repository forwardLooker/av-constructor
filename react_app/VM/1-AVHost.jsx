import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVAuth} from "./1-av-host/AVAuth.jsx";
import {AVTree} from '../V/AVTree.jsx'
import {AVDomain} from './2-AVDomain.jsx';
import {AVClass} from './3-AVClass.jsx';

import {AVButton} from "../V/AVButton.jsx";
import {AVLabel} from "../V/AVLabel.jsx";
import {AVContextMenu} from "../V/AVContextMenu.jsx";

import {Host} from'../M/1-Host.js';

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
    _dialogResolveFunc: null,

    isContextMenuOpened: false,
    contextMenuItems: [],
    contextMenuEvent: null,
    _contextMenuResolveFunc: null,

    designMode: false,
    $designObjectDocument: null
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
          {this.state.isContextMenuOpened && this._renderContextMenu()}
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
          {this.state.designMode && (
            <div className="col">
              <div
                className="border pad-4"
                draggable="true"
                onDragStart={(e) => this.state.$designObjectDocument.dragstart(
                  e,
                  {
                    designDragElement: {viewItemType: 'space div'},
                    designDragElementOrigin: 'instrument panel'
                  }
                )}
              >
                space div
              </div>
            </div>
          )}
          {!this.state.designMode && (
            <AVTree
              items={this.state.config}
              onItemSelectFunc={this._onTreeItemSelect}
              onItemContextMenuFunc={this._onTreeItemContextMenu}
            ></AVTree>
          )}
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
              <AVLabel>{this.state.dialogInputLabel}</AVLabel>
              <input
                value={this.state.dialogInputValue}
                onChange={e => this.setState({dialogInputValue: e.target.value})}>
              </input>
            </div>
          )}
          <div>
            <AVButton onClick={this._dialogSubmitted}>OK</AVButton>
            <AVButton onClick={this._dialogCanceled}>Отмена</AVButton>
          </div>
        </div>
      </div>
    )
  }

  _renderContextMenu() {
    return (
      <AVContextMenu
        items={this.state.contextMenuItems}
        contextMenuEvent={this.state.contextMenuEvent}
        onItemSelectFunc={item => {
          const resolveFunc = this.state._contextMenuResolveFunc;
          this.setState({
            isContextMenuOpened: false,
            contextMenuItems: [],
            contextMenuEvent: null,
            _contextMenuResolveFunc: null
          });
          resolveFunc(item)
        }}
      ></AVContextMenu>
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
      const className = await this.showDialog({text: 'Введите название класса', inputLabel: 'name'});
      if (className) {
        const domain = this.Host.getDomain(item.reference);
        await domain.createClass(className);
        const config = await this.Host.getConfig();
        this.setState({config});
      }
    }
  }

  async showContextMenu(e, menuItems) {
    e.preventDefault();
    e.persist();
    return new Promise((resolve, reject) => {
      this.setState({
        isContextMenuOpened: true,
        contextMenuItems: menuItems,
        contextMenuEvent: e,
        _contextMenuResolveFunc: resolve
      })
    })
  }

  async showDialog({text, inputLabel}) {
    return new Promise((resolve, reject) => {
      this.setState({
        isDialogOpened: true,
        dialogText: text,
        dialogInputLabel: inputLabel,
        _dialogResolveFunc: resolve
      })
    })
  }

  _dialogSubmitted = () => {
    const resolveValue = this.state.dialogInputValue || true;
    const resolveFunc = this.state._dialogResolveFunc;
    this.setState({
      isDialogOpened: false,
      dialogText: '',
      dialogInputLabel: '',
      dialogInputValue: '',
      _dialogResolveFunc: null
    });
    resolveFunc(resolveValue);
  }

  _dialogCanceled = () => {
    const resolveFunc = this.state._dialogResolveFunc;
    this.setState({
      isDialogOpened: false,
      dialogText: '',
      dialogInputLabel: '',
      dialogInputValue: '',
      _dialogResolveFunc: null
    });
    resolveFunc(false);
  }

}
