import {Item} from './0-Item.js'

export class ViewItem extends Item {
  constructor() {
    super();
  }

  types = [
    'field',
    'horizontal-layout',
    'vertical-layout',
  ]
};
