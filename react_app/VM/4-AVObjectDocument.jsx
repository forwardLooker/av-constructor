import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClass} from './3-AVClass.jsx';
import {AVField} from './5-AVField.jsx';

import {AVButton} from "../V/AVButton.jsx";

export class AVObjectDocument extends AVItem {
  static styles = {
    horizontalResizer: this.styled.div`
      width: 4px;
      height: 100%;
      cursor: col-resize;
    `
  }

  static defaultProps = {
    fieldDescriptors: [],
    objectDocument: null,
    onSavedFunc: this.noop,
    onCloseFunc: this.noop,
  }
  state = {
    _newData: this.props.objectDocument.data,

    designMode: false,
    designJson: null,
    designDragElementIndex: null,
    designDragElement: null,
    designDragContainer: null,
    designDragElementOrigin: '', // enum ['instrument panel', 'objectDocument']
    designDropSide: 'none', // enum: ['top', 'bottom', 'left', 'right', 'none']

    isClassItemOpened: false,
    openedClassItem: null,
    onObjectDocumentSelectedInOpenedClassItem: this.noop
  }

  constructor(props) {
    super(props);

    this._prepareDesignJson();
  }

  _prepareDesignJson = () => {
    if (this.props.objectDocument) {
      if (this.props.objectDocument.designJson) {
        const designJson = this.deepClone(this.props.objectDocument.designJson);
        const fieldDescriptors = this.deepClone(this.props.fieldDescriptors);

        // upgrade metadata
        fieldDescriptors.forEach(fD => {
          const fieldInOrigItems = designJson.originalItems.find(origItem => origItem.name === fD.name);
          if (fieldInOrigItems) {
            if (!this.isDeepEqual(fD, fieldInOrigItems)) {
              const fieldInDesign = this.findDeepObjInItemsBy({name: fD.name}, designJson);
              if (fieldInDesign) {
                Object.keys(fD).forEach(prop => {
                  fieldInDesign[prop] = fD[prop];
                  fieldInOrigItems[prop] = fD[prop];
                });
              }
            }
          }
        })
        // find added and deleted
        const addedItems = this._findNewFieldDescriptors(fieldDescriptors, designJson.originalItems);
        const deletedItems = this._findDeletedFieldDescriptors(fieldDescriptors, designJson.originalItems);
        // add
        designJson.items = designJson.items.concat(addedItems);
        designJson.originalItems = designJson.originalItems.concat(addedItems);
        // delete
        this._addContainerReference(designJson);
        this._removeDeletedItems(designJson, deletedItems); // in designJson.items
        deletedItems.forEach(delItem => { // in designJson.originalItems
          const forDelIndexInOrigItems = designJson.originalItems.findIndex(origItem => origItem.name === delItem.name);
          designJson.originalItems.splice(forDelIndexInOrigItems, 1);
        })
        this.state.designJson = designJson;
      } else {
        this.state.designJson = {
          viewItemType: 'vertical-layout',
          items: this.deepClone(this.props.fieldDescriptors),
          originalItems: this.deepClone(this.props.fieldDescriptors)
        };
      }
    }
  }

  render() {
    return (
      <div className="flex-1 col font-apple">
        <div className="flex-1 col space-between line-height-1-5">
          <div>
            {this._renderVerticalLayout(this.state.designJson)}
          </div>
          <div className="row justify-end">
            <div>
              <AVButton onClick={this._saveAndClose}>OK</AVButton>
              <AVButton onClick={this._closeWithoutSave}>Отмена</AVButton>
              <AVButton onClick={this._toggleDesign}>Дизайнер</AVButton>
            </div>
          </div>
        </div>
        {this.state.isClassItemOpened && (
          <div className="pos-abs trbl-0 z-index-100 bg-white">
            <AVClass
              classItem={this.state.openedClassItem}
              onObjectDocumentSelectedFunc={this.state.onObjectDocumentSelectedInOpenedClassItem}
            ></AVClass>
          </div>
        )}
      </div>
    )
  }

