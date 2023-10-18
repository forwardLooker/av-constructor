import React from 'react';

import {AVItem, css, html} from '../0-av-item.js';

import './AVAuth.css';

export class AVAuth extends AVItem {
  state = {
    mode: 'sign in',  // {type: String, enum: ['sign in', 'sign up']},
    email: '',
    password: ''
  }

  render() {
    return (
      <div className="av-auth-root auth-form px-3" id="login">


        <input type="hidden" name="ga_id" className="js-octo-ga-id-input"></input>
          <div id="auth-form-header">
            <h1>{this.state.mode === 'sign in' ? 'Вход на Хост' : 'Создание аккаунта'}</h1>
          </div>

          <div id="auth-form-body">
            <form data-turbo="false" action="/session" acceptCharset="UTF-8" method="post">
              <input type="hidden"
               data-csrf="true"
               name="authenticity_token"
               value="u3ygHAuIWywYasB2fEy/XQr3ESM3Ds6TY24muWDbTLdKkTdLMKAFgHzGNQkBcpdY+z87t/muUAZ+xuR6UoglrQ==">
              </input>
              <label htmlFor="login_field">
                Email address
              </label>
              <input type="text" name="login" id="login_field" className="form-control input-block js-login-field"
              value={this.state.email} onChange={e => {this.setState({email: e.target.value})}}
                     autoCapitalize="off" autoCorrect="off" autoComplete="username" autoFocus="autofocus"></input>

              <div className="position-relative">
                <label htmlFor="password">
                  Password
                </label>
                <input type="password" name="password" id="password" value={this.state.password} onChange={e => {this.setState({password: e.target.value})}}
                       className="form-control form-control input-block js-password-field" autoComplete="current-password"></input>


                <input type="submit" name="commit" value={this.state.mode === 'sign in'? 'Войти' : 'Создать аккаунт'} id="sign-in-button"
                       data-disable-with="Signing in…" data-signin-label="Sign in"
                onClick={this._signInSignUp}
                       data-sso-label="Sign in with your identity provider" development="false"></input>

                <a hidden={this.mode === 'sign up'} className="label-link" tabIndex="0" href="/password_reset">Forgot
                password?</a>
              </div>
            </form>
          </div>
          <p className="login-callout mt-3">
            {this.state.mode === 'sign in' ? 'Нет аккаунта? ' : 'Есть аккаунт? '}
            <a data-ga-click="Sign in, switch to sign up"
               data-hydro-click="{&quot;event_type&quot;:&quot;authentication.click&quot;,&quot;payload&quot;:{&quot;location_in_page&quot;:&quot;sign in switch to sign up&quot;,&quot;repository_id&quot;:null,&quot;auth_type&quot;:&quot;SIGN_UP&quot;,&quot;originating_url&quot;:&quot;https://github.com/login&quot;,&quot;user_id&quot;:null}}"
               data-hydro-click-hmac="72d062e79bb6ab076a3b88b32943286ea51894183bd812a5038d00013946f239"
            onClick={this._switchMode}
            href="/signup?source=login">{this.state.mode === 'sign in' ? 'Создать акканут' : 'Войти в аккаунт'}</a>.
          </p>
      </div>
    )
  }

  _switchMode = e => {
    e.preventDefault();
    this.setState(state => ({mode: state.mode === 'sign up' ? 'sign in' : 'sign up'}))
  }

  _signInSignUp = e => {
    e.preventDefault();
    console.log('signInSignUp event:', e);
    if (this.state.mode === 'sign up') {
      this.auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((userCredential) => {
          console.log('onSignUpSuccess:', userCredential);
        })
        .catch((error) => {
          console.log('onCreateError:', error);
        });
    } else {
      this.auth.signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((userCredential) => {
          console.log('onSignIpSuccess:', userCredential);
        })
        .catch((error) => {
          console.log('onLoginError:', error);
        });
    }
  }
}
