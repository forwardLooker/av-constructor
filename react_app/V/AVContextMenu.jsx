import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVContextMenu extends AVElement {
  static defaultProps = {
    items: [],
    contextMenuEvent: null,
    onItemSelectFunc: this.noop
  }

  // TODO подобрать цвета и отступы а так очень похоже на нативное контекст меню
  render() {
    return (
      <div
        className="pos-abs flex-1 col z-index-10000 bg-gainsboro cursor-default"
        style={{
          top: this.props.contextMenuEvent.pageY + 'px',
          left: this.props.contextMenuEvent.pageX + 'px'
        }}
      >
        {this.props.items.map(meniItem => (
          <div
            className="contextMenuItem pad-4"
            key={meniItem}
            onClick={e => this.props.onItemSelectFunc(meniItem)}
          >
            {meniItem}
          </div>
        ))}
      </div>
    )
  }

  componentDidMount() {
    window.addEventListener('click', this._onCloseWithoutSelect);
  }

  _onCloseWithoutSelect = (e) => {
    window.removeEventListener('click', this._onCloseWithoutSelect);
    if (!e.target.classList.contains('contextMenuItem')) {
      this.props.onItemSelectFunc(false);
    }
  }

}
