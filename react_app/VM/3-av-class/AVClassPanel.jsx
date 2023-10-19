import React from 'react';

import {AVItem} from '../0-AVItem.js';

import {AVButton} from "../../V/AVButton.jsx";

export class AVClassPanel extends AVItem {
  static defaultProps = {
    classItem: null,
    onCreateFunc: this.noop,
    onClassViewChangedFunc: this.noop
  }
  state = {
    currentViewName: this.props.classItem?.defaultViewName,
    availableViewsList: this.props.classItem?.getViewsList(),
    viewsDropdownOpened: false,
  }

  render() {
    return (
      <div className="row border-2-bot">
        {this.state.currentViewName === 'Grid' ? this._renderGridButtons() : ''}
        <div className="flex-1 row justify-end pad-8">
          <div className="view-selector pos-rel row align-center cursor-pointer" onClick={this._onViewSelectorClick}>
            <div>{this.state.currentViewName}</div>
            <div className="view-selector-arrow margin-left-2 rotate-90">{'>'}</div>
            {this.state.viewsDropdownOpened && (
              <div className='selection-list pos-abs right-0 bottom-0 col z-index-1000 bg-white border'>
                {this.state.availableViewsList.map(viewName => (
                  <div className="selection-item" key={viewName} onClick={(e) => this._selectView(viewName)}>{viewName}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
   )
  }

  _renderGridButtons() {
    return (
      <div className="pad-vrt-8">
        <AVButton onClick={this.props.onCreateFunc}>Создать</AVButton>
      </div>
    )
  }

  componentDidUpdate(prevProps) {
    if (this.props.classItem !== prevProps.classItem) {
      const currentViewName = this.props.classItem.defaultViewName;
      const availableViewsList = this.props.classItem.getViewsList();
      this.setState({currentViewName, availableViewsList});
    }
  }

  _onViewSelectorClick = () => {
    if (!this.state.viewsDropdownOpened) {
      this.setState({viewsDropdownOpened: true});
      setTimeout(() => {
        window.addEventListener('click', this._windowClickHandler);
      }, 4)
    } else {
      this.setState({viewsDropdownOpened: false});
      window.removeEventListener('click', this._windowClickHandler);
    }
  }

  _windowClickHandler = (e) => {
    this.setState({viewsDropdownOpened: false});
    window.removeEventListener('click', this._windowClickHandler);
  }

  _selectView(view) {
    this.setState({currentViewName: view});
    this.props.onClassViewChangedFunc(view);
  }
}
