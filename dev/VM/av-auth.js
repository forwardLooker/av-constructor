import {AVElement, css, html} from './0-av-element.js';

class AVAuth extends AVElement {
  static get styles() {
    return css`
      * {
        box-sizing: border-box;
      }
      :host {
        font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
        box-sizing: border-box;
        padding-right: 16px;
        padding-left: 16px;
        width: 340px;
        margin: 0 auto;
      }
      #auth-form-header {
        margin-bottom: 16px;
        color: black;
        text-align: center;
        text-shadow: none;
        background-color: transparent;
        border: 0;
      }
      #auth-form-body {
        border-radius: 6px;
        padding: 16px;
        font-size: 14px;
        background-color: white;
        border: 1px solid black;
      }
      #login_field {
        margin-top: 4px;
        margin-bottom: 16px;
        display: block;
        width: 100%;
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        color: black;
        vertical-align: middle;
        background-color: white;
        background-repeat: no-repeat;
        background-position: right 8px center;
        border: 1px solid black;
        border-radius: 6px;
        box-shadow: gray;
        transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
        transition-property: color,background-color,box-shadow,border-color;
        overflow: visible;
      }
      .position-relative {
        position: relative;
      }
      #password {
        margin-top: 4px;
        margin-bottom: 16px;
        display: block;
        width: 100%;
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        vertical-align: middle;
        background-repeat: no-repeat;
        background-position: right 8px center;
        border: 1px solid black;
        border-radius: 6px;
        transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
        transition-property: color,background-color,box-shadow,border-color;
      }
      #sign-in-button {
        margin-top: 16px;
        display: block;
        width: 100%;
        text-align: center;
        color: white;
        background-color: black;
        border-color: black;
        box-shadow: gray;
        transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
        transition-property: color,background-color,box-shadow,border-color;
        position: relative;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: var(--base-text-weight-medium, 500);
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid;
        border-radius: 6px;
        appearance: none;
      }
      .label-link {
        position: absolute;
        right: 0;
        top: 0;
      }
      .login-callout {
        padding: 16px 16px;
        text-align: center;
        border: 1px solid black;
        border-radius: 6px;
        margin-top: 16px;
        margin-bottom: 10px;
      }
    `
  }

  static properties = {
    mode: {type: String, enum: ['sign in', 'sign up']},
    email: {},
    password: {}
  };
  constructor() {
    super();
    this.mode = 'sign in';
    this.email = '';
    this.password = '';
  }
//TODO убрать лишние аттрибуты и классы
  render() {
    return html`
      <div class="auth-form px-3" id="login">


        <input type="hidden" name="ga_id" class="js-octo-ga-id-input">
        <div id="auth-form-header">
          <h1>${this.mode === 'sign in' ? html`Вход на Хост` : html`Создание аккаунта`}</h1>
        </div>
                 
        <div id="auth-form-body">

          <!-- '"\` --><!-- </textarea></xmp> -->
          <form data-turbo="false" action="/session" accept-charset="UTF-8" method="post"><input type="hidden"
                                                                                                 data-csrf="true"
                                                                                                 name="authenticity_token"
                                                                                                 value="u3ygHAuIWywYasB2fEy/XQr3ESM3Ds6TY24muWDbTLdKkTdLMKAFgHzGNQkBcpdY+z87t/muUAZ+xuR6UoglrQ==">
            <label for="login_field">
              Email address
            </label>
            <input type="text" name="login" id="login_field" class="form-control input-block js-login-field"
                   .value="${this.email}" @change="${e => {this.email = e.target.value}}"
                   autocapitalize="off" autocorrect="off" autocomplete="username" autofocus="autofocus">

            <div class="position-relative">
              <label for="password">
                Password
              </label>
              <input type="password" name="password" id="password" .value="${this.password}" @change="${e => {this.password = e.target.value}}"
                     class="form-control form-control input-block js-password-field" autocomplete="current-password">
              

              <input type="submit" name="commit" value="${this.mode === 'sign in'? 'Войти' : 'Создать аккаунт'}" id="sign-in-button"
                     data-disable-with="Signing in…" data-signin-label="Sign in"
                     @click="${this.signInSignUp}"
                     data-sso-label="Sign in with your identity provider" development="false">

              <a .hidden="${this.mode === 'sign up'}" class="label-link" tabindex="0" href="/password_reset">Forgot
                password?</a>
            </div>
          </form>
          
        </div>


        <p class="login-callout mt-3">
          ${this.mode === 'sign in' ? html`Нет аккаунта?` : html`Есть аккаунт?`}
          <a data-ga-click="Sign in, switch to sign up"
             data-hydro-click="{&quot;event_type&quot;:&quot;authentication.click&quot;,&quot;payload&quot;:{&quot;location_in_page&quot;:&quot;sign in switch to sign up&quot;,&quot;repository_id&quot;:null,&quot;auth_type&quot;:&quot;SIGN_UP&quot;,&quot;originating_url&quot;:&quot;https://github.com/login&quot;,&quot;user_id&quot;:null}}"
             data-hydro-click-hmac="72d062e79bb6ab076a3b88b32943286ea51894183bd812a5038d00013946f239"
             @click="${this.switchMode}"
             href="/signup?source=login">${this.mode === 'sign in' ? html`Создать акканут` : html`Войти в аккаунт`}</a>.
        </p>

      </div>    `;
  }

  switchMode(e) {
    e.preventDefault();
    this.mode = this.mode === 'sign up' ? 'sign in' : 'sign up';
  }
  signInSignUp(e) {
    e.preventDefault();
    console.log('signInSignUp event:', e);
    console.log('this.closest:', this.closest('body'));
    if (this.mode === 'sign up') {
      this.auth.createUserWithEmailAndPassword(this.email, this.password)
          .then((userCredential) => {
            console.log('onSignUpSuccess:', userCredential);
          })
          .catch((error) => {
            console.log('onCreateError:', error);
          });
    } else {
      this.auth.signInWithEmailAndPassword(this.email, this.password)
          .then((userCredential) => {
            console.log('onSignIpSuccess:', userCredential);
          })
          .catch((error) => {
            console.log('onLoginError:', error);
          });
    }
  }

  // firstUpdated() {
  //
  // }
}
customElements.define('av-auth', AVAuth);
