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
      #sidebar {
        width: 25%;
      }
    `;
  }

  static properties = {
    items: {},
  };

  constructor() {
    super();
  }

  render() {
    return html`
      ${this.repeat()}
    `
  }

  async firstUpdated() {

  }
}
window.customElements.define('av-tree', AVTree);
