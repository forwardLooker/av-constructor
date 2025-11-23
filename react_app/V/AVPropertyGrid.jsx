import React from 'react';

import {AVElement} from './0-AVElement.js';

import { AVField } from "../VM/5-AVField.jsx";
import { AVIcon } from './icons/AVIcon.jsx';

export class AVPropertyGrid extends AVElement {
  static styles = {
    treeRow: this.styled.div`
      cursor: pointer;
      overflow: hidden;
      //&:hover {
      //  border: 1px solid black;
      //}
      &.selected {
        border: 1px solid black;
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
    `,
  };

  static defaultProps = {
    inspectedItem: null,
    propertyItems: [],
    isStructuredFillingOfInspectedItem: false, // Пока не рекурсивно на только на 1 уровень вложенности
    onChangeFunc: this.noop,
  }


  render(nestedItems, level, parentItem) {
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
      <div className={`_av-property-grid-root flex-1 col ${nestingLevel > 0 ? 'margin-left-16' : ''} bg-property-grid`}>
        {items.map((propertyItem, idx) => (
          <div className="col" key={propertyItem.name || idx}>
            <AVPropertyGrid.styles.treeRow className={`tree-row row align-center margin-top-2 ${propertyItem.selected ? 'selected' : ''}`}>
              {/*<AVPropertyGrid.styles.treeRowExpander className={`tree-row-expander ${propertyItem.expanded ? 'expanded' : ''} ${this.isEmpty(propertyItem.items) ? 'invisible': ''}`}*/}
              {/*  onClick={() => this._toggleExpand(propertyItem)}*/}
              {/*>{'>'}</AVPropertyGrid.styles.treeRowExpander>*/}
              <AVPropertyGrid.styles.iconContainer className={`tree-row-expander ${propertyItem.expanded ? 'expanded' : ''} ${this.isEmpty(propertyItem.items) ? 'invisible': ''}`}
                                                     onClick={() => this._toggleExpand(propertyItem)}
              >
                <AVIcon name='treeArrow'></AVIcon>
              </AVPropertyGrid.styles.iconContainer>
              {this._renderPropGridField(propertyItem, parentItem)}
            </AVPropertyGrid.styles.treeRow>
            {propertyItem.expanded && (
              <div>
                {this.render(propertyItem.items, nestingLevel + 1, propertyItem)}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  _renderPropGridField = (propertyItem, parentItem) => {
    let value;
    if (this.props.isStructuredFillingOfInspectedItem && parentItem) {
      if (typeof this.props.inspectedItem[parentItem.name] === 'object') {
        value = this.props.inspectedItem[parentItem.name][propertyItem.name];
      }
    } else {
      value = this.props.inspectedItem[propertyItem.name];
    }
    return (
      <AVField
        fieldItem={propertyItem}
        value={value}
        onChangeFunc={value => {
          // работает токо на 1 уровень вложенности, не рекурсивно
          if (this.props.isStructuredFillingOfInspectedItem && parentItem) {
            if (typeof this.props.inspectedItem[parentItem.name] !== 'object') {
              this.props.inspectedItem[parentItem.name] = {};
            }
            this.props.inspectedItem[parentItem.name][propertyItem.name] = value;
          } else {
            this.props.inspectedItem[propertyItem.name] = value;
          }
          this.forceUpdate(); //чтобы выпадающие списки обновить
          this.props.onChangeFunc(value, propertyItem, this.props.inspectedItem, parentItem)
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
