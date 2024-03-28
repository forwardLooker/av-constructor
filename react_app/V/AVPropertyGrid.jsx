import React from 'react';

import {AVElement} from './0-AVElement.js';

import {AVField} from "../VM/5-AVField.jsx";

export class AVPropertyGrid extends AVElement {
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
    inspectedItem: null,
    propertyItems: [],
    onChangeFunc: this.noop,
  }


  render(nestedItems, level) {
    if (!this.props.inspectedItem) {
      return '';
    }

    let items = this.props.propertyItems || [];
    let nestingLevel = level || 0;
    if (this.notEmpty(nestedItems)) {
      items = nestedItems;
    }
    if (this.isEmpty(nestedItems) && nestingLevel > 0) {
      return '';
    }
    items = items.filter(i => !(typeof i.hideIfFunc === 'function' && i.hideIfFunc()));
    return (
      <div className={`flex-1 col ${nestingLevel > 0 ? 'margin-left-16' : ''}`}>
        {items.map((propertyItem, idx) => (
          <div className="col" key={propertyItem.name || idx}>
            <AVPropertyGrid.styles.treeRow className={`tree-row row align-center ${propertyItem.selected ? 'selected' : ''}`}>
              <AVPropertyGrid.styles.treeRowExpander className={`tree-row-expander ${propertyItem.expanded ? 'expanded' : ''} ${this.isEmpty(propertyItem.items) ? 'invisible': ''}`}
                onClick={() => this._toggleExpand(propertyItem)}
              >{'>'}</AVPropertyGrid.styles.treeRowExpander>
              {this._renderPropGridField(propertyItem)}
            </AVPropertyGrid.styles.treeRow>
            {propertyItem.expanded && (
              <div>
                {this.render(propertyItem.items, nestingLevel + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  _renderPropGridField = (propertyItem) => {
    return (
      <AVField
        fieldItem={propertyItem}
        value={this.props.inspectedItem[propertyItem.name]}
        onChangeFunc={value => {
          this.props.inspectedItem[propertyItem.name] = value;
          this.forceUpdate(); //чтобы выпадающие списки обновить
          this.props.onChangeFunc(value, propertyItem, this.props.inspectedItem)
        }}
        inspectedObject={this.props.inspectedItem}
      ></AVField>
    )
  }

  _toggleExpand = (i) => {
    i.expanded = !i.expanded;
    this.forceUpdate();
  }

}
