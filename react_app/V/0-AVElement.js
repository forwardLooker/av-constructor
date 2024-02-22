import React from 'react';
import styled from 'styled-components';

import {UtilFunctions} from '../M/Fundamentals/10-UtilFunctions.js'

export class AVElement extends React.PureComponent {
  static styled = styled;
  styled = styled;

  static noop = UtilFunctions.noop;
  noop = UtilFunctions.noop;
  deepClone = UtilFunctions.deepClone
  isDeepEqual = UtilFunctions.isDeepEqual;
  findDeepObjInItemsBy = UtilFunctions.findDeepObjInItemsBy;
  isEmpty = UtilFunctions.isEmpty;
  notEmpty = UtilFunctions.notEmpty;
}
