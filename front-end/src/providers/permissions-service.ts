import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

/*
  Generated class for the PermissionsService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

declare var window: any;

@Injectable()
export class PermissionsService {

  constructor(public platform: Platform, public diagnostic: Diagnostic) {
    console.log('Hello PermissionsService Provider');
  }

    isAndroid() {
        return this.platform.is('android')
    }
 
    isiOS() {
        return this.platform.is('ios');
    }
 
    isUndefined(type) {
        return typeof type === "undefined";
    }
 
    pluginsAreAvailable() {
        return !this.isUndefined(window.plugins);
    }
 
 
    checkCameraPermissions(): Promise<boolean> {
        return new Promise(resolve => {
            // if (!this.pluginsAreAvailable()) {
            //     alert('Dev: Camera plugin unavailable.');
            //     resolve(false);
            // }
            if (this.isiOS()) {
                this.diagnostic.getCameraAuthorizationStatus().then(status => {
                    if (status == this.diagnostic.permissionStatus.GRANTED) {
                        resolve(true);
                    }
                    else if (status == this.diagnostic.permissionStatus.DENIED) {
                        resolve(false);
                    }
                    else if (status == this.diagnostic.permissionStatus.NOT_REQUESTED || status.toLowerCase() == 'not_determined') {
                        this.diagnostic.requestCameraAuthorization().then(authorisation => {
                            resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
                        });
                    }                    
                });
            }
            else if (this.isAndroid()) {
                this.diagnostic.isCameraAuthorized().then(authorised => {
                    if (authorised) {
                        resolve(true);
                    }
                    else {
                        this.diagnostic.requestCameraAuthorization().then(authorisation => {
                            resolve(authorisation == this.diagnostic.permissionStatus.GRANTED);
                        });
                    }
                });
            }
        });
    }

}
