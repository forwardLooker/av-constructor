import {Item} from './0-Item.js'

export class ObjectDocument extends Item {
  constructor(data) {
    super();
    this.data = data
  }
  itemType = 'objectDocument';
};
