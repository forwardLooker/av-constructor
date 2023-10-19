import React from 'react';

import {html, css, AVItem} from './0-av-item.js';

import {AVClassPanel} from "./3-av-class/AVClassPanel.jsx";

import './4-av-object-document.js'
import './3-av-class/av-class-configurator.js'

import '../V/av-grid.js';

export class AVClass extends AVItem {
  static defaultProps = {
    classItem: null,

    onObjectDocumentSelectedFunc: this.noop,
    hideOnDidMount: false
  }
  state = {
    currentViewName: this.props.classItem.defaultViewName,
    fieldDescriptors: [],
    objectDocuments: [],
    selectedObjectDocument: null,
  }

  render() {
    return (
      <div className="flex-1 col">
        <AVClassPanel
          classItem={this.props.classItem}
          onClassViewChangedFunc={viewName => this.setState({currentViewName: viewName})}
          onCreateFunc={(e) => {this.setState({selectedObjectDocument: this.props.classItem.getNewObjectDocument()})}}
        ></AVClassPanel>
        {this.state.currentViewName === 'Grid' ? this._renderGrid() : ''}
        {this.state.currentViewName === 'Configurator' ? this._renderConfigurator() : ''}
      </div>
    )
  }

  _renderGrid() {
    return (
      <div>
        <div>av-grid</div>
        {this.state.selectedObjectDocument && (
          <div>av-object-document</div>
        )}
      </div>
    )
  }

  _renderConfigurator() {
    return (
      <div>av-configurator</div>
    )
  }

  componentDidMount() {
    if (this.props.hideOnDidMount) {
      this.hide(); // TODO у реакт компонента нету classList
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      this.setState({currentViewName: this.props.classItem.defaultViewName})

      const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
      const objectDocuments = await this.props.classItem.getObjectDocuments();
      this.setState({fieldDescriptors, objectDocuments});
    }
  }

}

export class AVClass2 extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .object-show {
        position: absolute;
        padding: 4px;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10;
        background: white;
      }
    `;
  }

  static properties = {
    classItem: {},
    currentViewName: {},
    fieldDescriptors: {},
    objectDocuments:{},
    selectedObjectDocument: {},
    onObjectDocumentSelected: {},

    hideOnfirstUpdate: {type: Boolean}
  };

  constructor() {
    super();
    this.classItem = null;
    this.currentViewName = '';
    this.fieldDescriptors = [];
    this.objectDocuments = [];
    this.selectedObjectDocument = null;
    this.onObjectDocumentSelected = this.noop;
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem') && this.classItem) {
      this.currentViewName = this.classItem.defaultViewName
    }
  }

  render() {
    return html`
      <av-class-panel
        .classItem="${this.classItem}"
        .onClassViewChangedFunc="${viewName => this.currentViewName = viewName}"
        .onCreateFunc="${(e) => {this.selectedObjectDocument = this.classItem.getNewObjectDocument()}}"
      ></av-class-panel>
      ${this.currentViewName === 'Grid' ? this._renderGrid() : this.nothing}
      ${this.currentViewName === 'Configurator' ? this._renderConfigurator() : this.nothing}
    `
  }

  _renderGrid() {
    return html`
      <av-grid
        class="margin-top-8"
        .items="${this.objectDocuments}"
        .columns="${this.fieldDescriptors}"
        .onRowClickFunc="${this._onGridRowClick}"
      >
      </av-grid>
      ${this.if(this.selectedObjectDocument, html`
          <av-object-document
            class="object-show"
            .fieldDescriptors="${this.fieldDescriptors}"
            .objectDocument="${this.selectedObjectDocument}"
            .onCloseFunc="${() => this.selectedObjectDocument = null}"
            .onSavedFunc="${this._onObjectSaved}"
          >
          </av-object-document>
      `)}
    `
  }

  _renderConfigurator() {
    return html`
      <av-class-configurator
        .classItem="${this.classItem}"
        .onSaveFunc="${this._onFieldDescriptorsChanged}"
      ></av-class-configurator>
    `
  }

  firstUpdated() {
    if (this.hideOnfirstUpdate) {
      this.hide();
    }
  }

  async updated(changedProps) {
    if (changedProps.has('classItem') && this.classItem) {
      this.fieldDescriptors = await this.classItem.getFieldDescriptors();
      this.objectDocuments = await this.classItem.getObjectDocuments();
    }
  }

  _onGridRowClick = async (rowItem) => {
    const objectDocumentItem = await this.classItem.getObjectDocument(rowItem.reference);
    this.selectedObjectDocument = objectDocumentItem;
    this.onObjectDocumentSelected(objectDocumentItem);
  }

  _onObjectSaved = async () => {
    this.objectDocuments = await this.classItem.getObjectDocuments();
  }

  _onFieldDescriptorsChanged = async () => {
    this.fieldDescriptors = await this.classItem.getFieldDescriptors();
  }
}

window.customElements.define('av-class', AVClass);
