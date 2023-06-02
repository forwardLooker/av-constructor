import {LitElement, html, css} from 'lit';

import './av-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCygBNBbRUdhXGIwsOnZiDKAGZx4PIDc6I",
  authDomain: "arta-vision-constructor.firebaseapp.com",
  projectId: "arta-vision-constructor",
  storageBucket: "arta-vision-constructor.appspot.com",
  messagingSenderId: "80353020616",
  appId: "1:80353020616:web:27f6d324e8f2624bf433fd",
  measurementId: "G-ZRVD2Z59JF"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

export class AVHost extends LitElement {
    static get styles() {
        return css`
            :host {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            header {
                font-size: 40px;
                top: 0;
                height: 60px;
                z-index: 4;
                background: #fff;
                display: flex;
                padding: 0 1.5em;
                justify-content: stretch;
                box-sizing: border-box;
                box-shadow: 0 5px 10px 0 rgb(0 0 0 / 20%);
            }
            main {
                flex: 1;
                padding: 16px;
                display: flex;
                border: 0.5px solid black;
            }
        `;
      }

      static properties = {
        domainsList: {},
        authorized: {},
        pad: {attribute: true}
      };

      constructor() {
        super();
        this.authorized = false;
      }

    render() {
        return html`
          <header>Хост тест</header>
          <main>
              ${
                this.authorized ?  this.renderDomainsList() : html`<av-auth .auth=${auth}></av-auth>`
              }
          </main>
        `
    }

    renderDomainsList() {
      return html`
        <article>
          <p>
            Manage complexity by building large, complex components
            out of smaller, simpler components that do one thing well.
          </p>
        </article>
      `
    }

   async connectedCallback() {
        super.connectedCallback()
        const domainsCol = db.collection('Domains');
        const domainsSnapshot = await domainsCol.get();
        const domainsList = domainsSnapshot.docs.map(doc => doc.data().name);
        this.domainsList = domainsList;
        // this.domainsList = ['system', 'workspace']
    }
}
window.customElements.define('av-host', AVHost);
