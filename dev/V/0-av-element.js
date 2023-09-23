import {html, css as litCSS, LitElement, nothing} from "lit";
import {directive, Directive} from "lit/directive.js";
import {repeat} from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';
import {styleMap} from 'lit/directives/style-map.js';
import { ref } from 'lit/directives/ref.js';

class showIfDirective extends Directive {
  update(part, [condition]) {
    // console.log('showIfDirective part:', part);
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
  if = (condition, element) => condition ? element : this.nothing;
  showIf = directive(showIfDirective);
  repeat = repeat;
  classMap = classMap;
  styleMap = styleMap;
  ref = ref;
  deepClone = (objectToClone) => JSON.parse(JSON.stringify(objectToClone))

  hide() {
    this.classList.add('no-display');
  }
  display() {
    this.classList.remove('no-display');
  }
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
  fire(name, data) {
    this.dispatchEvent(new CustomEvent(
      name,
      {bubbles: true, cancelable: true, composed: true, detail: {...data}}
    ))
  }
}

function css(...values) {
  const globalCSS = litCSS`
    * {
      box-sizing: border-box;
    }
    .height-100 {
      height: 100%;
    }
    .width-100 {
      width: 100%
    }
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
    .pad-4 {
      padding: 4px;
    }
    .pad-8 {
      padding: 8px;
    }
    .pad-vrt-4 {
      padding-top: 4px;
      padding-bottom: 4px;
    }
    .pad-vrt-8 {
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .pad-hrz-4 {
      padding-left: 4px;
      padding-right: 4px;
    }
    .pad-hrz-8 {
      padding-left: 8px;
      padding-right: 8px;
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
