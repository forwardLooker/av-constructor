import {AVElement, css, html} from './0-AVElement.js';

export class AVTextInput extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
      }
      input {
        position: relative;
        display: inline-block;
        padding: 5px 12px;
        line-height: 20px;
        background-color: #fff;
        transition: all .2s;
        border: 1px solid black;
        border-radius: 6px;
        box-shadow: gray;
        vertical-align: middle;
        //-webkit-box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
        //box-shadow: 2px 2px 2px 0 rgba(0,0,0,0.2);
      }

      input:hover {
        border-color: black;
      }
    `;
  }

  static properties = {
    value: {},
    onInputFunc: {}
    // items: {},
  };

  constructor() {
    super();
    this.onInputFunc = this.noop;
  }
// TODO поа не используется из-за бага
  render() {
    return html`
        <div class="flex-1 row">
          <input
            class="flex-1"
            autocomplete="off"
            value="${this.value}"
            @input="${this._input}"
          >
        </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _input(e) {
    // this.value = e.target.value;
    this.onInputFunc(e.target.value, e)
  }

}
window.customElements.define('av-text-input', AVTextInput);
