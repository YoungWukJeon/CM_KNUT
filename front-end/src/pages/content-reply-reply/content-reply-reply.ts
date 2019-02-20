import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, ModalController} from 'ionic-angular';


// pages
import { UserInfo } from '../user-info/user-info';
import {ContentReplyUpdate} from '../content-reply-update/content-reply-update';

// providers
import {ServerRequester} from '../../providers/server-requester';
import {LocalStorage} from '../../providers/local-storage';

/**
 * Generated class for the ContentReplyReply page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


/*
 2017.05.17 made by Youngwuk Jeon

 <Update Log>


 */


@IonicPage()
@Component({
    selector: 'page-content-reply-reply',
    templateUrl: 'content-reply-reply.html',
})
export class ContentReplyReply {

    private items: any[]; // 답글 목록을 저장하는 배열

    private replyContent: string = "";  // 답글의 입력 내용

    private user_no = null;  // 테스트용 로그인 유저 아이디

    paramId: any;
    paramItem: any;
    dbItem: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController,
                private sevReq: ServerRequester, private localStorage: LocalStorage) {

        this.paramId = navParams.get('paramId');
        this.paramItem = navParams.get('item');

        console.log("c_id", this.paramItem.id);

        this.localStorage.getData("user_no").then(value => {

            // 로그인이 되어있으면
            if (value != null) {
                console.log("user_no: " + value);
                this.user_no = value;
                this.sevReq.getResult("contentreplyreply", {user_no: value, ub_id: this.paramId, grp_no: this.paramItem.grp_no, c_id: this.paramItem.id}, this);
            }
            else {
                this.sevReq.getResult("contentreplyreply", {ub_id: this.paramId, grp_no: this.paramItem.grp_no, c_id: this.paramItem.id}, this);
            }

        }).catch((error) => {
            console.log(error);
        });

        this.items = [
            {
                id: '',
                user_no: '',
                username: '',
                profile: 'assets/image/bg_gray.png',
                type: '',
                time: 0,
                content: '',
                yours: true,
                totalLikeCount: ''
            },
            // {
            //     id: '1',
            //     user_no: 1,
            //     username: 'Sejeong Kim',
            //     profile: 'assets/image/testImg6.jpg',
            //     type: '',
            //     time: 1494994080757,
            //     content: '비올때 미끄러워요..ㅠ',
            //     yours: true,
            //     totalLikeCount: 2
            // },
            // {
            //     id: '2',
            //     user_no: 2,
            //     username: 'Yeseul Han',
            //     profile: 'assets/image/testImg2.jpg',
            //     type: '',
            //     time: 1495001280757,
            //     content: '아까 여기 지나가는데 위험해 보이더라구요. 조심들 하세요~ :)',
            //     yours: false,
            //     totalLikeCount: 1
            // },
        ];

    }

    callback(domainURL: string, link: string, data: any) {

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');
            this.viewCtrl.dismiss('not exists');
            return;
        }

        if( data.result == 'not exists2' ) {
            alert('해당 댓글이 존재하지 않거나 삭제되었습니다.');
            this.viewCtrl.dismiss('not exists2');
            return;
        }

        if (link == "contentreplyreply") {
            this.dbItem = data;
            console.log('********** contentreplyreply server **********', this.dbItem);

            this.items = [];
            for (var i = 0; i < this.dbItem.length; i++) {

                this.items.push({
                    id: this.dbItem[i].id,
                    user_no: this.dbItem[i].user_no,
                    username: this.dbItem[i].username,
                    profile: domainURL + this.dbItem[i].profile + "?v=" + Date.now(),
                    type: this.dbItem[i].type,
                    time: this.dbItem[i].date,
                    content: this.dbItem[i].content,
                    yours: this.dbItem[i].yours,
                    totalLikeCount: this.dbItem[i].totalLikeCount
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
        else if (link == "commentlike") {
            console.log('commentlike 반영됨.');
        }
        else if (link == "commentupdatedelete") {
            console.log('commentupdatedelete 반영됨.');
        }


    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ContentReplyReply');
        // console.log('' + Date.now());
    }

    getTimeText(time: number): string {

        var text = "";
        var diff = Date.now() - time; // 현재 시간과의 차이를 계산

        if (diff < 60000) {  // 1분 미만의 경우
            text = "방금";
        }
        else if (diff < 3600000) {   // 1시간 미만의 경우
            text = Math.floor(diff / 60000) + "분 전";
        }
        else if (diff < 86400000) {  // 24시간 미만의 경우
            text = Math.floor(diff / 3600000) + "시간 전";
        }
        else if (new Date(Date.now()).getFullYear() == new Date(time).getFullYear()) { // 작년의 경우
            var date = new Date(time);

            text = (date.getMonth() + 1) + "월 " + date.getDate() + "일 ";
            text += (date.getHours() >= 12) ? ((date.getHours() != 12) ? "오후 " + (date.getHours() - 12) + ":" : "오후 12:") : "오전 " + date.getHours() + ":";

            text += (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
        }
        else {
            var date = new Date(time);

            text = date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 ";
            text += (date.getHours() >= 12) ? ((date.getHours() != 12) ? "오후 " + (date.getHours() - 12) + ":" : "오후 12:") : "오전 " + date.getHours() + ":";
            text += (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();
        }

        return text;
    }

    like(item) {

        // item.yours = !item.yours;
        //
        // if (item.yours)
        //     item.totalLikeCount++;
        // else
        //     item.totalLikeCount--;

        if (this.user_no == null) {
            alert('로그인이 필요한 서비스 입니다.');
        }
        else {
            item.yours = !item.yours;

            if (item.yours) {
                item.totalLikeCount++;
                this.sevReq.getResult("commentlike", {c_id: item.id, user_no: this.user_no, ub_id: this.paramId, type: 'insert'}, this);
            }
            else {
                item.totalLikeCount--;
                this.sevReq.getResult("commentlike", {c_id: item.id, user_no: this.user_no, ub_id: this.paramId, type: 'delete'}, this);
            }
        }
        /******************************************************
         *                                                     *
         *          서버의 내용을 변경하는 로직이 필요            *
         *                                                     *
         ******************************************************/
    }

    // 로그인한 유저가 작성한 답글을 수정
    update(item) {

        // let updateModal = this.modalCtrl.create(ContentReplyUpdate, {id: '1', content: item.content});
        let updateModal = this.modalCtrl.create(ContentReplyUpdate, {content: item.content});

        updateModal.onDidDismiss(data => {

            // console.log("dismiss data", data);
            // if( data == 'not exists' ) {

            //     this.viewCtrl.dismiss();
            //     console.log("pageCount", this.navCtrl.length());

            //     if( this.navCtrl.length() > 1 ) {
            //         this.navCtrl.pop();
            //     }
            //     return;
            // }

            // console.log("dismiss data", data);
            // if( data == 'not exists2' ) {
            //     this.viewCtrl.dismiss('not exists2');
            //     return;
            // }

            // 성공적으로 수정을 완료한 경우
            if (data.result == 'success') {
                console.log('data');
                item.content = data.content;
                this.sevReq.getResult("commentupdatedelete", {c_id: item.id, content: item.content, ub_id: this.paramId, type: 'update'}, this);
            }
            else {
                console.log('cancel')
            }

        });
        updateModal.present();


        /******************************************************
         *                                                     *
         *                  페이지 리로드                       *
         *                                                     *
         ******************************************************/
    }

    // 로그인한 유저가 작성한 답글을 삭제
    delete(item) {

        this.items.splice(this.items.indexOf(item), 1);

        this.sevReq.getResult("commentupdatedelete", {c_id: item.id, type: 'deletereply', ub_id: this.paramId}, this);

        /******************************************************
         *                                                     *
         *          서버의 내용을 변경하는 로직이 필요            *
         *                                                     *
         ******************************************************/

        /******************************************************
         *                                                     *
         *                  페이지 리로드                       *
         *                                                     *
         ******************************************************/
    }

    // 답글을 등록하는 버튼 이벤트
    post() {

        if (this.user_no == null) {
            alert('로그인이 필요한 서비스 입니다.');
            this.replyContent = "";
        }
        else {
            console.log(this.replyContent);
            if (this.replyContent == '')
                alert('내용을 입력 해주세요.');
            else {

                this.sevReq.getResult("contentreplyreply", {
                    user_no: this.user_no,
                    ub_id: this.paramId,
                    grp_no: this.paramItem.grp_no,
                    content: this.replyContent,
                    c_id: this.paramItem.id
                }, this);

                this.replyContent = "";
            }
        }


        /******************************************************
         *                                                     *
         *          서버로 답글을 전송하는 로직이 필요            *
         *                                                     *
         ******************************************************/

        /******************************************************
         *                                                     *
         *                  페이지 리로드                       *
         *                                                     *
         ******************************************************/

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
