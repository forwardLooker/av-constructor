import {html, css, AVItem} from '../0-AVItem.js';

import '../../V/AVTree.jsx';

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
      <div className="col space-between flex-1">
        <div className="col flex-1">
          <AVTextHeader class="margin-top-8">Fields:</AVTextHeader>
          <div>
            <AVButton onClick={this._addField}>Добавить поле</AVButton>
          </div>
          <div className="row flex-1 margin-top-8">
            <AVTree
              class="fields-tree border"
              items={this.state._newFieldDescriptors}
              onItemSelectFunc={item => this.setState({selectedFieldDescriptor: item})}
              onItemContextMenuFunc={this._onTreeItemContextMenu}
            ></AVTree>
            <AVPropertyGrid
              class="flex-1 margin-left-8 border"
              inspectedItem={this.state.selectedFieldDescriptor}
              propertyItems={this.fieldDescriptorProperties}
            ></AVPropertyGrid>
          </div>
        </div>
        <div className="row justify-end">
          <AVButton OnClick={this._saveFieldDescriptors}>Сохранить</AVButton>
        </div>
      </div>
    )
  }

  async componentDidMount() {
    if (this.props.classItem) {
      const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
      this.setState({fieldDescriptors});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.fieldDescriptors !== prevState.fieldDescriptors) {
      this.setState({_newFieldDescriptors: this.deepClone(this.state.fieldDescriptors)});
    }
  }

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
        this._newFieldDescriptors = [...this._newFieldDescriptors];
      }
    }
  }

  _addField = async () => {
    const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
    if (fieldName && this._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'string'};
      this._newFieldDescriptors = [...this._newFieldDescriptors, field];
    }
  }

  _saveFieldDescriptors = async () => {
    await this.classItem.saveFieldDescriptors(this._newFieldDescriptors);
    this.onSaveFunc();
  }
}

export class AvClassConfigurator2 extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .fields-tree {
        flex-basis: 200px;
        flex-grow: 0;
      }
    `;
  }

  prGridItems = [
    {name: 'label'},
    {name: 'dataType', dataType: 'string', variant: 'select', valuesList: 'string,number,boolean,array,object, link, include-link'},
    {name: 'variant'},
    {name: 'valuesList'},
    {name: 'defaultValue'},
    {name: 'isHidden', dataType: 'boolean'},
    {name: 'isComputed', dataType: 'boolean'},
    {name: 'computeFunction'}
  ];

  static properties = {
    classItem: {},
    fieldDescriptors: {},
    _newFieldDescriptors: {},
    selectedField: {},
    onSaveFunc: {},
  };

  constructor() {
    super();
    this.fieldDescriptors = [];
    this._newFieldDescriptors = [];
  }

  willUpdate(changedProps) {
    if (changedProps.has('fieldDescriptors') && this.fieldDescriptors) {
      this._newFieldDescriptors = this.deepClone(this.fieldDescriptors);
    }
  }

  render() {
    return html`
        <div class="col space-between flex-1">
          <div class="col flex-1">
            <AVTextHeader class="margin-top-8">Fields:</AVTextHeader>
            <div>
              <AVButton onClick={this._addField}>Добавить поле</AVButton>
            </div>
            <div class="row flex-1 margin-top-8">
              <AVTree
                class="fields-tree border"
                items={this._newFieldDescriptors}
                onItemSelectFunc={item => this.selectedField = item}
                onItemContextMenuFunc={this._onTreeItemContextMenu}
              ></AVTree>
              <AVPropertyGid
                class="flex-1 margin-left-8 border"
                inspectedItem={this.selectedField}
                propertyItems={this.prGridItems}
              ></AVPropertyGid>
            </div>
          </div>
          <div class="row justify-end">
            <AVButton OnClick={this._saveFieldDescriptors}>Сохранить</AVButton>
          </div>
        </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {
    if (changedProps.has('classItem')) {
      this.fieldDescriptors = await this.classItem.getFieldDescriptors();
    }
  }

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
        this._newFieldDescriptors = [...this._newFieldDescriptors];
      }
    }
  }

  async _addField() {
    const fieldName = await this.showDialog({text: 'Введите название поля', input: 'name'});
    if (fieldName && this._newFieldDescriptors.every(f => f.name !== fieldName)) {
      const field = {name: fieldName, label: fieldName, dataType: 'string'};
      this._newFieldDescriptors = [...this._newFieldDescriptors, field];
    }
  }

  async _saveFieldDescriptors() {
    await this.classItem.saveFieldDescriptors(this._newFieldDescriptors);
    this.onSaveFunc();
  }
}

window.customElements.define('av-class-configurator', AvClassConfigurator2);
