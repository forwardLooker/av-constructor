import {AVElement, css, html} from './0-av-element.js';

export class AVLabel extends AVElement {
  static get styles() {
    return css`
      :host {
        
      }
      label {
        display: inline-block;
        padding: 0 4px;
      }
    `;
  }

  static properties = {
    // items: {},
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <label>
        <slot></slot>
      </label>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }
}
window.customElements.define('av-label', AVLabel);
