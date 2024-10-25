import {UtilFunctions} from './Fundamentals/10-UtilFunctions.js';

export class Item {
  get user() {
    return Item.user;
  }

  _listenersIdIncrementator;
  _listeners;
  addEventListener(eventName, callback) {
    if (this._listenersIdIncrementator === undefined) {
      this._listenersIdIncrementator = 1;
    }
    const listenerId = this._listenersIdIncrementator++;
    if (!this._listeners) {
      this._listeners = {};
    }
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = {};
    }
    this._listeners[eventName][listenerId] = callback;
    return listenerId;
  }
  removeEventListener(listenerId) {
    if (this._listeners) {
      Object.keys(this._listeners).forEach((name) => {
        delete this._listeners[name][listenerId];
      })
    }
  }
  fire(eventName, data) {
    if (this._listeners[eventName]) {
      Object.keys(this._listeners[eventName])
        .forEach(listenerId => this._listeners[eventName][listenerId](data))
    }
  }

  static R = UtilFunctions.R;
  R = UtilFunctions.R;

  deepClone = UtilFunctions.deepClone;
  findDeepObjInItemsBy = UtilFunctions.findDeepObjInItemsBy;
  findDeepContainerInItemsBy = UtilFunctions.findDeepContainerInItemsBy;
  notEmpty = UtilFunctions.notEmpty;

};
