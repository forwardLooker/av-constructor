import React from 'react';

import {AVItem} from '../0-AVItem.js';

import {AVTextHeader} from "../../V/AVTextHeader.jsx";
import {AVButton} from "../../V/AVButton.jsx";
import {AVTree} from "../../V/AVTree.jsx";
import {AVPropertyGrid} from "../../V/AVPropertyGrid.jsx";

export class AVClassConfigurator extends AVItem {
  static defaultProps = {
    classItem: null,
    onSavedFunc: this.noop,
  }
  state = {
    fieldDescriptors: [],
    _newFieldDescriptors: [],
    selectedFieldDescriptor: null,
  }
  fieldDescriptorProperties = [
    {name: 'label'},
    {name: 'dataType', dataType: 'string', variant: 'select', valuesList: 'string,number,boolean,array,object, link, include-link'},
    {name: 'variant'},
    {name: 'valuesList'},
    {name: 'defaultValue'},
    {name: 'isHidden', dataType: 'boolean'},
    {name: 'isComputed', dataType: 'boolean'},
    {name: 'computeFunction'}
  ];

  render() {
    return (
      <div className="flex-1 col space-between">
        <div className="flex-1 col">
          <AVTextHeader className="margin-top-8">Fields:</AVTextHeader>
          <div>
            <AVButton onClick={this._addField}>Добавить поле</AVButton>
          </div>
          <div className="flex-1 row margin-top-8">
            <div className="flex-0-200px row border">
              <AVTree
                items={this.state._newFieldDescriptors}
                onItemSelectFunc={item => this.setState({selectedFieldDescriptor: item})}
                onItemContextMenuFunc={this._onTreeItemContextMenu}
              ></AVTree>
            </div>
            <div className="flex-1 row margin-left-8 border">
              <AVPropertyGrid
                inspectedItem={this.state.selectedFieldDescriptor}
                propertyItems={this.fieldDescriptorProperties}
              ></AVPropertyGrid>
            </div>
          </div>
        </div>
        <div className="row justify-end">
          <AVButton onClick={this._saveFieldDescriptors}>Сохранить</AVButton>
        </div>
      </div>
    )
  }

  async componentDidMount() {
    if (this.props.classItem) {
      const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
      this.setState({fieldDescriptors, _newFieldDescriptors: this.deepClone(fieldDescriptors)});
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.state.fieldDescriptors !== prevState.fieldDescriptors) {
  //     this.setState({_newFieldDescriptors: this.deepClone(this.state.fieldDescriptors)});
  //   }
  // }

  _onTreeItemContextMenu = async (e, item) => {
    const menuChoice = await this.showContextMenu(e, ['Добавить вложенное поле', 'Удалить поле']);
    if (menuChoice === 'Добавить вложенное поле') {
      const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
      if (fieldName) {
        if (this.notEmpty(item.items) && item.items.every(f => f.name !== fieldName)) {
          item.items.push({name: fieldName, label: fieldName, dataType: 'string'})
        }
        if (this.isEmpty(item.items)) {
          item.items = [{name: fieldName, label: fieldName, dataType: 'string'}];
        }
        this.setState({_newFieldDescriptors: [...this.state._newFieldDescriptors]});
      }
    }
  }

  _addField = async () => {
    const fieldName = await this.showDialog({text: 'Введите название поля', inputLabel: 'name'});
    if (fieldName && this.state._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'string'};
      this.setState({_newFieldDescriptors: [...this.state._newFieldDescriptors, field]});
    }
  }

  _saveFieldDescriptors = async () => {
    await this.props.classItem.saveFieldDescriptors(this.state._newFieldDescriptors);
    this.props.onSavedFunc();
  }
}
