import React from 'react';

import {AVElement} from './0-AVElement.js';
import {AVIcon} from './icons/AVIcon.jsx';

export class AVTree extends AVElement {
  static styles = {
    treeRow: this.styled.div`
      cursor: pointer;
      overflow: hidden;
      &:hover {
        background: #acbfd2;
      }
      &.selected {
        background: #686767;
        color: white;
        border-radius: 4px;
      }
    `,
    iconContainer: this.styled.div`
      width: 16px;
      display: flex;
      flex-shrink: 0;
      justify-content: center;
      &.expanded {
        transform: rotate(90deg);
        transition: transform .2s ease-in-out;
      }
    `
  };

  static defaultProps = {
    items: [],
    expandAllRowsNestedLevel: 0,
    onItemSelectFunc: this.noop,
    onItemContextMenuFunc: this.noop
  }
  
  state = {
    _items: [],
    selectedItem: null
  }
  
  //render
  
  componentDidMount() {
    this._cloneAndPrepareItems();
  }

  componentDidUpdate(prevProps) {
    if (this.props.items !== prevProps.items) {
      this._cloneAndPrepareItems();
    }
  }

  render(nestedItems, level) {
    let items = this.state._items || [];
    let nestingLevel = level || 0;
    if (this.notEmpty(nestedItems)) {
      items = nestedItems;
    }
    if (this.isEmpty(nestedItems) && nestingLevel > 0) {
      return '';
    }
    return (
      <div className={`_av-tree-root flex-1 col bg-tree ${nestingLevel > 0 ? 'margin-left-16' : ''}`}>
        {items.map((i,idx) => (
          <div className="col" key={i.name || idx}>
            <AVTree.styles.treeRow className={`row ${i.selected ? 'selected' : ''}`}>
              <AVTree.styles.iconContainer className={`tree-row-expander ${i.expanded ? 'expanded' : ''} ${this.isEmpty(i.items) ? 'invisible': ''}`}
                                                     onClick={() => this._toggleExpand(i)}
              >
                <AVIcon name='treeArrow'></AVIcon>
              </AVTree.styles.iconContainer>
              {i.itemType && (
                <div className="pad-0-2">
                  <AVIcon name={(i.itemType === 'domain')? 'briefcase' : i.itemType === 'classFolder'? 'folder' : 'fileDocument'}></AVIcon>
                </div>)
              }
              <div
                className="flex-1"
                onClick={(e) => this._toggleSelect(e, i)}
                onContextMenu={(e) => this._onRowContextMenu(e, i)}
              >{i.name}</div>
            </AVTree.styles.treeRow>
            {i.expanded && (
              <div>
                {this.render(i.items, nestingLevel + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  _cloneAndPrepareItems = () => {
    let _items = this.deepCloneArrayWithInnerRef(this.props.items);
    if (this.props.expandAllRowsNestedLevel > 0) {
      this._expandAllRowsByNestedLevel(_items, this.props.expandAllRowsNestedLevel);
    }
    this.setState({_items: _items})
  }

  _onRowContextMenu = (e, newSelectedItem) => {
    const selectedItemOriginal = newSelectedItem._originalItemRef;
    this.props.onItemContextMenuFunc(e, selectedItemOriginal);
  }

  _toggleExpand = (i) => {
    i.expanded = !i.expanded;
    this.forceUpdate();
  }

  _toggleSelect = (e, newSelectedItem) => {
    if (this.state.selectedItem !== newSelectedItem) {
      if (this.state.selectedItem) {
        delete this.state.selectedItem.selected;
      }
      newSelectedItem.selected = true;
      this.setState({selectedItem: newSelectedItem});
      const newSelectedItemOriginal = newSelectedItem._originalItemRef;
      this.props.onItemSelectFunc(newSelectedItemOriginal);
    }
  }

  _expandAllRowsByNestedLevel(items, level) {
    if (!items || level === 0) return;
    items.forEach(i => {
      i.expanded = true;
      this._expandAllRowsByNestedLevel(i.items, level-1);
    })
  }
}
