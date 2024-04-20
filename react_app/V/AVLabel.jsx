import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVLabel extends AVElement {
  render() {
    return (
      <label className="inline-block pad-0-4-0-0" {...this.props}>
        {this.props.children}
      </label>
    )
  }
}
