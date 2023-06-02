import {LitElement, html, css} from 'lit';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCygBNBbRUdhXGIwsOnZiDKAGZx4PIDc6I",
  authDomain: "arta-vision-constructor.firebaseapp.com",
  projectId: "arta-vision-constructor",
  storageBucket: "arta-vision-constructor.appspot.com",
  messagingSenderId: "80353020616",
  appId: "1:80353020616:web:27f6d324e8f2624bf433fd",
  measurementId: "G-ZRVD2Z59JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export class AVHost extends LitElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
                width: 100%;
            }
            header {
                top: 0;
                height: 60px;
                z-index: 4;
                background: #fff;
                display: flex;
                padding: 0 1.5em;
                justify-content: stretch;
                border-bottom: 1px solid #d1d1d1;
                box-sizing: border-box;
                box-shadow: 0 1px 5px 0 rgb(0 0 0 / 10%);
            }
            main {
                flex: 1;
                padding: 16px;
                display: flex;
                border: 2px solid black;
            }
        `;
      }
    
    render() {
        return html`
            <header>Хост</header>
            <main>Здесь должен быть список доменов</main>
        `
    }
}
window.customElements.define('av-host', AVHost);
