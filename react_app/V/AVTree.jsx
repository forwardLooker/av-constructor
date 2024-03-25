import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVTree extends AVElement {
  static styles = {
    treeRow: this.styled.div`
      cursor: pointer;
      overflow: hidden;
      &:hover {
        border: 1px solid black;
      }
      &.selected {
        border: 1px solid black;
      }
    `,
    treeRowExpander: this.styled.div`
      font-weight: 600;
      user-select: none;
      &.expanded {
        transform: rotate(45deg);
        transition: transform .2s ease-in-out;
      }
    `
  };

  static defaultProps = {
    items: [],
    onItemSelectFunc: this.noop,
    onItemContextMenuFunc: this.noop
  }
  state = {
    _items: [],
    selectedItem: null
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
      <div className={`flex-1 col ${nestingLevel > 0 ? 'margin-left-16' : ''}`}>
        {items.map((i,idx) => (
          <div className="col" key={i.name || idx}>
            <AVTree.styles.treeRow className={`row ${i.selected ? 'selected' : ''}`}>
              <AVTree.styles.treeRowExpander className={`tree-row-expander ${i.expanded ? 'expanded' : ''} ${this.isEmpty(i.items) ? 'invisible': ''}`}
                onClick={() => this._toggleExpand(i)}
              >{'>'}</AVTree.styles.treeRowExpander>
              <div
                className="flex-1 margin-left-4"
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

  componentDidMount() {
    this.setState({_items: this.deepCloneArrayWithInnerRef(this.props.items)})
  }

  componentDidUpdate(prevProps) {
    if (this.props.items !== prevProps.items) {
      this.setState({_items: this.deepCloneArrayWithInnerRef(this.props.items)})
    }
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
}
