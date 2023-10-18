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

  findDeepObjInItemsBy = (queryObj, dataObjWithItems) => {
    const keys = Object.keys(queryObj);
    let resultObj;
    if (this.notEmpty(dataObjWithItems.items)) {
      resultObj = dataObjWithItems.items.find(i => {
        return keys.every(key => i[key] === queryObj[key])
      })
    }
    if (!resultObj && this.notEmpty(dataObjWithItems.items)) {
      dataObjWithItems.items.forEach(i => {
        if (!resultObj) {
          resultObj = this.findDeepObjInItemsBy(queryObj, i);
        }
      })
    }
    return resultObj;
  };

  notEmpty(val) {
    return Array.isArray(val) && val.length > 0;
  }

};
