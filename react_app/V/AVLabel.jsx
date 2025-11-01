import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVLabel extends AVElement {
  static defaultProps = {
    className: "", // используется для дополнительныз классов
    color: null,
    justifyMode: "center" // enum [start, center, end]
  }
  
  render() {
    return (
      <label className={`inline-block row
         justify-${this.props.justifyMode}
         align-center
         color-gaz-text-primary
         ${this.props.className}`}
        {...this.R.omit(['className', 'justifyMode'], this.props)}
        style={this.props.color ? ({ color: this.props.color }) : null}
      >
        {this.props.children}
      </label>
    )
  }
}