  _renderVerticalLayout(vrtLayoutItem, vrtLayoutItemIndex) {
    return (
      <div
        className="vertical-layout flex-1 col"
        style={vrtLayoutItem.style}
        ref={vrtDomElement => vrtLayoutItem.domElement = vrtDomElement}
        key={vrtLayoutItemIndex || 0}
      >
        {vrtLayoutItem.items.map((vrtItem, vrtIndex) => {
          if (vrtItem.viewItemType === 'horizontal-layout') {
            return (
              <div
                className="horizontal-layout flex-1 row"
                key={vrtIndex}
                ref={hrzDomElement => vrtItem.domElement = hrzDomElement}
              >
                {vrtItem.items.map((hrzItem, hrzIndex) => {
                  if (hrzItem.viewItemType === 'vertical-layout') {
                    return this._renderVerticalLayout(hrzItem, hrzIndex);
                  } else {
                    return this._renderField(hrzItem, hrzIndex, vrtItem)
                  }
                })}
              </div>
            )
          }
          if (vrtItem.viewItemType === 'field' || !vrtItem.viewItemType ||
            (vrtItem.viewItemType !== 'vertical-layout' && vrtItem.viewItemType !== 'horizontal-layout')
          ) {
            return this._renderField(vrtItem, vrtIndex, vrtLayoutItem)
          }
        })}
      </div>
    )
  }

  _renderField(fieldItem, idx, containerElement) {
    if (fieldItem.viewItemType === 'tabs') {
      if (!fieldItem.items) {
        fieldItem.items = [
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
      }
      if (!fieldItem.selectedTabLabel) {
        fieldItem.selectedTabLabel = fieldItem.items[0].label;
      }
      return (
          <div className='flex-1 pad-8'
               style={fieldItem.style}
               ref={fieldDomElement => fieldItem.domElement = fieldDomElement}
          >
            <div className='_tab-container flex-1'>
              <div className='_tab-head row'>
                {fieldItem.items.map(tab => (
                    <div className='pad-0-4 border'
                         onClick={() => {
                           fieldItem.selectedTabLabel = tab.label;
                           this.forceUpdate();
                         }}
                         onContextMenu={e => this._onTabContextMenu(e, tab, fieldItem)}
                    >{tab.label || 'tab1'}</div>
                ))}
                <div className='flex-1'></div>
              </div>
              <div className='_tabs-body-container pad-8 border'>
                {fieldItem.items.map(tab => (
                    <div className="_tab-body" hidden={fieldItem.selectedTabLabel !== tab.label}>
                      {this._renderVerticalLayout(tab.items[0])}
                    </div>
                ))}
              </div>
            </div>
          </div>
      )
    }

    return (
      <div
        className="pos-rel col flex-1 margin-top-2"
        style={fieldItem.style}
        key={fieldItem.name || idx}
      >
        <AVField
          refOnRootDiv={fieldDomElement => fieldItem.domElement = fieldDomElement}
          fieldItem={fieldItem}
          value={this.state._newData[fieldItem.name]}
          onChangeFunc={value => {this.state._newData[fieldItem.name] = value}}
          labelPosition={fieldItem.dataType === 'array' ? 'top' : 'left'}
          $objectDocument={this}
        >
          {this.state.designMode && (
            <div className="field-overlay pos-abs trbl-0 row border-1 bg-transparent-25">
              <div className="flex-1 col">
                <div className="flex-1 row">
                  <div className="flex-1 z-index-10000"
                       draggable="true"
                       onDragStart={(e) => this.dragstart(
                           e,
                           {
                             designDragElement: fieldItem,
                             designDragElementIndex: idx,
                             designDragContainer: containerElement,
                             designDragElementOrigin: 'objectDocument'
                           },
                       )}
                       onDragOver={this._dragover}
                       onDragLeave={this._dragleave}
                       onDrop={(e) => this._drop(e, fieldItem, idx, containerElement)}
                       onContextMenu={(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}
                  ></div>
                  <AVObjectDocument.styles.horizontalResizer
                      onMouseDown={(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement)}
                  ></AVObjectDocument.styles.horizontalResizer>
                </div>
                <div className="width-100 height-2px cursor-row-resize"
                     onMouseDown={(e) => this._startVerticalResize(e, fieldItem, idx, containerElement)}
                ></div>
              </div>
            </div>
          )}
        </AVField>
      </div>
    )
  }

  showClass = async (name, onObjectDocumentSelected) => {
    const openedClassItem = await this.Host.getClassByName(name);
    this.setState({
      isClassItemOpened: true,
      openedClassItem,
      onObjectDocumentSelectedInOpenedClassItem: (objDocItem) => {
        this.setState({isClassItemOpened: false})
        onObjectDocumentSelected(objDocItem);
      }
    })
  }

  _startVerticalResize = (msDownEvent, fieldItem, idx, containerElement) => {
    msDownEvent.preventDefault();
    const startResizePageY = msDownEvent.pageY;
    const resizeElem = fieldItem.domElement;
    const resizeElemRect = resizeElem.getBoundingClientRect();

    window.document.onmouseup = upEv => {
      upEv.preventDefault();
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    }

    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      const pageYDiff = moveEv.pageY - startResizePageY;

      const newHeight = (resizeElemRect.height + pageYDiff) + 'px';
      console.log('newHeight:', newHeight);
      let forStyleHeightObj;
      if (containerElement.viewItemType === 'horizontal-layout') {
        forStyleHeightObj = {
          height: newHeight
        }
      } else {
        forStyleHeightObj = {
          flexBasis: newHeight,
          flexGrow: 0
        }
      }
      if (fieldItem.style) {
        fieldItem.style = {
          ...fieldItem.style,
          ...forStyleHeightObj
        }
      } else {
        fieldItem.style = forStyleHeightObj;
      }

      this.forceUpdate();
    }

  }

  _startHorizontalResize = (msDownEvent, fieldItem, idx, containerElement) => {
    msDownEvent.preventDefault();
    // запрет на изменение ширины крайнего правого элемента
    if ((!fieldItem.viewItemType || fieldItem.viewItemType === 'field') &&
      !containerElement.container
    ) {
      return;
    }
    if (containerElement.viewItemType === 'horizontal-layout' &&
      idx === containerElement.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement)) {
        return;
      }
    }
    if (
      containerElement.viewItemType === 'vertical-layout' &&
      containerElement.container.items.findIndex(i => i === containerElement) === containerElement.container.items.length - 1
    ) {
      if (this._isHorizontalContainerFarRightInDesign(containerElement.container)) {
        return;
      }
    }

