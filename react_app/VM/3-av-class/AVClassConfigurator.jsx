import React from 'react';

import {AVItem} from '../0-AVItem.js';

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
    _newFieldDescriptorsBeforeUpdate: [],

    viewsOptions: [],
    _newViewsOptions: [],
    _newViewsOptionsBeforeUpdate: [],
    selectedViewsOption: null,

    availableServices: [],
    connectedServices: [],
    _newConnectedServices: [],
    selectedItemService: null,
    _newConnectedServicesBeforeUpdate: [],

    _metadataChangeDetected: false
  }
  fieldDescriptorProperties = [
    {
      name: 'label',
      expanded: true,
      items: [
        { name: 'labelPartWhichHaveLinkUrl' },
        { name: 'linkUrlForLabelPart' }
      ]
    },
    {name: 'dataType',
      dataType: 'string',
      variant: 'select',
      valuesList: 'string||number||boolean||array||object||image',
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
            return ['textarea',
              'select',
              'binary-buttons',
              'radio-buttons',
              'date',
              'Gazprombank-string',
              'Gazprombank-string-number',
              'Gazprombank-string-select',
              'Gazprombank-tel',
              'Gazprombank-email',
              'Gazprombank-passport-seria-number',
              'Gazprombank-date',
              'Gazprombank-date-month-year',
              'Gazprombank-passport-kod-podrazdelenia',
            ];
          }
          if (this.state.selectedFieldDescriptor.dataType === 'number') {
            return ['input+range'];
          }
          if (this.state.selectedFieldDescriptor.dataType === 'boolean') {
            return ['Gazprombank-checkbox-switch'];
          }
          return [];
        }},
        {name: 'variantItemReference', hideIfFunc: () => {
          if (this.state.selectedFieldDescriptor.dataType !== 'object' || this.state.selectedFieldDescriptor.variant === 'structured-object-field') {
            return true
          }
          return false
        }},
        {name: 'valuesList', hideIfFunc: () => {
          if (
            this.state.selectedFieldDescriptor.variant !== 'select'
            && this.state.selectedFieldDescriptor.variant !== 'binary-buttons'
            && this.state.selectedFieldDescriptor.variant !== 'radio-buttons'
            && this.state.selectedFieldDescriptor.variant !== 'Gazprombank-string-select'
          ) {
            return true
          }
          return false
        }},
        { name: 'defaultValue' },
        {name: 'infoMessage', hideIfFunc: () => {
          // if (this.state.selectedFieldDescriptor.dataType !== 'string') {
          //   return true
          // }
          return false
        }
        },
        {
          name: 'size', hideIfFunc: () => {
            if (
              this.state.selectedFieldDescriptor.variant !== 'Gazprombank-string' &&
              this.state.selectedFieldDescriptor.variant !== 'Gazprombank-string-number'
            ) {
              return true
            }
            return false
          }
        },

        {
          name: 'labelPosition', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.dataType !== 'boolean') {
              return true
            }
            return false
          },
          dataType: 'string',
          variant: 'select',
          valuesList: 'right',
        },

        {name: 'minValue', dataType: 'number', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.variant !== 'input+range') {
              return true
            }
            return false
          }
        },
        {name: 'maxValue', dataType: 'number', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.variant !== 'input+range') {
              return true
            }
            return false
          }
        },
        {
          name: 'suffixInValue', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.variant !== 'input+range') {
              return true
            }
            return false
          }
        },
        {name: 'minLabel', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.variant !== 'input+range') {
              return true
            }
            return false
          }
        },
        {name: 'maxLabel', hideIfFunc: () => {
            if (this.state.selectedFieldDescriptor.variant !== 'input+range') {
              return true
            }
            return false
          }
        },

      ]
    },
    {name: 'isReadOnly', dataType: 'boolean'},
    {name: 'isHiddenInObjectDocument', dataType: 'boolean'},
    {name: 'isHiddenInGrid', dataType: 'boolean'},
    {name: 'isComputed', dataType: 'boolean'},
    {name: 'computeFunction', dataType: 'string', variant: 'textarea'}
  ];

  serviceConnectorProperties = [
    {name: 'isServiceConnected', dataType: 'boolean'}
  ]

  //render
  
  async componentDidMount() {
    if (this.props.classItem) {
      // Fields
      const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
      const _newFieldDescriptors = this.deepClone(fieldDescriptors);
      // Views
      const viewsOptions = await this.props.classItem.getViewsOptions();
      const _newViewsOptions = this.deepClone(viewsOptions);
      //Services
      const connectedServices = await this.props.classItem.getConnectedServices();

      let targetDomainOrganizationItemInConfig;
      const targetDomainOrFolderItemInConfig = this.findDeepContainerInItemsBy({ id: this.props.classItem.id }, { items: this.Host.config });
      if (targetDomainOrFolderItemInConfig.itemType !== 'domain') {
        targetDomainOrganizationItemInConfig = this.findDeepObjInItemsBy({ id: targetDomainOrFolderItemInConfig.domainId }, { items: this.Host.config });
      } else {
        targetDomainOrganizationItemInConfig = targetDomainOrFolderItemInConfig;
      }

      const servicesDomain = this.findDeepObjInItemsBy({ name: 'Сервисы', itemType: 'domain' }, { items: targetDomainOrganizationItemInConfig.items });
      let availableServices;
      if (servicesDomain) {
        availableServices = this.deepClone(servicesDomain.items);
        availableServices = availableServices.map(srv => ({ ...srv, items: null })); //TODO ?
      } else {
        availableServices = []
      }
      const _newConnectedServices = this.deepClone(connectedServices.concat(
        availableServices.filter(avS => connectedServices.every(conS => conS.id !== avS.id))
      ))

      this.setState({
        fieldDescriptors,
        _newFieldDescriptors,
        _newFieldDescriptorsBeforeUpdate: this.deepClone(_newFieldDescriptors),

        viewsOptions,
        _newViewsOptions,
        __newViewsOptionsBeforeUpdate: this.deepClone(_newViewsOptions),

        availableServices,
        connectedServices: connectedServices,
        _newConnectedServices: _newConnectedServices,
        _newConnectedServicesBeforeUpdate: this.deepClone(_newConnectedServices),
      });
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.isEmpty(prevState._newFieldDescriptors) && this.isEmpty(prevState._newConnectedServices)) {
  //     return;
  //   }
  // }

  render() {
    return (
      <div className="_av-class-configurator-root flex-1 col space-between">
        <div className="flex-1 col">
          <AVLabel>id:{this.props.classItem.id}</AVLabel>
          <AVLabel>name:{this.props.classItem.metadata.name}</AVLabel>
          <div>
            <AVButton onClick={this._addField}>Добавить поле</AVButton>
          </div>
          {this._renderFields()}
          <div>Views:</div>
          {this._renderViewsOptions()}
          <div>Сервисы:</div>
          {this._renderServices()}
        </div>
        <div className="row justify-end">
          <AVButton
            onClick={this._saveMetadata}
            disabled={!this.state._metadataChangeDetected}
          >Сохранить</AVButton>
        </div>
      </div>
    )
  }

  _renderFields() {
    return (
      <div className="flex-1 row margin-top-2">
        <div className="flex-0-200px row border">
          <AVTree
            items={this.state._newFieldDescriptors}
            onItemSelectFunc={selectedFieldDescriptor => this.setState({selectedFieldDescriptor})}
            onItemContextMenuFunc={this._onTreeItemContextMenu}
            isRowsWithBorders
          ></AVTree>
        </div>
        <div className="flex-1 row margin-left-8 border">
          <AVPropertyGrid
            inspectedItem={this.state.selectedFieldDescriptor}
            propertyItems={this.fieldDescriptorProperties}
            onChangeFunc={this._calcMetadataChanges}
          ></AVPropertyGrid>
        </div>
      </div>
    )
  }

  _renderViewsOptions() {
    return (
        <div className="flex-0 row">
          <div className="flex-0-200px row pad-4-0 bg-tree border">
            <AVTree
              items={this.state._newViewsOptions}
              onItemSelectFunc={selectedViewsOption => this.setState({selectedViewsOption})}
            ></AVTree>
          </div>
          <div className="flex-1 row margin-left-8 border">
            <AVPropertyGrid
              inspectedItem={this.state.selectedViewsOption}
              propertyItems={[
                {
                  name: 'value',
                  dataType: 'string',
                  variant: 'select',
                  valuesList: this.props.classItem.getViewsList(),
                  defaultValue: this.props.classItem.defaultViewName,
                  isEmptyOptionHidden: true,
                }
              ]}
              onChangeFunc={this._calcMetadataChanges}
            ></AVPropertyGrid>
          </div>
        </div>
    )
  }

  _renderServices() {
    return (
      <div className="flex-0 row">
        <div className="flex-0-200px row pad-4-0 bg-tree border">
          <AVTree
            items={this.state._newConnectedServices}
            onItemSelectFunc={selectedItemService => this.setState({selectedItemService})}
          ></AVTree>
        </div>
        <div className="flex-1 row margin-left-8 border">
          <AVPropertyGrid
            inspectedItem={this.state.selectedItemService}
            propertyItems={this.serviceConnectorProperties}
            onChangeFunc={this._calcMetadataChanges}
          ></AVPropertyGrid>
        </div>
      </div>
    )
  }

  _onTreeItemContextMenu = async (e, item) => {
    const menuChoice = await this.showContextMenu(e, ['Переименовать', 'Добавить вложенное поле', 'Удалить поле']);
    if (menuChoice === 'Добавить вложенное поле') {
      const fieldName = await this.showDialog({text: 'Введите название поля', inputLabel: 'name'});
      if (fieldName) {
        if (this.notEmpty(item.items) && item.items.every(f => f.name !== fieldName)) {
          item.items.push({name: fieldName, label: fieldName, dataType: 'string'})
        }
        if (this.isEmpty(item.items)) {
          item.items = [{name: fieldName, label: fieldName, dataType: 'string'}];
        }
        this.setState(
          {_newFieldDescriptors: [...this.state._newFieldDescriptors]},
          this._calcMetadataChanges
        );
      }
    }
    if (menuChoice === 'Переименовать') {
      const fieldName = await this.showDialog({ text: 'Введите название поля', inputLabel: 'name', dialogInputValue: item.name});
      if (fieldName) {
        item.name = fieldName;
        this.setState(
            {_newFieldDescriptors: [...this.state._newFieldDescriptors]},
            this._calcMetadataChanges
        );
      }
    }
    if (menuChoice === 'Удалить поле') {
      const ok = await this.showDialog({text: `Удалить поле ${item.name} ?`});
      if (ok) {
        const containerObj = this.findDeepContainerInItemsBy({name: item.name}, {items: this.state._newFieldDescriptors});
        const indexToDelete = containerObj.items.findIndex(i => i.name === item.name);
        if (indexToDelete > -1) {
          containerObj.items.splice(indexToDelete, 1);
        }
        this.setState(
          {_newFieldDescriptors: [...this.state._newFieldDescriptors]},
          this._calcMetadataChanges
        );
      }
    }
  }

  _addField = async () => {
    const fieldName = await this.showDialog({text: 'Введите название поля', inputLabel: 'name'});
    if (fieldName && this.state._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'string'};
      this.setState(
        {_newFieldDescriptors: [...this.state._newFieldDescriptors, field]},
        this._calcMetadataChanges
      );
    }
  }

  _calcMetadataChanges = () => {
    const currentStateNewFields = JSON.stringify(this.state._newFieldDescriptors);
    const beforeUpdateNewFields = JSON.stringify(this.state._newFieldDescriptorsBeforeUpdate);

    const currentStateNewViewsOptions = JSON.stringify(this.state._newViewsOptions);
    const beforeUpdateNewViewsOptions = JSON.stringify(this.state._newViewsOptionsBeforeUpdate);

    const currentStateNewServices = JSON.stringify(this.state._newConnectedServices);
    const beforeUpdateNewServices = JSON.stringify(this.state._newConnectedServicesBeforeUpdate);

    if (
        currentStateNewFields !== beforeUpdateNewFields ||
        currentStateNewServices !== beforeUpdateNewServices ||
        currentStateNewViewsOptions !== beforeUpdateNewViewsOptions
    ) {
      this.setState({_metadataChangeDetected: true});
    } else {
      this.setState({_metadataChangeDetected: false});
    }
  }

  _saveMetadata = async () => {
    await this.props.classItem.saveMetadata({
      fieldDescriptors: this.state._newFieldDescriptors,
      viewsOptions: this.state._newViewsOptions,
      connectedServices: this.state._newConnectedServices.filter(srv => srv.isServiceConnected)
    })
    this.setState({
      _newFieldDescriptorsBeforeUpdate: this.deepClone(this.state._newFieldDescriptors),
      _newViewsOptionsBeforeUpdate: this.deepClone(this.state._newViewsOptions),
      _newConnectedServicesBeforeUpdate: this.deepClone(this.state._newConnectedServices),
      _metadataChangeDetected: false
    });
    this.props.onSavedFunc();
  }
}
