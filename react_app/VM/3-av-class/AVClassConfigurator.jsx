import React from 'react';

import {AVItem} from '../0-AVItem.js';

import {AVTextHeader} from "../../V/AVTextHeader.jsx";
import {AVLabel} from "../../V/AVLabel.jsx";
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

    availableServices: [],
    connectedServices: [],
    _newConnectedServices: [],
    selectedItemService: null
  }
  fieldDescriptorProperties = [
    {name: 'label'},
    {name: 'dataType',
      dataType: 'string',
      variant: 'select',
      valuesList: 'string,number,boolean,array,object',
      expanded: true,
      items: [
        {name: 'variant', variant: 'select', valuesList: () => {
          if (this.state.selectedFieldDescriptor.dataType === 'object') {
            return [
              'structured-object-field',
              'link-on-object-in-class',
              'link-on-object-in-class-included',
              'link-on-class-in-domain'
            ];
          }
          if (this.state.selectedFieldDescriptor.dataType === 'string') {
            return ['select'];
          }
          return [];
        }},
        {name: 'variantItemReference', hideIfFunc: () => {
          if (this.state.selectedFieldDescriptor.dataType !== 'object' || this.state.selectedFieldDescriptor.variant === 'structured-object-field') {
            return true
          }
          return false
        }},
        {name: 'valuesList'},
        {name: 'defaultValue'},
      ]
    },
    {name: 'isHidden', dataType: 'boolean'},
    {name: 'isComputed', dataType: 'boolean'},
    {name: 'computeFunction'}
  ];

  serviceConnectorProperties = [
    {name: 'isServiceConnected', dataType: 'boolean'}
  ]

  render() {
    return (
      <div className="flex-1 col space-between">
        <div className="flex-1 col">
          <AVLabel>id:{this.props.classItem.id}</AVLabel>
          <AVLabel>name:{this.props.classItem.data.name}</AVLabel>
          <div>
            <AVButton onClick={this._addField}>Добавить поле</AVButton>
          </div>
          {this._renderFields()}
          <div>Сервисы:</div>
          {this._renderServices()}
        </div>
        <div className="row justify-end">
          <AVButton onClick={this._saveMetadata}>Сохранить</AVButton>
        </div>
      </div>
    )
  }

  _renderFields() {
    return (
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
    )
  }

  _renderServices() {
    return (
      <div className="flex-1 row margin-top-8">
        <div className="flex-0-200px row border">
          <AVTree
            items={this.state.availableServices}
            onItemSelectFunc={itemService => {
              let newConSrv = this.state._newConnectedServices.find(srv => srv.id === itemService.id);
              let _newConnectedServices = this.state._newConnectedServices;
              if (!newConSrv) {
                newConSrv = this.deepClone(itemService);
                _newConnectedServices = [...this.state._newConnectedServices, newConSrv]
              }
              this.setState({selectedItemService: newConSrv, _newConnectedServices})
            }}
          ></AVTree>
        </div>
        <div className="flex-1 row margin-left-8 border">
          <AVPropertyGrid
            inspectedItem={this.state.selectedItemService}
            propertyItems={this.serviceConnectorProperties}
          ></AVPropertyGrid>
        </div>
      </div>
    )
  }

  async componentDidMount() {
    if (this.props.classItem) {
      const fieldDescriptors = await this.props.classItem.getFieldDescriptors();

      const connectedServices = await this.props.classItem.getConnectedServices();
      const servicesDomain = this.findDeepObjInItemsBy({name: 'Сервисы', itemType: 'domain'}, {items: this.Host.config});
      let availableServices = this.deepClone(servicesDomain.items);
      availableServices = availableServices.map(srv => ({...srv, items: null})); //TODO ?
      const _newConnectedServices = this.deepClone(connectedServices)

      this.setState({
        fieldDescriptors,
        _newFieldDescriptors: this.deepClone(fieldDescriptors),

        availableServices,
        connectedServices: connectedServices,
        _newConnectedServices: _newConnectedServices
      });
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
      const fieldName = await this.showDialog({text: 'Введите название поля', inputLabel: 'name'});
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

  _saveMetadata = async () => {
    await this.props.classItem.saveMetadata({
      fieldDescriptors: this.state._newFieldDescriptors,
      connectedServices: this.state._newConnectedServices.filter(srv => srv.isServiceConnected)
    })
    this.props.onSavedFunc();
  }
}
