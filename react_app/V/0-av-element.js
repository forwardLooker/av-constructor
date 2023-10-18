import React from 'react';
import styled from 'styled-components';

export class AVElement extends React.PureComponent {
  static styled = styled;
  static noop = () => {};
  noop = () => {};
  if = (condition, element) => condition ? element : '';
  deepClone = (objectToClone) => JSON.parse(JSON.stringify(objectToClone))
  isDeepEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

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

  hide() {
    this.classList.add('no-display');
  }
  display() {
    this.classList.remove('no-display');
  }
  isEmpty(val) {
    return !val || (Array.isArray(val) && val.length === 0)
  }
  notEmpty(val) {
    return Array.isArray(val) && val.length > 0;
  }
  // $(selector) {
  //   return this.shadowRoot.querySelector(selector);
  // }
  // $All(selector) {
  //   return this.shadowRoot.querySelectorAll(selector);
  // }
  fire(name, data) {
    this.dispatchEvent(new CustomEvent(
      name,
      {bubbles: true, cancelable: true, composed: true, detail: {...data}}
    ))
  }
}
