import React from 'react';

import { AVItem } from './0-AVItem.js';

import { JSONTree } from 'react-json-tree';

export class AVDomain extends AVItem {
  static defaultProps = {
    domainItem: null,
    selectedConfigItem: null,
  }

  render() {
    return (
      <JSONTree data={this.props.selectedConfigItem} />
    )
  }

}
