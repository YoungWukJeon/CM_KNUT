import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

/*
  Generated class for the LocalStorage provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

/*
2017.05.30 made by Youngwuk Jeon

  <Update Log>
    
*/


@Injectable()
export class LocalStorage {

  constructor(public http: Http, private storage: Storage) {
    console.log('Hello LocalStorage Provider');
  }

  setData(key: string, value: any) {
    this.storage.set(key, value);
    console.log(key + " in storage: ", value);
  }

  getData(key: string) {
    return this.storage.get(key);
  }

  removeData(key: string) {
    this.storage.remove(key).then(() => {
      console.log(key + " is removed");
    });
  }

  clearStorage() {
    this.storage.clear().then(() => {
      console.log("all keys are cleared");
    });
  }

}
