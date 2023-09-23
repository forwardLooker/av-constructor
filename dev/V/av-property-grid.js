import {AVElement, css, html} from './0-av-element.js';

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
    item: {},
    items: {},
    selectedItem: {},
    onItemSelectFunc: {}
  };

  constructor() {
    super();
    this.items = [];
    this.onItemSelectFunc = this.noop;
  }

  willUpdate(changedProps) {
    if (changedProps.has('item')) {

    }
  }

  render(nestedItems, level) {
    let items = this.items || [];
    let nestingLevel = level || 0;
    if (this.notEmpty(nestedItems)) {
      items = nestedItems;
    }
    if (this.isEmpty(nestedItems) && nestingLevel > 0) {
      return this.nothing;
    }
    return html`
      <div class="col ${this.classMap({'margin-left-16': nestingLevel > 0})}">
        ${this.repeat(items, i => i.id, i => html`
          <div class="col">
              <div class="tree-row row ${this.classMap({selected: i.selected})}">
                  <div
                    class="tree-row-expander ${this.classMap({expanded: i.expanded, invisible: this.isEmpty(i.items)})}"
                    @click="${() => this._toggleExpand(i)}"
                  >${html`>`}</div>
                  <av-field
                    class="tree-row-name margin-left-8"
                    .item="${i}"
                    @click="${() => this._toggleSelect(i)}"
                  ></av-field>
              </div>
              <div ${this.showIf(i.expanded)}>
                  ${this.render(i.items, nestingLevel + 1)}
              </div>
          </div>
        `)}
      </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

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
