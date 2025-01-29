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
    currentViewName: this.props.classItem?.defaultViewName,
    fieldDescriptors: [],
    objectDocuments: [],
    selectedObjectDocument: null,
  }

  render() {
    return (
      <div className="pos-rel flex-1 col">
        <AVClassPanel
          classItem={this.props.classItem}
          onClassViewChangedFunc={viewName => this.setState({currentViewName: viewName})}
          onCreateFunc={(e) => {this.setState({selectedObjectDocument: this.props.classItem.getNewObjectDocument()})}}
        ></AVClassPanel>
        {this.state.currentViewName === 'Grid' ? this._renderGrid() : ''}
        {this.state.currentViewName === 'Configurator' ? this._renderConfigurator() : ''}
        {this._renderView()}
      </div>
    )
  }
  
  _

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

  componentDidMount() {
    if (this.props?.classItem) {
      this._loadGridData();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      this.setState({currentViewName: this.props.classItem.defaultViewName})

      this._loadGridData();
    }
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
