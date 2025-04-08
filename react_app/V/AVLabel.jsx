import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVLabel extends AVElement {
  static defaultProps = {
    className: "" // используется для дополнительныз классов
  }
  
  render() {
    return (
      <label className={`inline-block row justify-center align-center ${this.props.className}`} {...this.R.omit(['className'], this.props)}>
        {this.props.children}
      </label>
    )
  }
}
