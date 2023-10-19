import {AVElement, css, html} from './0-av-element.js';

import './av-text-input.js';

export class AVPropertyGrid extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .tree-row {
        cursor: pointer;
        overflow: hidden;
      }
      .tree-row:hover {
        border: 1px solid black;
      }
      .tree-row.selected {
        border: 1px solid black;
      }
      .tree-row-expander {
        font-weight: 600;
        user-select: none;
      }
      .tree-row-expander.expanded {
        transform: rotate(45deg);
        transition: transform .2s ease-in-out;
      }
    `;
  }

  static properties = {
    inspectedItem: {},
    propertyItems: {},
    selectedItem: {},
    onItemSelectFunc: {}
  };

  constructor() {
    super();
    this.propertyItems = [];
    this.onItemSelectFunc = this.noop;
  }

  willUpdate(changedProps) {
    if (changedProps.has('inspectedItem')) {

    }
  }

  render(nestedItems, level) {
    if (!this.inspectedItem) {
      return this.nothing;
    }

    let items = this.propertyItems || [];
    let nestingLevel = level || 0;
    if (this.notEmpty(nestedItems)) {
      items = nestedItems;
    }
    if (this.isEmpty(nestedItems) && nestingLevel > 0) {
      return this.nothing;
    }
    return html`
      <div class="col ${this.classMap({'margin-left-16': nestingLevel > 0})}">
        ${this.repeat(items, i => i.name, propertyItem => html`
          <div class="col">
              <div class="tree-row row ${this.classMap({selected: propertyItem.selected})}">
                  <div
                    class="tree-row-expander ${this.classMap({expanded: propertyItem.expanded, invisible: this.isEmpty(propertyItem.items)})}"
                    @click="${() => this._toggleExpand(propertyItem)}"
                  >${html`>`}</div>
                  ${this._renderPropGridRow(propertyItem)}
              </div>
              <div ${this.showIf(propertyItem.expanded)}>
                  ${this.render(propertyItem.items, nestingLevel + 1)}
              </div>
          </div>
        `)}
      </div>
    `
  }

  // _renderPropGridRow(propertyItem) {
  //   return html`
  //     <div class="flex-1 row align-center margin-left-8">
  //       <av-label>${propertyItem.name}</av-label>
  //       <av-text-input
  //         .value="${this.inspectedItem[propertyItem.name]}"
  //         .onInputFunc="${value => this._updateInspectedItem(value, propertyItem)}"
  //       ></av-text-input>
  //     </div>
  //   `
  // }

  _renderPropGridRow(propertyItem) {
    return html`
      <av-field
        .fieldItem="${propertyItem}"
        .value="${this.inspectedItem[propertyItem.name]}"
        .onInputFunc="${value => this._updateInspectedItem(value, propertyItem)}"
      >
      </av-field>
    `
  }


  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _updateInspectedItem(value, propertyItem) {
    this.inspectedItem[propertyItem.name] = value;
  }

  _toggleExpand(i) {
    i.expanded = !i.expanded;
    this.requestUpdate();
  }

  _toggleSelect(newSelectedItem) {
    if (this.selectedItem !== newSelectedItem) {
      if (this.selectedItem) {
        this.selectedItem.selected = false;
      }
      newSelectedItem.selected = true;
      this.selectedItem = newSelectedItem;
      this.requestUpdate();
      this.onItemSelectFunc(newSelectedItem);
    }
  }
}
window.customElements.define('av-property-grid', AVPropertyGrid);
