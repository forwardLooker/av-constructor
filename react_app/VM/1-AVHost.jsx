import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVAuth} from "./1-av-host/AVAuth.jsx";
import {AVTree} from '../V/AVTree.jsx'
import {AVDomain} from './2-AVDomain.jsx';
import { AVClass } from './3-AVClass.jsx';
import {AVObjectDocument} from './4-AVObjectDocument.jsx';

import {AVButton} from "../V/AVButton.jsx";
import {AVLabel} from "../V/AVLabel.jsx";
import {AVContextMenu} from "../V/AVContextMenu.jsx";

import {Host} from '../M/1-Host.js';
import { AVIcon } from "../V/icons/AVIcon.jsx";
import {
  createBrowserRouter,
} from "react-router-dom";

export class AVHost extends AVItem {
  static defaultProps = {
    appRef: null // Служит для незаметной перезагрузки Хоста со всеми роутами, полученными из специального Класса в System
  }

  state = {
    config: [],
    selectedTreeItem: null,

    isDialogOpened: false,
    dialogText: '',
    dialogInputLabel: '',
    dialogInputValue: '',
    dialogContent: null,
    _dialogResolveFunc: null,

    dialogItemTreeStructure: null,

    isContextMenuOpened: false,
    contextMenuItems: [],
    contextMenuEvent: null,
    _contextMenuResolveFunc: null,

    toCopyClassReference: null,
    toCopyClassWithData: false,

    designMode: false,
    $designObjectDocument: null,
    
    itemFullScreenMode: false
  }

  constructor() {
    super();
    AVItem.Host = new Host(this);
  }
  
  //render
  
  async componentDidMount() {
    if (!this.props.appRef.state.router) {
      const config = await this.Host.getConfig(); // Чтобы получить роуты требуется на Хосте сначала Конфиг
      const classItemRoutes = this.Host.getClassByName('Роуты');
      const routesArr = await classItemRoutes.getObjectDocuments();
      let routesConfigArr = [
        {
          path: "/",
          element: <AVHost appRef={this.props.appRef}></AVHost>,
        },
      ];
      routesArr.forEach(async routeObjDoc => {
        console.log('routeObjDoc', routeObjDoc);
        // const classItem = this.Host.getClassByPath(routeObjDoc.targetClassPath);
        // const fieldDescriptors = await classItem.getFieldDescriptors();
        // const objectDocument = this.Host.getObjectDocumentByPath(routeObjDoc.targetObjectDocumentPath);
        // await objectDocument.getData();
        routesConfigArr.push({
          path: routeObjDoc.routeRelativePath,
          // element: <div>{routeObjDoc.routeRelativePath}</div>
          element: (<AVObjectDocument
            objectDocumentPath={routeObjDoc.targetObjectDocumentPath}
          ></AVObjectDocument>)
        })
      });
      console.log('routesConfigArr:', routesConfigArr);
      this.props.appRef.setState({
        router: createBrowserRouter(routesConfigArr)
      })
    } else {
      const config = await this.Host.getConfig();
      this.setState({ config });

      // const bodyElem = window.document.getElementsByTagName('body');
      // console.log('bodyElem', bodyElem);
      window.document.addEventListener('keydown', e => {
        console.log('didMountKeyDown', e);
        if (e.key === 'F7') {
          e.preventDefault();
          this.setState(state => ({ itemFullScreenMode: !state.itemFullScreenMode }));
        }
      });
      // bodyElem.focus();
    }
  }

  render() {
    if (!this.props.appRef.state.router) {
      return null
    }
    return (
      <div className="_av-host-root flex-1 col">
        {this._renderHeader()}
        <div className={`flex-1 row ${this.state.itemFullScreenMode ? '' : 'border'}`}>
          {this.user ? this._renderMain() : <AVAuth></AVAuth>}
        </div>
        {this.state.isDialogOpened && this._renderDialog()}
        {this.state.isContextMenuOpened && this._renderContextMenu()}
      </div>
    )
  }

  _renderHeader() {
    if (this.state.itemFullScreenMode) {
      return null
    }
    return (
      <div className="_host-header row space-between pad-0-1dot5em height-10vh">
        <div className="row align-center">
          <div className="pad-0-4">
            <AVIcon name="globe"></AVIcon>
          </div>
          <h3>Хост тест</h3>
        </div>
        {this.user && (
          <div className="col align-center justify-center">
            <div>{this.user?.email}</div>
            <AVButton onClick={() => this.auth.signOut()}>Выйти</AVButton>
          </div>
        )}
      </div>
    )
  }

  _renderMain() {
    return (
      <div className="flex-1 row">
        {this._renderLeftSidebar()}
        <div className={`_av-item-view pos-rel flex-1 col ${this.state.itemFullScreenMode ? '' : 'pad-8 border'} scroll-y`}>
          {this.state.selectedTreeItem?.itemType === 'class' ?
            (<AVClass classItem={this.state.selectedTreeItem} itemFullScreenMode={this.state.itemFullScreenMode}></AVClass>) : ''}
          {this.state.selectedTreeItem?.itemType === 'domain' ?
            (<AVDomain domainItem={this.state.selectedTreeItem}></AVDomain>)  : ''}
        </div>
      </div>
    )
  }

