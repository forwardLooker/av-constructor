import {html, css, AVItem} from './0-av-item.js';

import {Host} from '../M/1-Host.js';

export class AVDomain extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `;
  }

  static properties = {
    domainsList: {},
  };

  constructor() {
    super();
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem')) {
      this.currentViewName = this.classItem.defaultViewName
    }
  }

  render() {
      return this.nothing;
  }


  async firstUpdated() {

  }

  updated(changedProps) {

  }
}

window.customElements.define('av-domain', AVDomain);
