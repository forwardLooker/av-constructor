import {Item} from './Item.js'

export class Host extends Item {
  firebase;
  firebaseConfig;
  db;
  get user() {return this._user};
  set user(user) {
    this._user = user;
    this.fire('user-changed', user);
  }
  get auth() {return this._auth};
  set auth(auth) {
    this._auth = auth;
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = null;
      }
    });
  };
  // async getConfig() {
  //   return await ['domain'];
  // }
};