  _renderLeftSidebar() {
    if (this.state.itemFullScreenMode) {
      return null
    }
    return (
      <div className="_host-left-sidebar col font-size-14px pad-8 bg-tree border width-20prc height-90vh scroll-y">
        {this.state.designMode && this._renderInstrumentPanel()}
        {!this.state.designMode && (
          <AVTree
            items={this.state.config}
            expandAllRowsNestedLevel={3}
            onItemSelectFunc={this._onTreeItemSelect}
            onItemContextMenuFunc={this._onTreeItemContextMenu}
          ></AVTree>
        )}
      </div>
    )
  }

  _renderInstrumentPanel() {
    return (
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
          <div
              className="border pad-4"
              draggable="true"
              onDragStart={(e) => this.state.$designObjectDocument.dragstart(
                  e,
                  {
                    designDragElement: {viewItemType: 'label', label: 'label'},
                    designDragElementOrigin: 'instrument panel'
                  }
              )}
          >
            label
          </div>
          <div
              className="border pad-4"
              draggable="true"
              onDragStart={(e) => this.state.$designObjectDocument.dragstart(
                  e,
                  {
                      designDragElement: {viewItemType: 'button', label: 'button'},
                      designDragElementOrigin: 'instrument panel'
                  }
              )}
          >
            button
          </div>
          <div
            className="border pad-4"
            draggable="true"
            onDragStart={(e) => this.state.$designObjectDocument.dragstart(
                e,
                {
                  designDragElement: {
                      viewItemType: 'tabs',
                      items: [
                          {
                              viewItemType: 'tab',
                              label: 'tab 1',
                              items: [{
                                  viewItemType: 'vertical-layout',
                                  items: [{
                                      viewItemType: 'space div'
                                  }]
                              }]
                          }
                      ]
                  },
                  designDragElementOrigin: 'instrument panel'
                }
            )}
          >
            tabs
          </div>
          <div
            className="border pad-4"
            draggable="true"
            onDragStart={(e) => this.state.$designObjectDocument.dragstart(
              e,
              {
                designDragElement: { viewItemType: 'gazprombank progress bar' },
                designDragElementOrigin: 'instrument panel'
              }
            )}
          >
            gazprombank progress bar
          </div>
        </div>
    )
  }

