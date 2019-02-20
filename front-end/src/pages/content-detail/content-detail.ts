import {Component} from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';

// pages
import {ContentReply} from '../content-reply/content-reply';
import {ContentLike} from '../content-like/content-like';
import {BigMap} from '../big-map/big-map';
import {ContentDetailSubContent} from '../content-detail-sub-content/content-detail-sub-content';
import {ContentDetailSubContentResult} from '../content-detail-sub-content-result/content-detail-sub-content-result';

// pages
import { Login } from '../login/login';
import { UserInfo } from '../user-info/user-info';
import { ContentWrite } from '../content-write/content-write';

// providers
import {ServerRequester} from '../../providers/server-requester';
import {LocalStorage} from '../../providers/local-storage';
import { MenuContent } from '../../providers/menu-content';

/**
 * Generated class for the ContentDetail page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-content-detail',
    templateUrl: 'content-detail.html',
})
export class ContentDetail {

    item: any = {
        id: 0,
        profileSrc: 'assets/image/bg_gray.png',
        sub_content: null,
        userName: '',
        user_no: 0,
        registTime: 0,
        expireTime: 0,
        category: '',
        resourceSrc: [["assets/image/bg_gray.png"]],
        title: '',
        content: '',
        tag: '',
        count: 0,
        like: 2,
        yours: '',
        comment: 15,
        reply: {
            username: 'Sejeong Kim',
            profile: 'assets/image/bg_gray.png',
            content: '비 올 때 미끄러워요.'
        },
        markers: [],
        icon: {
            src: "assets/image/bg_gray.png", 
            size: {
                width: 40, 
                height: 40
            }
        }
    };

    paramId: any;
    dbItem: any;

    private markers: any[] = [];

    private currentResIndex: number = 0;

    private user_no = null;

    constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, private alertCtrl: AlertController,
                private sevReq: ServerRequester, private localStorage: LocalStorage, private menuContent: MenuContent) {
        // this.item = navParams.get('item');
        this.paramId = navParams.get('id');
        // this.paramId = 35;
        console.log('paramId : ', this.paramId);

        // this.localStorage.getData("user_no").then(value => {
        //     // 로그인이 되어있으면
        //     if (value != null) {
        //         console.log("user_no: " + value);
        //         this.user_no = value;
        //         this.sevReq.getResult("contentdetail", {user_no: value, paramId: this.paramId}, this);
        //     }
        //     else {
        //         this.sevReq.getResult("contentdetail", {paramId: this.paramId}, this);
        //     }
        // });


        // yours 는 따로 서버에서 가지고 와야함...

        // this.currentResIndex = this.item.resourceSrc.length > 0 ? 0 : -1;

        // for (var i = 0; i < this.item.markers.length; i++) {
        //     this.markers.push(this.item.markers[i]);
        // }

        // this.markers.push(this.item.markers);
        // this.markers = [this.item.markers];
        // this.markers = [
        //   {lat: 36.9692523,
        //   lng: 127.8700678,
        //   }
        // ];
    }

    callback(domainURL: string, link: string, data: any) {

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');
            
            console.log("pageCount", this.navCtrl.length());
            if( this.navCtrl.length() > 1 ) {
                this.navCtrl.pop();
            }
            return;
        }

        if (link == "contentdetail") {
            console.log('********** contentdetila server **********', data);

            if( data.result == 'not exists' ) {
                alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');
                this.navCtrl.pop();
            }
            else {
                this.dbItem = data;

                if (this.dbItem.resourceSrc != null) {
                    for (var j = 0; j < this.dbItem.resourceSrc.length; j++) {
                        this.dbItem.resourceSrc[j] = domainURL + this.dbItem.resourceSrc[j] + "?v=" + Date.now();
                    }
                }

                this.item = {
                    id: this.dbItem.id,
                    type: this.dbItem.type,
                    user_no: this.dbItem.user_no,
                    profileSrc: domainURL + this.dbItem.profileSrc + "?v=" + Date.now(),
                    userName: this.dbItem.nickname,
                    registTime: this.dbItem.regist_time,
                    expireTime: this.dbItem.expire_time,
                    category: this.dbItem.category,
                    resourceSrc: [this.dbItem.resourceSrc],
                    title: this.dbItem.name,
                    content: this.dbItem.content,
                    tag: this.dbItem.tag == null ? "" : this.dbItem.tag,
                    count: this.dbItem.count,
                    yours: this.dbItem.yours,
                    like: this.dbItem.totalLikeCount,
                    comment: this.dbItem.commentCount,
                    reply: this.dbItem.reply,
                    markers: this.dbItem.coords,
                    icon: '',
                    sub_content: this.dbItem.sub_content
                };

                console.log("item: ", this.item);

                if (this.dbItem.category == '공지') this.item.icon = {src: "assets/btn_icon/icon_marker_notice.png", size: {width: 40, height: 40}};
                else if (this.dbItem.category == '이벤트') this.item.icon = {src: "assets/btn_icon/icon_marker_event.png", size: {width: 40, height: 40}};
                else if (this.dbItem.category == '일상') this.item.icon = {src: "assets/btn_icon/icon_marker_daily.png", size: {width: 40, height: 40}};
                else if (this.dbItem.category == '건의') this.item.icon = {src: "assets/btn_icon/icon_marker_suggest.png", size: {width: 40, height: 40}};

                if (this.item.reply != null) {

                    this.item.reply.profile = domainURL + this.item.reply.profile + "?v=" + Date.now();

                    // 자체 회원가입이 아니면(답글)
                    if (this.item.reply.type != 's' && !this.item.reply.profile.includes('res/images/profile/') ) {
                        this.item.reply.profile = this.item.reply.profile.replace(domainURL, "");
                    }

                    if (this.dbItem.reply.profile == "" || this.dbItem.reply.profile == 'undefined') {
                        this.item.reply.profile = "assets/image/profile_default.png";
                    }

                }

                // 자체 회원가입이 아니면
                if (this.item.type != 's' && !this.item.profileSrc.includes('res/images/profile/') ) {
                    this.item.profileSrc = this.item.profileSrc.replace(domainURL, "");
                }

                if (this.dbItem.profileSrc == "" || this.dbItem.profileSrc == 'undefined') {
                    this.item.profileSrc = "assets/image/profile_default.png";
                }

                for (var i = 0; i < this.item.markers.length; i++) {
                    this.markers.push(this.item.markers[i]);
                }

                this.currentResIndex = this.item.resourceSrc.length > 0 ? 0 : -1;
            }
        }
        else if( link == "subcontentexpired" ) {
            if( data == "already expired" ) {
                alert("이미 종료된 투표 / 설문 조사입니다.");
            }
            else {
                alert("해당 투표 / 설문 조사가 종료되었습니다.");
            }
        }
        else if( link == "contentdelete" ) {
            // var currentPageNum = this.navCtrl.indexOf(this.navCtrl.last()) - 1;
            // console.log("currentPageNum", currentPageNum);
            // this.navCtrl.push(ContentDetail, {id: this.postId});
            // this.navCtrl.remove(currentPageNum, 2);
            this.navCtrl.pop();

            // if(this.navCtrl.getPrevious().component.name == "HomePage"){
            //     this.navCtrl.setRoot(HomePage);
            // }
            // else{
            //     this.navCtrl.pop();
            // }
        }
    }

    ionViewDidEnter(){

        this.localStorage.getData("user_no").then(value => {
            // 로그인이 되어있으면
            if (value != null) {
                console.log("user_no: " + value);
                this.user_no = value;
                this.sevReq.getResult("contentdetail", {user_no: value, paramId: this.paramId}, this);
            }
            else {
                this.sevReq.getResult("contentdetail", {paramId: this.paramId}, this);
            }
        });
    }

    ionViewWillLeave() {
        console.log('ionViewWillLeave ContentDetail');
        // this.navCtrl.setRoot(this.menuContent.getMenuComponent(0));
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ContentDetail');
    }

    getTimeText(time: number, type: string): string {

        var text = "";
        var diff;

        // var now = new Date();
        // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

        if(type == "regist") diff = Date.now() - time; // 현재 시간과의 차이를 계산
        else diff = time - Date.now(); // 이벤트 게시만료 시간인 경우

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

    imageChange(val: boolean) {

        if (val) {
            this.currentResIndex++;
        }
        else {
            this.currentResIndex--;
        }

    }

    showBigMap() {
        let bigMapModal = this.modalCtrl.create(BigMap, {markers: this.markers, icon: this.item.icon});

        bigMapModal.onDidDismiss(data => {

            if (this.user_no != null) {
                this.sevReq.getResult("contentdetail", {user_no: this.user_no, paramId: this.paramId}, this);
            }
            else {
                this.sevReq.getResult("contentdetail", {paramId: this.paramId}, this);
            }

        });
        bigMapModal.present();
    }

    like() {

        // this.item.yours = !this.item.yours;
        //
        // if (this.item.yours)
        //     this.item.like++;
        // else
        //     this.item.like--;

        if (this.user_no == null) {
            alert('로그인이 필요한 서비스 입니다.');
            this.login();
            return;
        }
        else {
            this.item.yours = !this.item.yours;

            if (this.item.yours) {
                this.item.like++;
                this.sevReq.getResult("docontentlike", {ub_id: this.item.id, user_no: this.user_no, type: 'insert'}, this);
            }
            else {
                this.item.like--;
                this.sevReq.getResult("docontentlike", {ub_id: this.item.id, user_no: this.user_no, type: 'delete'}, this);
            }
        }
    }

    // 댓글 페이지로 이동
    reply() {

        let replyModal = this.modalCtrl.create(ContentReply, {id: this.paramId, like: this.item.like});

        replyModal.onDidDismiss(data => {

            if( data == 'not exists' ) {
                if( this.navCtrl.length() > 1 ) {
                    this.navCtrl.pop();
                }
                return;
            }

            if( data == 'not exists2' ) {
                return;
            }
            
            if (this.user_no != null) {
                this.sevReq.getResult("contentdetail", {user_no: this.user_no, paramId: this.paramId}, this);
            }
            else {
                this.sevReq.getResult("contentdetail", {paramId: this.paramId}, this);
            }

        });
        replyModal.present();

    }

    // 공감 누른 사람 페이지로 이동
    // viewPeopleList() {
    //
    //     let likeModal = this.modalCtrl.create(ContentLike, {id: '1'});
    //
    //     // likeModal.onDidDismiss(data => {
    //
    //     //   if( data != null ) {
    //     //     console.log('success', data);
    //     //     console.log(data);
    //     //   }
    //     //   else {
    //     //     console.log('cancel')
    //     //   }
    //
    //     // });
    //     likeModal.present();
    // }

    goSubContent() {

        if( this.user_no == null ) {
            alert('로그인이 필요합니다.');
            this.login();
            return;
        }

        let subContentModal = this.modalCtrl.create(ContentDetailSubContent, {user_no: this.user_no, id: this.item.id});

        subContentModal.onDidDismiss(data => {
            if( data.msg == 'not exists' ) {
                console.log(data.msg);
            }
            else if( data.msg == 'duplicated' ) {
                this.goSubContentResult(this.user_no);
            }
        });
        subContentModal.present();
    }

    goSubContentResult(user_no: number = null) {

        // if( this.user_no == null ) {
        //     alert('로그인이 필요합니다.');
        //     this.login();
        //     return;
        // }

        let subContentResultModal = this.modalCtrl.create(ContentDetailSubContentResult, {user_no: user_no, id: this.item.id});

        subContentResultModal.onDidDismiss(data => {
            
        });
        subContentResultModal.present();
    }

    login() {
        let loginModal = this.modalCtrl.create(Login);
        loginModal.present();
    }
    
    userInfo(user_no) {
        console.log("user_no=>", this.user_no);
        console.log("item.user_no=>", this.item.user_no);
        console.log("user_no=>", user_no);
        let userInfoModal = this.modalCtrl.create(UserInfo, {user_no: user_no});

        userInfoModal.onDidDismiss(data => {
            console.log("data.....", data);
            if( data == 'unlink' ) {
                this.ionViewDidEnter();
            }
        });

        userInfoModal.present();
    }

    endSubContent() {
        let alert = this.alertCtrl.create({
            title: this.item.sub_content == 'vote'? '투표를 마감하시겠습니까?' : '설문 조사를 마감하시겠습니까?',
            message: '정해진 마감 방법을 무시하고 강제로 마감합니다.',
            cssClass: 'custom_alert',
            buttons: [
                {
                    text: '아니요.',
                    role: 'cancel',
                    cssClass: 'custom_alert_btn',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '네. 마감합니다.',
                    cssClass: 'custom_alert_btn',
                    handler: () => {
                        console.log('Expire clicked');
                        this.sevReq.getResult("subcontentexpired", {ub_id: this.paramId}, this);
                    }
                }
            ]
        });
        alert.present();
    }

    update() {
        this.navCtrl.push(ContentWrite, {mode: 'update', item: this.item});
    }

    delete() {
        console.log(this.navCtrl.getPrevious().component.name);

        let body = {
            paramId: this.paramId,
            res_kind: 'ub',
            resourceSrc: [
            ]
        };

        this.item.resourceSrc[0].forEach((element) => {
            body.resourceSrc.push(element.split('?')[0].replace(this.sevReq.getDomainURL(), ""));
        });

        console.log("removeBody", body);

        this.sevReq.getResult("contentdelete", body, this);
        // this.navCtrl.pop();
        // console.log(this.viewCtrl.index);
        // console.log(this.navCtrl.getActiveChildNav());
        // console.log(this.navCtrl.getActive());
        console.log(this.navCtrl.getPrevious().component.name);
        // if(this.navCtrl.getPrevious().component.name == "HomePage"){
        //     this.sevReq.getResult("contentdelete", {paramId: this.paramId}, this);
        //     this.navCtrl.setRoot(HomePage);
        // }
        // else{
        //     this.sevReq.getResult("contentdelete", {paramId: this.paramId}, this);
        //     this.navCtrl.pop();
        // }
    }

    presentConfirm() {

        let alert = this.alertCtrl.create({
            title: '게시글 삭제',
            message: '게시글을 삭제하시겠습니까?',
            cssClass: 'custom_alert',
            buttons: [
                {
                    text: '취소',
                    role: 'cancel',
                    cssClass: 'custom_alert_btn',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: '삭제',
                    cssClass: 'custom_alert_btn',
                    handler: () => {
                        console.log('Expire clicked');
                        this.delete();
                    }
                }
            ]
        });
        alert.present();
    }

    // presentConfirm() {
    //     let alert = this.alertCtrl.create({
    //         title: '게시글 삭제',
    //         message: '게시글을 삭제하시겠습니까?',
    //         buttons: [
    //             {
    //                 text: '취소',
    //                 role: 'cancel',
    //                 handler: () => {
    //                     console.log('Cancel clicked');
    //                 }
    //             },
    //             {
    //                 text: '삭제',
    //                 handler: () => {
    //                     console.log('Delete clicked');
    //                     this.delete();
    //                 }
    //             }
    //         ]
    //     });
    //     alert.present();
    // }

}
