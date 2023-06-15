import {html, css, AVElement} from "../V/av-element.js";

class AVItem extends AVElement {
  // fromHost(propName) {
  //   return {
  //     _fieldFromHost: propName
  //   }
  // }
  // constructor() {
  //   super();
  //   const name = Object.keys(this).find((fieldName) => this[fieldName]?._fieldFromHost?.length > 0);
  //
  // }

  static Host() {};
  get Host() { return AVItem.Host; }
  get db() { return this.Host.db; }
  get auth() { return this.Host.auth; }
  get user() {
    if (!this._userFromHost?.listenerHasSet) {
      let listenerId = this.Host.listen('user-state-changed', () => {
        this._userFromHost.value = this.Host.user;
        this.requestUpdate();
      })
      this._userFromHost = { value: this.Host.user, listenerHasSet: true, listenerId }
    }
    return this._userFromHost.value;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._userFromHost?.listenerId) {
      this.Host.clearListener(this._userFromHost.listenerId);
      this._userFromHost = { value: null, listenerHasSet: false };
    }
  }
}

export {html, css, AVItem};
