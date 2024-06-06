import React from 'react';
import styled from 'styled-components';

import {UtilFunctions} from '../M/Fundamentals/10-UtilFunctions.js'

export class AVElement extends React.PureComponent {
  static styled = styled;
  styled = styled;
  static R = UtilFunctions.R;
  R = UtilFunctions.R;

  static noop = UtilFunctions.noop;
  noop = UtilFunctions.noop;
  deepClone = UtilFunctions.deepClone;
  deepCloneArrayWithInnerRef = UtilFunctions.deepCloneArrayWithInnerRef;
  isDeepEqual = UtilFunctions.isDeepEqual;
  findDeepObjInItemsBy = UtilFunctions.findDeepObjInItemsBy;
  findDeepContainerInItemsBy = UtilFunctions.findDeepContainerInItemsBy;;
  isEmpty = UtilFunctions.isEmpty;
  notEmpty = UtilFunctions.notEmpty;
  makeDebounced = UtilFunctions.makeDebounced;

  createArrFromObjFieldNamesContains = UtilFunctions.createArrFromObjFieldNamesContains;
}
