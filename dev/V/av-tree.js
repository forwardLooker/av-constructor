import {AVElement, css, html} from './0-av-element.js';

export class AVTree extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .row {
        cursor: pointer;
        overflow: hidden;
      }
      .row-expander {
        font-weight: 600;
        user-select: none;
      }
      .row-expander.expanded {
        transform: rotate(90deg);
        transition: transform .2s ease-in-out;
      }
      .row-name:hover {
        background: aliceblue;
      }
      .row-name.selected {
        background: lightgray;
      }
    `;
  }

  static properties = {
    items: {},
    selectedItem: {}
  };

  constructor() {
    super();
  }

  render(nestedItems, level) {
    let items = this.items;
    let nestingLevel = level || 0;
    if (this.notEmpty(nestedItems)) {
      items = nestedItems;
    }
    if (this.isEmpty(nestedItems) && nestingLevel > 0) {
      return this.nothing;
    }
    console.log('nest:', nestedItems);
    return html`
      <div class="col margin-left-16">
        ${this.repeat(items, i => i.id, i => html`
          <div class="col">
              <div class="row">
                  <div
                    class="row-expander ${this.classMap({expanded: i.expanded, invisible: this.isEmpty(i.items)})}"
                    @click="${() => this.toggleExpand(i)}"
                  >${html`>`}</div>
                  <div 
                    class="row-name margin-left-8 ${this.classMap({selected: i.selected})}"
                    @click="${() => this.toggleSelect(i)}"
                  >${i.name}</div>
              </div>
              <div ${this.showIf(i.expanded)}>
                  ${this.render(i.items, nestingLevel + 1)}
              </div>
          </div>
        `)}
      </div>
    `
  }

  toggleExpand(i) {
    i.expanded = !i.expanded;
    this.requestUpdate();
  }
  toggleSelect(newSelectedItem) {
    if (this.selectedItem !== newSelectedItem) {
      if (this.selectedItem) {
        this.selectedItem.selected = false;
      }
      newSelectedItem.selected = true;
      this.selectedItem = newSelectedItem;
      this.requestUpdate();
    }
  }

  async firstUpdated() {

  }
}
window.customElements.define('av-tree', AVTree);
