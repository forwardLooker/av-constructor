import {AVElement, html, css} from './0-av-element.js';

import './av-auth.js';

import {Host} from'../M/1-Host.js';

export class AVHost extends AVElement {
  static get styles() {
    return css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      #header {
        padding: 0 1.5em;
        box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
      }
      #sidebar {
        width: 25%;
      }
    `;
  }

      static properties = {
        domainsList: {},
        docList: {}
      };

      // config = this.fromHost('config')

      constructor() {
        super();
        const host = new Host();
        AVElement.Host = host;
        this.domainsList = [];
      }

    render() {
      return html`
        <div id="header" class="row space-between">
          <h3>Хост тест</h3>
          <div ${this.showIf(this.user)} class="col align-center justify-center">
              <div>${this.user?.email}</div>
              <button @click="${() => this.auth.signOut()}">Выйти</button>
          </div>
        </div>
        <main class="flex-1 row pad-8 border">
          ${
            this.user ?  this.renderDomainsList() : html`<av-auth></av-auth>`
          }
        </main>
      `
    }

    renderDomainsList() {
      return html`
        <div class="flex-1 row">
          <div id="sidebar" class="col pad-8 border">
              ${this.repeat(this.domainsList, (d) => d.id, (d) => html`
                  <div>${d.name}</div>
              `)}
          </div>
          <div id="content" class="flex-1 margin-left-8 pad-8 border">
              Manage complexity by building large, complex components
              out of smaller, simpler components that do one thing well.
          </div>
        </div>
      `
    }

    async firstUpdated() {
      const domainsList = await this.Host.getConfig();
      this.domainsList = domainsList.map(doc => doc.data());
      this.docList = domainsList;
    }
}
window.customElements.define('av-host', AVHost);