    const startResizePageX = msDownEvent.pageX;
    const resizeElem = fieldItem.domElement;
    const resizeElemRect = resizeElem.getBoundingClientRect(); // долгая операция внутри моусмува не вариант использовать

    let firstVerticalNotRightest;
    let resizeVrtElemRect;
    if (
      (containerElement.viewItemType === 'horizontal-layout' && idx === containerElement.items.length - 1) ||
      containerElement.viewItemType === 'vertical-layout'
    ) {
      const firstVertical = containerElement.viewItemType === 'vertical-layout' ? containerElement : containerElement.container;
      firstVerticalNotRightest = this._findFirstVerticalNotRightestInHorizontal(firstVertical);
      if (firstVerticalNotRightest) { // TODO вот это предположительно не работает из того, что Дом теперь виртуальный
        resizeVrtElemRect = firstVerticalNotRightest.domElement.getBoundingClientRect();
      }
    }

    window.document.onmouseup = upEv => {
      upEv.preventDefault();
      window.document.onmousemove = null;
      window.document.onmouseup = null;
    }
    // TODO убрать себя если ближайший вертикальный который не крайний правый
    window.document.onmousemove = moveEv => {
      moveEv.preventDefault();
      const pageXDiff = moveEv.pageX - startResizePageX;

      if (containerElement.viewItemType === 'horizontal-layout' && idx !== containerElement.items.length - 1) {
        const newWidth = (resizeElemRect.width + pageXDiff) + 'px';
        console.log('newWidth:', newWidth);
        const forStyleWidthObj = {
          flexBasis: newWidth,
          flexGrow: 0
        }
        if (fieldItem.style) {
          fieldItem.style = {
            ...fieldItem.style,
            ...forStyleWidthObj
          }
        } else {
          fieldItem.style = forStyleWidthObj;
        }
      }
      if (
        (containerElement.viewItemType === 'horizontal-layout' && idx === containerElement.items.length - 1) ||
        containerElement.viewItemType === 'vertical-layout'
      ) {
        if (firstVerticalNotRightest) {
          const newVrtWidth = (resizeVrtElemRect.width + pageXDiff) + 'px';
          const forStyleVrtWidthObj = {
            flexBasis: newVrtWidth,
            flexGrow: 0
          }
          if (firstVerticalNotRightest.style) {
            firstVerticalNotRightest.style = {
              ...firstVerticalNotRightest.style,
              ...forStyleVrtWidthObj
            }
          } else {
            firstVerticalNotRightest.style = forStyleVrtWidthObj;
          }
        }
      }

      this.forceUpdate();
    }
  }

  _findFirstVerticalNotRightestInHorizontal = (firstVertical) => {
    if (!firstVertical.container) {
      return false;
    }
    if (firstVertical.container.items.findIndex(i => i === firstVertical) === firstVertical.container.items.length - 1) {
      return this._findFirstVerticalNotRightestInHorizontal(firstVertical.container.container);
    } else {
      return firstVertical;
    }
  }

  _isHorizontalContainerFarRightInDesign(containerElement) {
    if (!containerElement.container.container) {
      return true;
    }
    if (
      containerElement.container.container.items.findIndex(i => i === containerElement.container) ===
      containerElement.container.container.items.length - 1
    ) {
      return this._isHorizontalContainerFarRightInDesign(containerElement.container.container)
    }
    return false;
  }

  _onDesignFieldContextMenu = async (e, fieldItem, idx, containerElement) => {
    e.preventDefault();
    let menuResult;
    if (fieldItem.viewItemType === 'label') {
      menuResult = await this.showContextMenu(e, ['Изменить label']);
      if (menuResult === 'Изменить label') {
        const newLabel = await this.showDialog({text: 'Введите новый label', inputLabel: 'label'});
        if (newLabel) {
          fieldItem.label = newLabel;
          this.forceUpdate();
        }
      }
    } else {
      menuResult = await this.showContextMenu(e, ['Действие']);
    }
  }

  _onTabContextMenu = async (e, tab, tabsFieldItem) => {
    e.preventDefault();
    if (!this.state.designMode) {
      return;
    }
    let menuResult;
    menuResult = await this.showContextMenu(e, ['Добавить вкладку', 'Изменить label вкладки']);
    if (menuResult === 'Добавить вкладку') {
      const newTabLabel = await this.showDialog({text: 'Введите label вкладки', inputLabel: 'label'});
      if (newTabLabel) {
        tabsFieldItem.items.push(
            {
              viewItemType: 'tab',
              label: newTabLabel,
              items: [{
                viewItemType: 'vertical-layout',
                items: [{
                  viewItemType: 'space div'
                }]
              }]
            }
        );
        this.forceUpdate();
      }
    }

  }

  dragstart = (e, {
    designDragElement,
    designDragElementIndex,
    designDragContainer,
    designDragElementOrigin = 'objectDocument'
  }) => {
    this.setState({
      designDragElement,
      designDragElementIndex,
      designDragContainer,
      designDragElementOrigin,
    })
  }

  _findFieldOverlay = (e) => {
    return e.target.closest('.field-overlay');
  }

  _dragover = (e) => {
    // console.log('dragover e:', e);
    e.preventDefault();
    const fieldOverlay = this._findFieldOverlay(e);
    const elemRect = fieldOverlay.getBoundingClientRect();

    if (elemRect.left + elemRect.width/10 > e.pageX) {
      fieldOverlay.classList.remove('border-top-4');
      fieldOverlay.classList.remove('border-bottom-4');
      fieldOverlay.classList.add('border-left-4');
      this.setState({designDropSide: 'left'});
    } else {
      fieldOverlay.classList.remove('border-left-4');

      if (elemRect.right - elemRect.width/10 <= e.pageX) {
        fieldOverlay.classList.remove('border-top-4');
        fieldOverlay.classList.remove('border-bottom-4');
        fieldOverlay.classList.add('border-right-4');
        this.setState({designDropSide: 'right'});
      } else {
        fieldOverlay.classList.remove('border-right-4');

        if (elemRect.top + elemRect.height/2 > e.pageY) {
          fieldOverlay.classList.add('border-top-4');
          this.setState({designDropSide: 'top'});
        } else {
          fieldOverlay.classList.remove('border-top-4');
        }

        if (elemRect.top + elemRect.height/2 <= e.pageY) {
          fieldOverlay.classList.add('border-bottom-4');
          this.setState({designDropSide: 'bottom'});
        } else {
          fieldOverlay.classList.remove('border-bottom-4');
        }
      }
    }
  }

  _removeDragBorder = (e) => {
    const fieldOverlay = this._findFieldOverlay(e);
    fieldOverlay.classList.remove('border-top-4');
    fieldOverlay.classList.remove('border-bottom-4');
    fieldOverlay.classList.remove('border-left-4');
    fieldOverlay.classList.remove('border-right-4');
  }

  _dragleave = (e) => {
    this._removeDragBorder(e);
  }

  _drop = (e, dropFieldItem, dropElementIndex, dropContainer) => {
    if (this.state.designDragElement === dropFieldItem) {
      this._removeDragBorder(e);
      return;
    }

    if (this.state.designDragElement.style) {
      // delete this.state.designDragElement.style.flexBasis;
      // delete this.state.designDragElement.style.flexGrow;
      this.state.designDragElement.style = {};
    }

    // const newDesign = [...this.designJson];
    let insertIndex = dropElementIndex;
    let cutIndex = this.state.designDragElementIndex;

    if (this.state.designDropSide === 'left' || this.state.designDropSide === 'right') {
      if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.state.designDropSide === 'left') {
          dropContainer.items[dropElementIndex] = {
            container: dropContainer,
            viewItemType: 'horizontal-layout',
            items: [this.state.designDragElement, dropFieldItem]
          }
        }
        if (this.state.designDropSide === 'right') {
          dropContainer.items[dropElementIndex] = {
            container: dropContainer,
            viewItemType: 'horizontal-layout',
            items: [dropFieldItem, this.state.designDragElement]
          }
        }
      } else if (dropContainer.viewItemType === 'horizontal-layout') {
        if (this.state.designDropSide === 'left') {
          if (dropContainer === this.state.designDragContainer) {
            cutIndex = cutIndex + 1;
          }
        }
        if (this.state.designDropSide === 'right') {
          insertIndex = insertIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.state.designDragElement);
      }
    }

    if (this.state.designDropSide === 'top' || this.state.designDropSide === 'bottom') {
      if (dropContainer.viewItemType === 'horizontal-layout') {
        let vrtElement;
        if (this.state.designDropSide === 'top') {
          vrtElement = {
            container: dropContainer,
            viewItemType: 'vertical-layout',
            items: [this.state.designDragElement, dropFieldItem]
          }
        }
        if (this.state.designDropSide === 'bottom') {
          vrtElement = {
            container: dropContainer,
            viewItemType: 'vertical-layout',
            items: [dropFieldItem, this.state.designDragElement]
          }
        }

        if (dropFieldItem.style) {
          vrtElement.style = {
            flexBasis: dropFieldItem.style.flexBasis,
            flexGrow: dropFieldItem.style.flexGrow,
          }
          // delete dropContainer.items[dropElementIndex].style.flexBasis;
          // delete dropContainer.items[dropElementIndex].style.flexGrow;
          dropFieldItem.style = {};
        }

        dropContainer.items.splice(insertIndex, 1)
        dropContainer.items.splice(insertIndex, 0, vrtElement);

      } else if (dropContainer.viewItemType === 'vertical-layout') {
        if (this.state.designDropSide === 'bottom') {
          insertIndex = insertIndex + 1;
        }
        if (dropContainer === this.state.designDragContainer && this.state.designDragElementIndex > dropElementIndex) {
          cutIndex = cutIndex + 1;
        }
        dropContainer.items.splice(insertIndex, 0, this.state.designDragElement);
      }
    }

    if (this.state.designDragElementOrigin !== 'instrument panel') {
      this.state.designDragContainer.items.splice(cutIndex, 1);
      this._removeEmptyContainers(this.state.designDragContainer);
    }

    this.forceUpdate();
    // this.designJson = newDesign;
    this._removeDragBorder(e);
  }

  _saveAndClose = async () => {
    await this.props.objectDocument.saveData(this.state._newData);
    this.props.onSavedFunc();
    this.props.onCloseFunc();
    this.Host.$hostElement.setState(state => ({
      designMode: false,
      $designObjectDocument: null
    }));
  }

  _closeWithoutSave = () => {
    this.props.onCloseFunc();
    this.Host.$hostElement.setState(state => ({
      designMode: false,
      $designObjectDocument: null
    }));
  }

  _toggleDesign = async () => {
    this.setState(
      state => ({designMode: !state.designMode}),
      async () => {
        if (this.state.designMode === false) {
          const saveDesignFlag = await this.showDialog({text: 'Сохранить дизайн?'});
          if (saveDesignFlag) {
            return this._saveDesign();
          }
        }
      }
    );
    console.log('this.Host', this.Host);
    this.Host.$hostElement.setState(state => ({
      designMode: !state.designMode,
      $designObjectDocument: this
    }));
  }

  _saveDesign = async () => {
    this._removeContainerReference(this.state.designJson);
    this._removeDomElementReference(this.state.designJson);
    await this.props.objectDocument.saveDesignJson(this.deepClone(this.state.designJson));
    this._addContainerReference(this.state.designJson);
  }

  _removeDomElementReference = (layoutElememt) => {
    delete layoutElememt.domElement;
    if (layoutElememt.items) {
      layoutElememt.items.forEach(i => {
        this._removeDomElementReference(i);
      })
    }
  }

  _addContainerReference = (layoutElememt) => {
    layoutElememt.items.forEach((i) => {
      if (i.viewItemType === 'horizontal-layout' || i.viewItemType === 'vertical-layout') {
        i.container = layoutElememt;
        this._addContainerReference(i)
      }
    })
  }
  _removeContainerReference = (layoutElement) => {
    layoutElement.items.forEach(i => {
      if (i.viewItemType === 'horizontal-layout' || i.viewItemType === 'vertical-layout') {
        if (i.container) {
          delete i.container;
        }
        this._removeContainerReference(i)
      }
    })
  }
  _removeEmptyContainers = (cont) => {
    if (cont.items.length === 0 && cont.container) {
      const DragContIndex = cont.container.items.findIndex(i => i === cont);
      cont.container.items.splice(DragContIndex, 1)
      this._removeEmptyContainers(cont.container)
    }
  }

  _findNewFieldDescriptors = (fields, fieldsInDesign) => {
    return fields.filter(f => fieldsInDesign.every(fInDesign => fInDesign.name !== f.name))
  }

  _findDeletedFieldDescriptors = (fields, fieldsInDesign) => {
    return fieldsInDesign.filter(fInDesign => fields.every(f => f.name !== fInDesign.name))
  }

  _removeDeletedItems = (designJson, deletedItems) => {
    deletedItems.forEach(delItem => {
      this._removeDeletedItemInContainer(delItem, designJson);
    })
  }
  _removeDeletedItemInContainer = (delItem, containerEl) => {
    const forDelItemIndex = containerEl.items.findIndex(i => i.name === delItem.name);
    if (forDelItemIndex > -1) {
      containerEl.items.splice(forDelItemIndex, 1);
      this._removeEmptyContainers(containerEl);
    } else {
      const containerElements = containerEl.items.filter(i => i.viewItemType && i.viewItemType !== 'field');
      containerElements.forEach(contEl => {
        this._removeDeletedItemInContainer(delItem, contEl)
      })
    }
  }
}
