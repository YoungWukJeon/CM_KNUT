import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, ModalController} from 'ionic-angular';

// pages
import { UserInfo } from '../user-info/user-info';

// providers
import { ServerRequester } from '../../providers/server-requester';
import { LocalStorage } from '../../providers/local-storage';

/**
 * Generated class for the ContentLike page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
 2017.05.17 made by Youngwuk Jeon

 <Update Log>
    [2017.06.26]
        1. 공감한 사람 정보 보기 추가

 */


@IonicPage()
@Component({
    selector: 'page-content-like',
    templateUrl: 'content-like.html',
})
export class ContentLike {

    private items: any[]; // 공감한 사람들 정보
    paramId: any;
    dbItem: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
                private modalCtrl: ModalController, private sevReq: ServerRequester, private localStorage: LocalStorage) {

        this.paramId = navParams.get('paramId');
        this.sevReq.getResult("contentlike", {ub_id: this.paramId}, this);

        this.items = [
            {
                user_no: '',
                username: '',
                profile: 'assets/image/bg_gray.png',
                type: ''
            }
        ];

    }

    callback(domainURL: string, link: string, data: any) {

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');
            this.viewCtrl.dismiss('not exists');
            return;
        }
        else {
            this.dbItem = data;
            console.log('********** contentlike server **********', this.dbItem);

            this.items = [];
            for (var i = 0; i < this.dbItem.length; i++) {

                this.items.push({
                    user_no: this.dbItem[i].user_no,
                    username: this.dbItem[i].username,
                    profile: domainURL + this.dbItem[i].profile + "?v=" + Date.now(),
                    type: this.dbItem[i].type
                });

                // 자체 회원가입이 아니면(댓글)
                if (this.items[i].type != 's' && !this.items[i].profile.includes('res/images/profile/') ) {
                    this.items[i].profile = this.items[i].profile.replace(domainURL, "");
                }

                if (this.dbItem[i].profile == "" || this.dbItem[i].profile == 'undefined') {
                    this.items[i].profile = "assets/image/profile_default.png";
                }
            }
        }

        

    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ContentLike');
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    userinfo(user_no: number) {
        this.localStorage.getData("user_no").then(value => {

            let userModal;

            if( value == null || value != user_no ) {
                userModal = this.modalCtrl.create(UserInfo, {user_no: user_no, myInfo: false});
            }
            else {
                userModal = this.modalCtrl.create(UserInfo, {user_no: user_no});
            }

            userModal.onDidDismiss(data => {
                console.log("data.....", data);
                if( data == 'unlink' ) {
                    this.dismiss();
                }
            });
           
            userModal.present();
        });
    }

}
