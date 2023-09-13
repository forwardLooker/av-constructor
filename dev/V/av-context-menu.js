import {AVElement, css, html} from './0-av-element.js';

export class AVContextMenu extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: absolute;
        background-color: gainsboro;
        z-index: 10000;
        cursor: default;
      }
    `;
  }

  static properties = {
    items: {},
  };

  constructor() {
    super();
    this.items = [];
  }

  willUpdate(changedProps) {

  }

// TODO подобрать цвета и отступы а так очень похоже на нативное контекст меню
  render() {
    return html`
      <div id="context-menu" class="col">
        ${this.repeat(this.items, i => i, i => html`
            <div class="contextMenuItem pad-4" @click="${e => this._onItemSelect(i)}">${i}</div>
        `)}
      </div>
    `
  }

  firstUpdated() {
    this.hide();
  }

  async updated(changedProps) {

  }

  show(e, menuItems) {
    this.items = menuItems;
    this.style.left = e.pageX+'px';
    this.style.top = e.pageY+'px';
    this.display();
    return new Promise((resolve, reject) => {
      this.addEventListener('context-menu-item-selected', listenerOnSelect);
      window.addEventListener('click', listenerOnCloseWithoutSelect)

      const self = this;
      function listenerOnSelect(e) {
        self.removeEventListener('context-menu-item-selected', listenerOnSelect);
        window.removeEventListener('click', listenerOnCloseWithoutSelect);
        self.hide();
        self.items = [];
        resolve(e.detail);
      }
      function listenerOnCloseWithoutSelect(e) {
        self.removeEventListener('context-menu-item-selected', listenerOnSelect);
        window.removeEventListener('click', listenerOnCloseWithoutSelect);
        if (!e.target.classList.contains('contextMenuItem')) {
          self.hide();
          self.items = [];
          resolve(false);
        }
      }
    })
  }

  _onItemSelect(item) {
    this.fire('context-menu-item-selected', {menuItem: item})
  }
}
window.customElements.define('av-context-menu', AVContextMenu);
