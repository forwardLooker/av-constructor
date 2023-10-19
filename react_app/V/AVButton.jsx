import React from 'react';

import {AVElement} from './0-AVElement.js';

export class AVButton extends AVElement {
  styles = {
    standartButton: this.styled.button`
      display: inline-block;
      text-align: center;
      color: white;
      background-color: black;
      border-color: black;
      box-shadow: gray;
      transition: 80ms cubic-bezier(0.33, 1, 0.68, 1);
      transition-property: color,background-color,box-shadow,border-color;
      padding: 5px 16px;
      font-size: 14px;
      font-weight: var(--base-text-weight-medium, 500);
      line-height: 20px;
      white-space: nowrap;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      border: 1px solid;
      border-radius: 6px;
      appearance: none;
      
      &:hover {
        opacity: 0.90;
      }
    `
  }

  render() {
    return (
      <this.styles.standartButton {...this.props}>
        {this.props.children}
      </this.styles.standartButton>
    )
  }
}
