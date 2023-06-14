import {AVElement, html, css} from './av-element.js';

import './av-auth.js';

import {Host} from'./Host.js';

const firebaseConfig = {
  apiKey: "AIzaSyCygBNBbRUdhXGIwsOnZiDKAGZx4PIDc6I",
  authDomain: "arta-vision-constructor.firebaseapp.com",
  projectId: "arta-vision-constructor",
  storageBucket: "arta-vision-constructor.appspot.com",
  messagingSenderId: "80353020616",
  appId: "1:80353020616:web:27f6d324e8f2624bf433fd",
  measurementId: "G-ZRVD2Z59JF"
};

const host = new Host();
host.firebase = firebase.initializeApp(firebaseConfig);
host.firebaseConfig = firebaseConfig
host.db = host.firebase.firestore();
host.auth = host.firebase.auth();
AVElement.Host = host;

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
      };

      // config = this.fromHost('config')

      constructor() {
          super();
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
      const domainsCol = this.db.collection('Domains');
      const domainsSnapshot = await domainsCol.get();
      const domainsList = domainsSnapshot.docs.map(doc => doc.data());
      this.domainsList = domainsList;
      // this.domainsList = ['system', 'workspace']
    }
}
window.customElements.define('av-host', AVHost);