  _renderDialog() {
    return (
      <div className="pos-fixed trbl-0 row justify-center align-center z-index-1000 bg-transparent-45">
        <div className="bg-white">
          <div>{this.state.dialogText}</div>
          {this.state.dialogContent}
          {this.state.dialogInputLabel && (
            <div className='row'>
              <AVLabel>{this.state.dialogInputLabel}</AVLabel>
              <textarea
                className='flex-1'
                rows={8}
                value={this.state.dialogInputValue}
                onChange={e => this.setState({dialogInputValue: e.target.value})}>
              </textarea>
            </div>
          )}
          {this.state.dialogItemTreeStructure && (
            <AVTree
              items={this.state.dialogItemTreeStructure.items}
              expandAllRowsNestedLevel={1}
              onItemSelectFunc={(item) => this.setState({dialogInputValue: item})}
            ></AVTree>
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
    if (item.id === 'system') {
      // return;
    }
    if (item.itemType === 'domain') {
      let menu = [
        'Создать вложенный класс',
        'Создать вложенный домен',
        'Создать вложенную папку',
        'Переименовать домен',
        'Переместить в дереве вверх',
        'Переместить в дереве вниз',
      ];
      if (item.id !== 'workspace' && item.id !== 'system') {
        menu.push('Удалить домен');
      };
      if (this.state.toCopyClassReference) {
        menu.push('Вставить скопированный класс');
      }
      const menuChoice = await this.showContextMenu(e, menu);
      if (menuChoice === 'Создать вложенный класс') {
        const className = await this.showDialog({text: 'Введите название класса', inputLabel: 'name'});
        if (className) {
          const domain = this.Host.getDomain(item.reference);
          await domain.createClass(className);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Создать вложенный домен') {
        const domainName = await this.showDialog({text: 'Введите название домена', inputLabel: 'name'});
        if (domainName) {
          const domain = this.Host.getDomain(item.reference);
          await domain.createDomain(domainName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Создать вложенную папку') {
        const folderName = await this.showDialog({text: 'Введите название папки', inputLabel: 'name'});
        if (folderName) {
          const domain = this.Host.getDomain(item.reference);
          await domain.createFolderInConfig(folderName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Переименовать домен') {
        const newDomainName = await this.showDialog({text: 'Введите новое название домена', inputLabel: 'name'});
        if (newDomainName) {
          const domain = this.Host.getDomain(item.reference);
          await domain.renameDomain(newDomainName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Переместить в дереве вверх') {
        const domain = this.Host.getDomain(item.reference);
        await domain.moveDomainUpInConfig();
        const config = await this.Host.getConfig();
        this.setState({config});
      }
      if (menuChoice === 'Переместить в дереве вниз') {
        const domain = this.Host.getDomain(item.reference);
        await domain.moveDomainDownInConfig();
        const config = await this.Host.getConfig();
        this.setState({config});
      }
      if (menuChoice === 'Удалить домен') {
        const ok = await this.showDialog({text: `Хотите ли вы удалить домен ${item.name}?`});
        if (ok) {
          const domain = this.Host.getDomain(item.reference);
          await domain.deleteDomain();
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Вставить скопированный класс') {
        const domain = this.Host.getDomain(item.reference);
        if (this.state.toCopyClassWithData) {
          await domain.createClassCopyFromReferenceWithData(this.state.toCopyClassReference);
        } else {
          await domain.createClassCopyFromReference(this.state.toCopyClassReference);
        }
        const config = await this.Host.getConfig();
        this.setState({
          config,
          toCopyClassReference: null,
          toCopyClassWithData: false
        });
      }

    } else if (item.itemType === 'class') {
      const menuChoice = await this.showContextMenu(e, [
        'Переименовать класс',
        'Копировать класс',
        'Копировать класс и данные',
        'Отобразить внутри папки',
        'Переместить в дереве вверх',
        'Переместить в дереве вниз',
        'Удалить класс'
      ]);
      if (menuChoice === 'Переименовать класс') {
        const newClassName = await this.showDialog({text: 'Введите новое название класса', inputLabel: 'name'});
        if (newClassName) {
          const classItem = this.Host.getClass(item.reference);
          await classItem.renameClass(newClassName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Удалить класс') {
        const ok = await this.showDialog({text: `Хотите ли вы удалить класс ${item.name}?`});
        if (ok) {
          const classItem = this.Host.getClass(item.reference);
          await classItem.deleteClass();
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Копировать класс') {
        this.setState({toCopyClassReference: item.reference})
      }
      if (menuChoice === 'Копировать класс и данные') {
        this.setState({
          toCopyClassReference: item.reference,
          toCopyClassWithData: true
        })
      }
      if (menuChoice === 'Отобразить внутри папки') {
        const folderName = await this.showDialog({text: 'Введите название папки', inputLabel: 'name'});
        if (folderName) {
          const classItem = this.Host.getClass(item.reference);
          await classItem.moveClassInFolderInConfig(folderName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Переместить в дереве вверх') {
        const classItem = this.Host.getClass(item.reference);
        await classItem.moveClassUpInConfig();
        const config = await this.Host.getConfig();
        this.setState({config});
      }
      if (menuChoice === 'Переместить в дереве вниз') {
        const classItem = this.Host.getClass(item.reference);
        await classItem.moveClassDownInConfig();
        const config = await this.Host.getConfig();
        this.setState({config});
      }
    }
    if (item.itemType === 'classFolder') {
      const menuChoice = await this.showContextMenu(e, [
        'Переименовать папку',
        'Расформировать папку',
        'Переместить в дереве вверх',
        'Переместить в дереве вниз',
      ]);
      if (menuChoice === 'Переименовать папку') {
        const newFolderName = await this.showDialog({text: 'Введите новое название папки', inputLabel: 'name'});
        if (newFolderName) {
          const domain = this.Host.getDomain(null, item.domainId); //TODO у айтема папки должен быть референс на домен, а не только id
          await domain.renameFolderInConfig(item.name, newFolderName);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Расформировать папку') {
        const ok = await this.showDialog({text: `Хотите ли вы расформировать папку ${item.name}?`});
        if (ok) {
          const domain = this.Host.getDomain(null, item.domainId); //TODO у айтема папки должен быть референс на домен, а не только id
          await domain.disbandFolderInConfig(item.name);
          const config = await this.Host.getConfig();
          this.setState({config});
        }
      }
      if (menuChoice === 'Переместить в дереве вверх') {
        const domain = this.Host.getDomain(null, item.domainId);
        await domain.moveFolderUpInConfig(item.name);
        const config = await this.Host.getConfig();
        this.setState({config});
      }
      if (menuChoice === 'Переместить в дереве вниз') {
        const domain = this.Host.getDomain(null, item.domainId);
        await domain.moveFolderDownInConfig(item.name);
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

  async showDialog({text, inputLabel, itemTreeStructure, content}) {
    return new Promise((resolve, reject) => {
      this.setState({
        isDialogOpened: true,
        dialogText: text,
        dialogInputLabel: inputLabel,
        dialogContent: content,
        _dialogResolveFunc: resolve,

        dialogItemTreeStructure: itemTreeStructure
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
      dialogContent: null,
      _dialogResolveFunc: null,

      dialogItemTreeStructure: null
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
