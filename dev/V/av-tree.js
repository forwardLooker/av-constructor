import {AVElement, css, html} from './0-av-element.js';

export class AVTree extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      #header {
        padding: 0 1.5em;
        box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
      }
    `;
  }

  static properties = {
    items: {},
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
              <div>${i.name}</div>
              ${this.render(i.items, nestingLevel + 1)}
          </div>
        `)}
      </div>
    `
  }

  async firstUpdated() {

  }
}
window.customElements.define('av-tree', AVTree);
