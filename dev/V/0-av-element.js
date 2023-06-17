import {html, css as litCSS, LitElement, nothing} from "lit";
import {directive, Directive} from "lit/directive.js";
import {repeat} from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';

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
    return nothing;
  }
}

class AVElement extends LitElement {
  nothing = nothing;
  showIf = directive(showIfDirective);
  repeat = repeat;
  classMap = classMap;
  isEmpty(val) {
    return !val || (Array.isArray(val) && val.length === 0)
  }
  notEmpty(val) {
    return !this.isEmpty(val);
  }
  $(selector) {
    return this.shadowRoot.querySelector(selector);
  }
  $All(selector) {
    return this.shadowRoot.querySelectorAll(selector);
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
    .margin-left-16 {
      margin-left: 16px;
    }
    .margin-top-8 {
      margin-top: 8px;
    }
    .no-display {
      display: none;
    }
    .invisible {
      visibility: hidden;
    }
  `
  return litCSS`
    ${globalCSS}
    ${litCSS(...values)}
  `;
};

export {html, css, AVElement};
