import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClass} from './3-AVClass.jsx';
import {AVField} from './5-AVField.jsx';

import {AVButton} from "../V/AVButton.jsx";


export class AVObjectDocument extends AVItem {
  styles = {
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
              <AVButton onClick={this.props.onCloseFunc}>Отмена</AVButton>
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
          if (vrtItem.viewItemType === 'field' || !vrtItem.viewItemType) {
            return this._renderField(vrtItem, vrtIndex, vrtLayoutItem)
          }
        })}
      </div>
    )
  }

  _renderField(fieldItem, idx, containerElement) {
    return (
      <div
        className="flex-1 pos-rel margin-top-2"
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
              <div className="flex-1"
                   draggable="true"
                   onDragStart={(e) => this._dragstart(e, fieldItem, idx, containerElement)}
                   onDragOver={this._dragover}
                   onDragLeave={this._dragleave}
                   onDrop={(e) => this._drop(e, fieldItem, idx, containerElement)}
                   onContextMenu={(e) => this._onDesignFieldContextMenu(e, fieldItem, idx, containerElement)}
              ></div>
              <this.styles.horizontalResizer
                   onMouseDown={(e) => this._startHorizontalResize(e, fieldItem, idx, containerElement)}
              ></this.styles.horizontalResizer>
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
    const menuResult = await this.showContextMenu(e, ['Сгруппировать']);
  }

  _dragstart = (e, fieldItem, idx, container) => {
    this.setState({
      designDragElementIndex: idx,
      designDragElement: container.items[idx],
      designDragContainer: container
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

  _drop = (e, fieldItem, dropElementIndex, dropContainer) => {
    if (this.state.designDragElement === dropContainer.items[dropElementIndex]) {
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
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [this.state.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.state.designDropSide === 'right') {
          dropContainer.items[dropElementIndex] = {container: dropContainer, viewItemType: 'horizontal-layout', items: [dropContainer.items[dropElementIndex], this.state.designDragElement]}
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
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [this.state.designDragElement, dropContainer.items[dropElementIndex]]}
        }
        if (this.state.designDropSide === 'bottom') {
          vrtElement = {container: dropContainer, viewItemType: 'vertical-layout', items: [dropContainer.items[dropElementIndex], this.state.designDragElement ]}
        }

        if (dropContainer.items[dropElementIndex].style) {
          vrtElement.style = {
            flexBasis: dropContainer.items[dropElementIndex].style.flexBasis,
            flexGrow: dropContainer.items[dropElementIndex].style.flexGrow,
          }
          // delete dropContainer.items[dropElementIndex].style.flexBasis;
          // delete dropContainer.items[dropElementIndex].style.flexGrow;
          dropContainer.items[dropElementIndex].style = {};
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

    this.state.designDragContainer.items.splice(cutIndex, 1);
    this._removeEmptyContainers(this.state.designDragContainer);

    this.forceUpdate();
    // this.designJson = newDesign;
    this._removeDragBorder(e);
  }

  _saveAndClose = async () => {
    await this.props.objectDocument.saveData(this.state._newData);
    this.props.onSavedFunc();
    this.props.onCloseFunc();
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
      if (i.viewItemType && i.viewItemType !== 'field') {
        i.container = layoutElememt;
        this._addContainerReference(i)
      }
    })
  }
  _removeContainerReference = (layoutElement) => {
    layoutElement.items.forEach(i => {
      if (i.viewItemType && i.viewItemType !== 'field') {
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
