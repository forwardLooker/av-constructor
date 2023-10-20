import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVTextHeader extends AVElement {
  static defaultProps = {
    size: 'medium' // enum: ['big', 'medium', 'small']
  }

  render() {
    return (
      <div className={`inline-block font-size-20px font-bold ${this.props.className}`}>
        {this.props.children}
      </div>
    )
  }
}
