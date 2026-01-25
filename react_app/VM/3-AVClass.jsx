import React from 'react';

import {AVItem} from './0-AVItem.js';

import {AVClassPanel} from "./3-av-class/AVClassPanel.jsx";
import {AVGrid} from "../V/AVGrid.jsx";
import {AVObjectDocument} from './4-AVObjectDocument.jsx';
import {AVClassConfigurator} from "./3-av-class/AVClassConfigurator.jsx";
import {AVButton} from "../V/AVButton.jsx";

import { JSONTree } from 'react-json-tree';

export class AVClass extends AVItem {
  static defaultProps = {
    classItem: null,
    onObjectDocumentSelectedFunc: this.noop, // применяется внутри объекта в котором открывают класс для поля линк на объект
    itemFullScreenMode: false, // знание убирает паддинги
  }
  state = {
    currentViewName: '',
    fieldDescriptors: [],
    objectDocuments: [],
    selectedObjectDocument: null,

    isParametersPanelOpened: false, // Пока нигде не используется
    ParametersPanelrender: this.noop
  }
  
  gridRef;
  
  //render
  
  async componentDidMount() {
    console.log('AVClass componentDidMount, props:', this.props);
    if (this.props.classItem) {
      await this._loadGridData();
      this.setState({ currentViewName: this.props.classItem.defaultViewName })
    }

  }

  async componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      await this._loadGridData();
      this.setState({ currentViewName: this.props.classItem.defaultViewName })
    }
    
    if (!this.state.selectedObjectDocument && this.gridRef) {
      this.gridRef.realign()
    }

    if (this.state.currentViewName === 'Charts') {

      // Load the Visualization API and the corechart package.
      google.charts.load('current', { 'packages': ['corechart'] });

      // Set a callback to run when the Google Visualization API is loaded.
      google.charts.setOnLoadCallback(drawChart.bind(this));

      // Callback that creates and populates a data table,
      // instantiates the pie chart, passes in the data and
      // draws it.
      function drawChart() {

        // Create the data table.
        // var data = new google.visualization.DataTable();
        // data.addColumn('string', 'Topping');
        // data.addColumn('number', 'Slices');
        // data.addRows([
        //   ['Mushrooms', 3],
        //   ['Onions', 1],
        //   ['Olives', 1],
        //   ['Zucchini', 1],
        //   ['Pepperoni', 2]
        // ]);

        // // Set chart options
        // var options = {
        //   'title': 'How Much Pizza I Ate Last Night',
        //   'width': 400,
        //   'height': 300
        // };
        this.state.fieldDescriptors.forEach(fd => {
          var data = new google.visualization.DataTable();
          data.addColumn('string',fd.name);
          data.addColumn('number', 'Slices');
          data.addRows(this.state.objectDocuments.reduce((acc, currentObj, idx, arr) => {
            if (acc.every(row => row[0] !== currentObj[fd.name])) {
              acc.push([
                currentObj[fd.name],
                arr.filter(o => o[fd.name] === currentObj[fd.name]).length
              ])
            }
            return acc;
          }, []));

          // Set chart options
          var options = {
            'title': fd.name,
            'width': 400,
            'height': 300
          };

          // Instantiate and draw our chart, passing in some options.
          var chart = new google.visualization.PieChart(document.getElementById(`chart_div_${fd.name}`));
          chart.draw(data, options);

        })

      }

    }
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
    if (this.state.currentViewName === 'JSON') {
      return this._renderJSON()
    }
    if (this.state.currentViewName === 'Charts') {
      return this._renderCharts()
    }
    return this.props.classItem.getViewComponentByName(this.state.currentViewName, this);
  }

  _renderGrid() {
    return (
      <div className="margin-top-8">
        {!this.state.selectedObjectDocument && (
          <div>
            <AVGrid
              ref={$grid => this.gridRef = $grid}
              items={this.state.objectDocuments}
              columns={this.state.fieldDescriptors}
              onRowClickFunc={this._onGridRowClick}
              onRowContextMenuFunc={this._onGridRowContextMenu}
              isColumnsReorderable
              onColumnsReorderFunc={async (newColumns) => {
                this.setState({ fieldDescriptors: newColumns })
                await this.props.classItem.saveFieldDescriptors(newColumns);
              }}
            ></AVGrid>
          </div>
        )}
        {this.state.selectedObjectDocument && (
          <div className={`pos-abs trbl-0 col ${this.props.itemFullScreenMode ? '' : 'pad-4'} z-index-10 bg-app-back`}>
            <AVObjectDocument
              fieldDescriptors={this.state.fieldDescriptors}
              objectDocument={this.state.selectedObjectDocument}
              onCloseFunc={() => {this.setState({selectedObjectDocument: null})}}
              onSavedFunc={this._onObjectSaved}
              itemFullScreenMode={this.props.itemFullScreenMode}
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

  _renderJSON() {
    return (
      <JSONTree data={this.props.classItem.metadata}/>
    );
  }

  _renderCharts() {
    return (
      <div className="row flex-wrap">
        {this.state.fieldDescriptors.map(fd => {
          return (
            <div className="margin-left-16" id={`chart_div_${fd.name}`}>Charts</div>
          )
        })}
      </div>
    )
  }

  _renderParametersPanel(renderBody) {
    return (
      <div className="pos-abs rbl-0 height-35prc scroll">
        <div className="row justify-end">
          <div>
            <AVButton
              onClick={() => {
                this.setState({
                  isParametersPanelOpened: false,
                });
              }}
            >
              Закрыть
            </AVButton>
          </div>
        </div>
        <div className="border">
          {renderBody()}
        </div>
      </div>
    )
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
