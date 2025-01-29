import {AVElement, html, css} from './av-element.js';

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
        user: {},
      };

      constructor() {
          super();
          this.authorized = false;
      }

    render() {
      return html`
        <div id="header" class="row space-between">
          <h3>Хост тест</h3>
            <div class="col align-center justify-center">
              <div>${this.user.email}</div>
              <button @click="${this.signOut}">Выйти</button>
            </div>
        </div>
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
    
    signOut() {
    
    }

   async connectedCallback() {
        super.connectedCallback();
        auth.onAuthStateChanged((user) => {
           if (user) {
               // User is signed in, see docs for a list of available properties
               // https://firebase.google.com/docs/reference/js/v8/firebase.User
               var uid = user.uid;
               this.authorized = true;
               this.user = user;
           } else {
               // User is signed out
               // ...
           }
        });
        const domainsCol = db.collection('Domains');
        const domainsSnapshot = await domainsCol.get();
        const domainsList = domainsSnapshot.docs.map(doc => doc.data().name);
        this.domainsList = domainsList;
        // this.domainsList = ['system', 'workspace']
    }
}
window.customElements.define('av-host', AVHost);
