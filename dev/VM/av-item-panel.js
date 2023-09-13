import {html, css, AVItem} from './0-av-item.js';

import {Host} from '../M/1-Host.js';

export class AvItemPanel extends AVItem {
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
    viewsDropdownOpened: {},
    onCreateFunc: {},
  };

  constructor() {
    super();
    this.viewsDropdownOpened = false;
    this.currentViewName = '';
    this.availableViewsList = [];
  }

  willUpdate(changedProps) {
    if (changedProps.has('item')) {
      this.currentViewName = this.item.defaultViewName;
      this.availableViewsList = this.item.getViewsList()
    }
  }

  render() {
    return html`
        <div class="row">
          ${this.currentViewName === 'Grid' ? this._renderGridButtons() : this.nothing}
          <div class="flex-1 row justify-end pad-8">
            <div id="view-selector" class="row pos-rel" @click="${this._onViewSelectorClick}">
              <div>${this.currentViewName}</div>
              <div id="view-selector-arrow">${html`>`}</div>
              <div
                ${this.showIf(this.viewsDropdownOpened)}
                id="selection-list"
                class="col pos-abs border"
              >
                ${this.repeat(this.availableViewsList, v => v, v => html`
                  <div @click="${(e) => this._selectView(v, e)}">${v}</div>
                `)}
              </div>  
            </div>
          </div>
        </div>
    `
  }

  _renderGridButtons() {
    return html`
      <div class="pad-8">
          <button @click="${this.onCreateFunc}">Создать</button>
      </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _onViewSelectorClick() {
    this.viewsDropdownOpened = !this.viewsDropdownOpened;
  }

  _selectView(view, e) {
    this.currentViewName = view;
    this.fire('item-view-changed', {newViewName: view, originalEvent: e})
  }
}

window.customElements.define('av-item-panel', AvItemPanel);
