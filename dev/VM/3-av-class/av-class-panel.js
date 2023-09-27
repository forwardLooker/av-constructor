import {html, css, AVItem} from '../0-av-item.js';

import '../../V/av-button.js';

export class AvClassPanel extends AVItem {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        border-bottom: 2px solid black;
      }
      #view-selector {
        cursor: pointer;
        align-items: center;
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
    classItem: {},
    currentViewName: {},
    availableViewsList: {},
    viewsDropdownOpened: {},
    onCreateFunc: {},
    onClassViewChangedFunc: {}
  };

  constructor() {
    super();
    this.viewsDropdownOpened = false;
    this.currentViewName = '';
    this.availableViewsList = [];
  }

  willUpdate(changedProps) {
    if (changedProps.has('classItem')) {
      this.currentViewName = this.classItem.defaultViewName;
      this.availableViewsList = this.classItem.getViewsList()
    }
  }

  render() {
    return html`
        <div class="row">
          ${this.currentViewName === 'Grid' ? this._renderGridButtons() : this.nothing}
          <div class="flex-1 row justify-end pad-8">
            <div id="view-selector" class="view-selector row pos-rel" @click="${this._onViewSelectorClick}">
              <div>${this.currentViewName}</div>
              <div id="view-selector-arrow">${html`>`}</div>
              <div
                ${this.showIf(this.viewsDropdownOpened)}
                id="selection-list"
                class="col pos-abs border"
              >
                ${this.repeat(this.availableViewsList, v => v, viewName => html`
                  <div class="selection-item" @click="${(e) => this._selectView(viewName)}">${viewName}</div>
                `)}
              </div>  
            </div>
          </div>
        </div>
    `
  }

  _renderGridButtons() {
    return html`
      <div class="pad-vrt-8">
        <av-button @click="${this.onCreateFunc}">Создать</av-button>
      </div>
    `
  }

  async firstUpdated() {

  }

  async updated(changedProps) {

  }

  _windowClickHandler = (e) => {
    this.viewsDropdownOpened = false;
    window.removeEventListener('click', this._windowClickHandler);
  }

  _onViewSelectorClick() {
    if (!this.viewsDropdownOpened) {
      this.viewsDropdownOpened = true;
      setTimeout(() => {
        window.addEventListener('click', this._windowClickHandler);
      }, 4)
    } else {
      this.viewsDropdownOpened = false;
      window.removeEventListener('click', this._windowClickHandler);
    }
  }

  _selectView(view) {
    this.currentViewName = view;
    this.onClassViewChangedFunc(view);
  }
}

window.customElements.define('av-class-panel', AvClassPanel);
