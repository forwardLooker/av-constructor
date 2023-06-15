import {html, css as litCSS, LitElement} from "lit";
import {directive, Directive} from "lit/directive.js";
import {repeat} from 'lit/directives/repeat.js';

class showIfDirective extends Directive {
  update(part, [condition]) {
    console.log('showIfDirective part:', part);
    if (!condition) {
      part.element.classList.add('no-display')
    } else {
      part.element.classList.remove('no-display')
    }
    return this.render();
  }
  render() {
    return null;
  }
}

class AVElement extends LitElement {
  // fromHost(propName) {
  //   return {
  //     _fieldFromHost: propName
  //   }
  // }
  // constructor() {
  //   super();
  //   const name = Object.keys(this).find((fieldName) => this[fieldName]?._fieldFromHost?.length > 0);
  //
  // }

  showIf = directive(showIfDirective);
  repeat = repeat;
  static Host() {};
  get Host() { return AVElement.Host; }
  get db() { return this.Host.db; }
  get auth() { return this.Host.auth; }
  get user() {
    if (!this._userFromHost?.listenerHasSet) {
      let listenerId = this.Host.listen('user-state-changed', () => {
        this._userFromHost.value = this.Host.user;
        this.requestUpdate();
      })
      this._userFromHost = { value: this.Host.user, listenerHasSet: true, listenerId }
    }
    return this._userFromHost.value;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._userFromHost?.listenerId) {
      this.Host.clearListener(this._userFromHost.listenerId);
      this._userFromHost = { value: null, listenerHasSet: false };
    }
  }
}

function css(...values) {
  const globalCSS = litCSS`
    .row {
        display: flex;
        flex-direction: row;
    }
    .col {
        display: flex;
        flex-direction: column;
    }
    .flex-1 {
      flex: 1;
    }
    .align-start {
      align-items: flex-start;
    }
    .align-end {
      align-items: flex-end;
    }
    .align-center {
      align-items: center;
    }
    .align-baseline {
      align-items: baseline;
    }
    .align-stretch {
      align-items: stretch;
    }
    .justify-start {
      justify-content: flex-start;
    }
    .justify-end {
      justify-content: flex-end;
    }
    .justify-center {
      justify-content: center;
    }
    .space-between {
      justify-content: space-between;
    }
    .space-around {
      justify-content: space-around;
    }
    .space-evenly {
      justify-content: space-evenly;
    }
    .pos-abs {
      position: absolute;
    }
    .pos-rel {
      position: relative;
    }
    .pos-fixed {
      position: fixed;
    }
    .pad-8 {
      padding: 8px;
    }
    .border {
        border: 0.5px solid black;
    }
    .margin-left-8 {
      margin-left: 8px;
    }
    .margin-top-8 {
      margin-top: 8px;
    }
    .no-display {
      display: none;
    }
  `
  return litCSS`
    ${globalCSS}
    ${litCSS(...values)}
  `;
};

export {html, css, AVElement};
