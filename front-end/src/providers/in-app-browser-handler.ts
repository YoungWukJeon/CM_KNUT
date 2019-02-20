import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { InAppBrowser } from '@ionic-native/in-app-browser';

// providers
import { ServerRequester } from '../providers/server-requester';

/*
  Generated class for the InAppBrowserHandler provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

declare var window: any;

@Injectable()
export class InAppBrowserHandler {

  constructor(public http: Http, private sevReq: ServerRequester, private iab: InAppBrowser) {
    console.log('Hello InAppBrowserHandler Provider');
  }
 
  public tpLoginConnection(type: string): Promise<any> {

    var domainURL = this.sevReq.getDomainURL();

    // alert('type: ' + type);
    return new Promise(function(resolve, reject) {

      var browserRef = window.cordova.InAppBrowser.open(domainURL + "auth/login/" + type + "/callback", "_blank", "location=no,clearsessioncache=yes,clearcache=yes");

      browserRef.addEventListener("loadstop", (event) => {

        // alert(event.url);

        // 로그인 성공
        if( event.url == domainURL + "loginSuccess" ) {
          browserRef.executeScript({code: "document.body.innerHTML"}, (text) => {
            // alert(JSON.parse(text[0]).user_no);
            resolve(JSON.parse(text[0]).user_no);
            browserRef.close();
          });

          // browserRef.removeEventListener("exit", (event) => {});
          
        }
      });

      // browserRef.addEventListener("exit", (event) => {
      //   reject("Cancelled");
      // });
    });
  }

}
