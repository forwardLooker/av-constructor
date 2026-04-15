import React from 'react';

import {AVItem} from '../0-AVItem.js';
import {AVField} from "../5-AVField.jsx";

import {AVButton} from "../../V/AVButton.jsx";

export class AVClassPanel extends AVItem {
  static defaultProps = {
    classItem: null,
    onCreateFunc: this.noop,
    onCancelFunc: null,
    onSearchFunc: this.noop,
    onClassViewChangedFunc: this.noop,
    
    onTabChangeFunc: this.noop,
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
        {!window.vk_app && (
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
        )}
      </div>
   )
  }

  _renderGridButtons() {
    return (
      <div style={{flexBasis: '900px'}} className='row gap-12'>
        <AVButton onClick={this.props.onCreateFunc}>Создать</AVButton>
        {this.props.onCancelFunc && (<AVButton onClick={this.props.onCancelFunc}>Отмена</AVButton>)}
        <AVField
          fieldItem={{
            datatype: 'string',
            placeholder: 'Поиск',
            isLabelHidden: true
          }}
          // value={this.state.searchStr}
          onChangeFunc={searchStr => this.props.onSearchFunc(searchStr)}
        ></AVField>
        {(window.vk_app || true) && (
          <AVField
            fieldItem={{
              datatype: 'string',
              variant: 'tags-buttons',
              lineHeight: '10px',
              valuesList: 'Подготовка || Праздники || Подарки',
              isLabelHidden: true,
            }}
            value={this.props.classItem.name}
            onChangeFunc={value => this.props.onTabChangeFunc(value)}
          // value={this.state.searchStr}
          // onChangeFunc={searchStr => this.props.onSearchFunc(searchStr)}
          ></AVField>
        )}
      </div>
    )
  }

  _selectView(view) {
    this.setState({currentViewName: view});
    this.props.onClassViewChangedFunc(view);
  }
}
