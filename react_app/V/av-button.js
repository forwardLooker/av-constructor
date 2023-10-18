import {AVElement, css, html} from './0-av-element.js';

export class AVButton extends AVElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
      }
      .standart-button {
        text-align: center;
        color: white;
        background-color: black;
        border-color: black;
        box-shadow: gray;
        transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
        transition-property: color,background-color,box-shadow,border-color;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: var(--base-text-weight-medium, 500);
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid;
        border-radius: 6px;
        appearance: none;
      }

      .standart-button:hover {
        opacity: 0.90;
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
      <button class="standart-button"">
        <slot></slot>
      </button>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }
}
window.customElements.define('av-button', AVButton);
