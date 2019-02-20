import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

// providers
import {ServerRequester} from '../../providers/server-requester';

/**
 * Generated class for the Busboard page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-busboard',
    templateUrl: 'busboard.html',
})
export class Busboard {

    item_0: any[]; // 시외버스터미널 -> 교통대
    item_1: any[]; // 교통대 -> 시외버스터미널
    dbItem: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, private sevReq: ServerRequester) {

        this.item_0 = [];
        this.item_0.push({
            dep_time: '',
            arr_time: '',
        });

        this.item_1 = [];
        this.item_1.push({
            dep_time: '',
            arr_time: '',
        });

        this.sevReq.getResult("busboard", {}, this);

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad Busboard');
    }

    callback(domainURL: string, link: string, data: any) {

        this.dbItem = data;
        this.item_0 = [];
        this.item_1 = [];

        for (var i = 0; i < this.dbItem[0].length; i++) {
            if (this.dbItem[0][i].direction == '0') {
                this.item_0.push({
                    dep_time: this.dbItem[0][i].dep_time,
                    arr_time: this.dbItem[0][i].arr_time,
                });
            }
            else {
                this.item_1.push({
                    dep_time: this.dbItem[0][i].dep_time,
                    arr_time: this.dbItem[0][i].arr_time,
                });
            }
        }

    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
