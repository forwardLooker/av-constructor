import {html, css, AVItem} from './0-av-item.js';

import {Host} from '../M/1-Host.js';

export class ItemPanel extends AVItem {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      #view-selector {
        cursor: pointer;
      }
      #view-selector-arrow {
        transform: rotate(90deg);
        margin-left: 2px
      }
      #selection-list {
        z-index: 1000;
        right: 0;
        bottom: 0;
        background: white;
      }
    `;
  }

  static properties = {
    item: {},
    currentViewName: {},
    availableViewsList: {},
    viewsDropdownOpened: {}
  };

  constructor() {
    super();
    this.viewsDropdownOpened = false;
    this.currentViewName = '';
    this.availableViewsList = [];
  }

  render() {
    return html`
        <div class="row justify-end pad-8 border">
          <div id="view-selector" class="row pos-rel" @click="${this.onViewSelectorClick}">
            <div>${this.currentViewName}</div>
            <div id="view-selector-arrow">${html`>`}</div>
            <div
              ${this.showIf(this.viewsDropdownOpened)}
              id="selection-list"
              class="col pos-abs border"
            >
              ${this.repeat(this.availableViewsList, v => v, v => html`
                <div @click="${(e) => this.selectView(v, e)}">${v}</div>
              `)}
            </div>  
          </div>
        </div>
    `
  }

  onViewSelectorClick() {
    this.viewsDropdownOpened = !this.viewsDropdownOpened;
  }
  selectView(view, e) {
    this.currentViewName = view;
    this.fire('item-view-changed', {newViewName: view, originalEvent: e})
  }


  update(changedProps) {
    if (changedProps.has('item')) {
      this.currentViewName = this.item.defaultViewName;
      this.availableViewsList = this.item.getViewsList()
    }
    super.update();
  }
}

window.customElements.define('item-panel', ItemPanel);
