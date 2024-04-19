import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVContextMenu extends AVElement {
  static styles = {
    contextMenuItem: this.styled.div`
      &:hover {
        background: #98acc1;
      }
    `
  }
  static defaultProps = {
    items: [],
    contextMenuEvent: null,
    onItemSelectFunc: this.noop
  }

  // TODO подобрать цвета и отступы а так очень похоже на нативное контекст меню
  render() {
    return (
      <div
        className="pos-abs flex-1 col pad-2-0 z-index-10000 font-size-14px bg-context-menu cursor-default"
        style={{
          top: this.props.contextMenuEvent.pageY + 'px',
          left: this.props.contextMenuEvent.pageX + 'px'
        }}
      >
        {this.props.items.map(meniItem => (
          <this.constructor.styles.contextMenuItem
            className="contextMenuItem pad-4-12"
            key={meniItem}
            onClick={e => this.props.onItemSelectFunc(meniItem)}
          >
            {meniItem}
          </this.constructor.styles.contextMenuItem>
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
