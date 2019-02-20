import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, ModalController} from 'ionic-angular';

// pages
import { UserInfo } from '../user-info/user-info';
import {ContentLike} from '../content-like/content-like';
import {ContentReplyReply} from '../content-reply-reply/content-reply-reply';
import {ContentReplyUpdate} from '../content-reply-update/content-reply-update';

// providers
import {ServerRequester} from '../../providers/server-requester';
import {LocalStorage} from '../../providers/local-storage';


/**
 * Generated class for the ContentReply page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
 2017.05.17 made by Youngwuk Jeon

 <Update Log>
    [2017.06.04]
        1. http 부분 모두 제거 후 provider이용한 로직으로 변경
    [2017.06.26]
        1. 공감한 사람 정보 보기 추가

 */

@IonicPage()
@Component({
    selector: 'page-content-reply',
    templateUrl: 'content-reply.html',
})
export class ContentReply {

    private items: any[]; // 댓글 목록을 저장하는 배열

    private replyContent: string = "";  // 댓글의 입력 내용

    private user_no = null;

    paramId: any;
    contentLike: any;
    dbItem: any;
    max_grp_no: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController,
                private sevReq: ServerRequester, private localStorage: LocalStorage) {

        this.items = [
            {
                id: '',
                user_no: '',
                username: '',
                profile: "assets/image/bg_gray.png",
                type: '',
                grp_no: -1,
                time: 0,
                content: '',
                yours: true,
                totalLikeCount: '',
                reply: {
                    username: '',
                    profile: "assets/image/bg_gray.png",
                    content: ''
                }
            }
        ];

        this.paramId = navParams.get('id');
        this.contentLike = navParams.get('like');
        console.log('paramId : ', this.paramId);

        this.localStorage.getData("user_no").then(value => {

            // 로그인이 되어있으면
            if (value != null) {
                console.log("user_no: " + value);
                this.user_no = value;
                this.sevReq.getResult("contentreply", {user_no: value, paramId: this.paramId}, this);
            }
            else {
                this.sevReq.getResult("contentreply", {paramId: this.paramId}, this);
            }

        }).catch((error) => {
            console.log(error);
        });

    }

    callback(domainURL: string, link: string, data: any) {

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');
            this.viewCtrl.dismiss('not exists');

            console.log("pageCount", this.navCtrl.length());
            if( this.navCtrl.length() > 1 ) {
                this.navCtrl.pop();
            }
            return;
        }

        if( data.result == 'not exists2' ) {
            alert('해당 댓글이 존재하지 않거나 삭제되었습니다.');
            this.viewCtrl.dismiss('not exists');
            return;
        }

        if (link == "contentreply") {
            this.dbItem = data;
            console.log('********** contentreply server **********', this.dbItem);

            this.items = [];
            for (var i = 0; i < this.dbItem.length; i++) {

                this.items.push({
                    id: this.dbItem[i].id,
                    user_no: this.dbItem[i].user_no,
                    username: this.dbItem[i].username,
                    profile: domainURL + this.dbItem[i].profile + "?v=" + Date.now(),
                    type: this.dbItem[i].type,
                    grp_no: this.dbItem[i].grp_no,
                    time: this.dbItem[i].date,
                    content: this.dbItem[i].content,
                    yours: this.dbItem[i].yours,
                    totalLikeCount: this.dbItem[i].totalLikeCount,
                    reply: this.dbItem[i].reply
                });

                if (this.items[i].reply != null) {

                    this.items[i].reply.profile = domainURL + this.items[i].reply.profile + "?v=" + Date.now();

                    // 자체 회원가입이 아니면(답글)
                    if (this.items[i].reply.type != 's' && !this.items[i].profile.includes('res/images/profile/') ) {
                        this.items[i].reply.profile = this.items[i].reply.profile.replace(domainURL, "");
                    }

                    // if (this.dbItem[i].reply.profile == "" || this.dbItem[i].reply.profile == 'undefined') {
                    if (!(this.dbItem[i].reply.profile.replace(domainURL, "")).includes('.')) {
                        this.items[i].reply.profile = "assets/image/profile_default.png";
                    }

                }

                // 자체 회원가입이 아니면(댓글)
                if (this.items[i].type != 's' && !this.items[i].profile.includes('res/images/profile/') ) {
                    this.items[i].profile = this.items[i].profile.replace(domainURL, "");
                }

                if (this.dbItem[i].profile == "" || this.dbItem[i].profile == 'undefined') {
                    this.items[i].profile = "assets/image/profile_default.png";
                }

            }

            this.items.sort(function(a, b){
                return b["id"] - a["id"];
            });

            // student.sort(function(a, b) { // 내림차순
            //     return b[sortingField] - a[sortingField];
            //     // 44, 25, 21, 13
            // });
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
        // item.yours = !item.yours;
        //
        // if (item.yours) {
        //     item.totalLikeCount++;
        // }
        // else {
        //     item.totalLikeCount--;
        // }
        /******************************************************
         *                                                     *
         *          서버의 내용을 변경하는 로직이 필요            *
         *                                                     *
         ******************************************************/
    }

    // 답글 페이지로 이동
    reply(item) {

        let replyModal = this.modalCtrl.create(ContentReplyReply, {paramId: this.paramId, item: item});

        replyModal.onDidDismiss(data => {

            console.log("dismiss data", data);
            if( data == 'not exists' ) {
                this.viewCtrl.dismiss('not exists');
                return;
            }

            console.log("dismiss data", data);
            if( data == 'not exists2' ) {
                this.viewCtrl.dismiss('not exists2');
                return;
            }

            if (this.user_no != null) {
                this.sevReq.getResult("contentreply", {user_no: this.user_no, paramId: this.paramId}, this);
            }
            else {
                this.sevReq.getResult("contentreply", {paramId: this.paramId}, this);
            }

        });
        replyModal.present();

    }

    // 로그인한 유저가 작성한 댓글을 수정
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
            

            // 성공적으로 수정을 완료한 경우
            if (data.result == 'success') {
                console.log('data');
                item.content = data.content;
                this.sevReq.getResult("commentupdatedelete", {c_id: item.id, content: item.content, type: 'update'}, this);
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

    // 로그인한 유저가 작성한 댓글을 삭제
    delete(item) {

        this.items.splice(this.items.indexOf(item), 1);

        this.sevReq.getResult("commentupdatedelete", {c_id: item.id, type: 'delete', ub_id: this.paramId, grp_no: item.grp_no}, this);

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
                this.max_grp_no = 1;

                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].grp_no >= this.max_grp_no) this.max_grp_no = this.items[i].grp_no + 1;
                }

                console.log('max_grp_no : ', this.max_grp_no);

                this.sevReq.getResult("contentreply", {
                    user_no: this.user_no,
                    paramId: this.paramId,
                    grp_no: this.max_grp_no,
                    content: this.replyContent
                }, this);

                this.replyContent = "";
            }
        }

    }

    // 공감 누른 사람 페이지로 이동
    viewPeopleList() {

        let likeModal = this.modalCtrl.create(ContentLike, {paramId: this.paramId});

        likeModal.onDidDismiss(data => {

            console.log("dismiss data", data);
            if( data == 'not exists' ) {

                this.viewCtrl.dismiss();
                console.log("pageCount", this.navCtrl.length());

                if( this.navCtrl.length() > 1 ) {
                    this.navCtrl.pop();
                }
            }
            return;

        //   if( data != null ) {
        //     console.log('success', data);
        //     console.log(data);
        //   }
        //   else {
        //     console.log('cancel')
        //   }

        });
        likeModal.present();
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