export class UtilFunctions {
  static noop = () => {};

  static deepClone = (objectToClone) => JSON.parse(JSON.stringify(objectToClone));
  static deepCloneArrayWithInnerRef(arrayToClone) {
    if (!arrayToClone) return;
    return arrayToClone.map(obj => {
      return {...obj, items: this.deepCloneArrayWithInnerRef(obj.items), _originalItemRef: obj}
    })
  }

  static isDeepEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

  static findDeepObjInItemsBy(queryObj, dataObjWithItems) {
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

  static isEmpty(val) {
    return !val || (Array.isArray(val) && val.length === 0)
  }
  static notEmpty(val) { // TODO как-то хуёво работает
    return Array.isArray(val) && val.length > 0;
  }

  static makeDebounced = (func, ms) => {
    let timeout;
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {func.apply(this, arguments)}, ms);
    };
  }

}