import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVLabel extends AVElement {
  static defaultProps = {
    className: "", // используется для дополнительныз классов
    justifyMode: "center" // enum [start, center, end]
  }
  
  render() {
    return (
      <label className={`inline-block row justify-${this.props.justifyMode} align-center ${this.props.className}`} {...this.R.omit(['className'], this.props)}>
        {this.props.children}
      </label>
    )
  }
}
