import { AVElement } from "../V/0-AVElement.js";

import vkBridge from '@vkontakte/vk-bridge';

export class AVItem extends AVElement {
  static Host() {};
  get Host() { return AVItem.Host; }
  get db() { return this.Host.db; } // по идее нигде не используется, потому что всё через обёртки Айтемов
  get auth() { return this.Host.auth; } //  используется исключительно в AVAuth, ещё в хеддере Хоста signOut
  get user() {
    if (!this._userFromHost?.listenerHasSet) {
      let listenerId = this.Host.addEventListener('user-state-changed', () => {
        this._userFromHost.value = this.Host.user;
        console.log('user set on AVItem, user:', this._userFromHost.value);
        this.forceUpdate();
      })
      this._userFromHost = { value: this.Host.user, listenerHasSet: true, listenerId }
    }
    return this._userFromHost.value;
  }
  
  vkBridge = vkBridge;
  
  componentWillUnmount() {
    // super.componentWillUnmount();
    if (this._userFromHost?.listenerId) {
      this.Host.removeEventListener(this._userFromHost.listenerId);
      this._userFromHost = { value: null, listenerHasSet: false };
    }
  }

  showDialog(...params) {
    //TODO
    return this.Host.$hostElement.showDialog(...params);
  }
  
  showDialog2(...params) {
    //TODO
    return this.Host.$hostElement.showDialog2(...params);
  }
  
  showCustomPopup(...params) {
    return this.Host.$hostElement.showCustomPopup(...params);
  }
  
  closeCustomPopup(...params) {
    return this.Host.$hostElement.closeCustomPopup(...params);
  }

  showContextMenu(...params) {
    return this.Host.$hostElement.showContextMenu(...params)
  }
}
