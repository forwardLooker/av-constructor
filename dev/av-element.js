import {html, css as litCSS, LitElement} from "lit";
import {directive, Directive} from "lit/directive.js";


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

  showIf = directive(showIfDirective);

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
