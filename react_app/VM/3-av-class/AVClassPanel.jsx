import React from 'react';

import {AVItem} from '../0-AVItem.js';
import {AVField} from "../5-AVField.jsx";

import {AVButton} from "../../V/AVButton.jsx";

export class AVClassPanel extends AVItem {
  static defaultProps = {
    classItem: null,
    onCreateFunc: this.noop,
    onClassViewChangedFunc: this.noop
  }
  state = {
    currentViewName: '',
    availableViewsList: [],
  }

  //render
  
  async componentDidMount() {
    if (this.props.classItem) {
      await this.props.classItem.getFieldDescriptors() // TODO ?
      const currentViewName = this.props.classItem.defaultViewName;
      const availableViewsList = this.props.classItem.getViewsList();
      this.setState({ currentViewName, availableViewsList });
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      await this.props.classItem.getFieldDescriptors() // TODO ?
      const currentViewName = this.props.classItem.defaultViewName;
      const availableViewsList = this.props.classItem.getViewsList();
      this.setState({ currentViewName, availableViewsList });
    }
  }

  render() {
    return (
      <div className="_av-class-panel-root row pad-bottom-2 border-bottom-2">
        {this.state.currentViewName === 'Grid' ? this._renderGridButtons() : ''}
        <div className="flex-1 row justify-end">
          <div>
            <AVField
              fieldItem={{
                variant: 'select',
                valuesList: this.state.availableViewsList,
                isEmptyOptionHidden: true
              }}
              value={this.state.currentViewName}
              onChangeFunc={viewName => this._selectView(viewName)}
            ></AVField>
          </div>
        </div>
      </div>
   )
  }

  _renderGridButtons() {
    return (
      <div>
        <AVButton onClick={this.props.onCreateFunc}>Создать</AVButton>
      </div>
    )
  }

  _selectView(view) {
    this.setState({currentViewName: view});
    this.props.onClassViewChangedFunc(view);
  }
}
