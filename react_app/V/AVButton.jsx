import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVButton extends AVElement {
  static styles = {
    standartButton: this.styled.button`
      display: inline-block;
      text-align: center;
      color: white;
      background-color: #1b1c1f;
      padding: 5px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      border-radius: 8px;
      
      &:hover {
        opacity: 0.90;
      }
      &:disabled {
        opacity: 0.20;
      }
    `
  }

  render() {
    return (
      <AVButton.styles.standartButton {...this.props}>
        {this.props.children}
      </AVButton.styles.standartButton>
    )
  }
}
