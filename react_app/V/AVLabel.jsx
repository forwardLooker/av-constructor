import React from 'react';

import {AVElement} from './0-av-element.js';

export class AVLabel extends AVElement {
  render() {
    return (
      <label className="inline-block pad-0-4" {...this.props}>
        {this.props.children}
      </label>
    )
  }
}
