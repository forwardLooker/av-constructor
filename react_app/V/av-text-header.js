import {AVElement, css, html} from './0-av-element.js';

export class AVTextHeader extends AVElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
      }
      .root {
        font-size: 20px;
        font-weight: bold;
      }
    `;
  }

  static properties = {
    size: {enum: ['big', 'medium', 'small']},
  };

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="root"><slot></slot></div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }
}
window.customElements.define('av-text-header', AVTextHeader);
