import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClassPanel} from "./3-av-class/AVClassPanel.jsx";
import {AVGrid} from "../V/AVGrid.jsx";
import {AVObjectDocument} from './4-AVObjectDocument.jsx';
import {AVClassConfigurator} from "./3-av-class/AVClassConfigurator.jsx";

export class AVClass extends AVItem {
  static defaultProps = {
    classItem: null,
    onObjectDocumentSelectedFunc: this.noop,
  }
  state = {
    currentViewName: '',
    fieldDescriptors: [],
    objectDocuments: [],
    selectedObjectDocument: null,

    isParametersPanelOpened: false,
    ParametersPanelrender: this.noop
  }

  render() {
    return (
      <div className="_av-class-root pos-rel flex-1 col">
        <AVClassPanel
          classItem={this.props.classItem}
          onClassViewChangedFunc={viewName => this.setState({currentViewName: viewName})}
          onCreateFunc={(e) => {this.setState({selectedObjectDocument: this.props.classItem.getNewObjectDocument()})}}
        ></AVClassPanel>
        {this._renderView()}
        {this.state.isParametersPanelOpened && this._renderParametersPanel(this.state.ParametersPanelrender)}
      </div>
    )
  }
  
  _renderView() {
    if (this.state.currentViewName === 'Grid') {
      return this._renderGrid()
    }
    if (this.state.currentViewName === 'Configurator') {
      return this._renderConfigurator()
    }
    return this.props.classItem.getViewComponentByName(this.state.currentViewName, this);
  }

  _renderGrid() {
    return (
      <div className="margin-top-8">
        <AVGrid
          items={this.state.objectDocuments}
          columns={this.state.fieldDescriptors}
          onRowClickFunc={this._onGridRowClick}
          onRowContextMenuFunc={this._onGridRowContextMenu}
        ></AVGrid>
        {this.state.selectedObjectDocument && (
          <div className="pos-abs trbl-0 col pad-4 z-index-10 bg-white">
            <AVObjectDocument
              fieldDescriptors={this.state.fieldDescriptors}
              objectDocument={this.state.selectedObjectDocument}
              onCloseFunc={() => {this.setState({selectedObjectDocument: null})}}
              onSavedFunc={this._onObjectSaved}
            ></AVObjectDocument>
          </div>
        )}
      </div>
    )
  }

  _renderConfigurator() {
    return (
      <AVClassConfigurator
        classItem={this.props.classItem}
        onSavedFunc={this._onFieldDescriptorsChanged}
      ></AVClassConfigurator>
    )
  }

  _renderParametersPanel(renderBody) {
    return (
        <div className="pos-abs rbl-0 height-35prc border scroll">
          {renderBody()}
        </div>
    )
  }

  async componentDidMount() {
    if (this.props.classItem) {
      await this._loadGridData();
      this.setState({currentViewName: this.props.classItem.defaultViewName})
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      await this._loadGridData();
      this.setState({currentViewName: this.props.classItem.defaultViewName})
    }
  }

  showParametersPanel = (ParametersPanelrender) => {
    this.setState({
      isParametersPanelOpened: true,
      ParametersPanelrender
    });
  }

  _loadGridData = async () => {
    const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
    const objectDocuments = await this.props.classItem.getObjectDocuments();
    this.setState({fieldDescriptors, objectDocuments});
  }

  _onGridRowClick = async (rowItem) => {
    const selectedObjectDocument = await this.props.classItem.getObjectDocument(rowItem.reference);
    this.setState({selectedObjectDocument});
    this.props.onObjectDocumentSelectedFunc(selectedObjectDocument);
  }

  _onGridRowContextMenu = async (rowItem, cellName, e) => {
    const menuChoice =  await this.showContextMenu(e , ['Удалить объект']);
    if (menuChoice === 'Удалить объект') {
      const ok = await this.showDialog({
        text: 'Удалить объект?',
        content: (<AVGrid items={[rowItem]} columns={this.state.fieldDescriptors}></AVGrid>)
      })
      if (ok) {
        const selectedObjectDocument = await this.props.classItem.getObjectDocument(rowItem.reference);
        if (selectedObjectDocument) {
          await selectedObjectDocument.deleteObjectDocument();
          await this._onObjectSaved()
        }
      }
    }
  }

  _onObjectSaved = async () => {
    const objectDocuments = await this.props.classItem.getObjectDocuments();
    this.setState({objectDocuments});
  }

  _onFieldDescriptorsChanged = async () => {
    const fieldDescriptors = await this.props.classItem.getFieldDescriptors();
    this.setState({fieldDescriptors});
  }

}
