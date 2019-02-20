import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, App, ModalController, InfiniteScroll} from 'ionic-angular';

// pages
import {ContentSearch} from '../content-search/content-search';
import {ContentDetail} from '../content-detail/content-detail';
import {ContentWrite} from '../content-write/content-write';
import {ContentReply} from '../content-reply/content-reply';
import { UserInfo } from '../user-info/user-info';
import { HomeMap } from '../home-map/home-map';

// providers
import { ServerRequester } from '../../providers/server-requester';
import { LocalStorage } from '../../providers/local-storage';

/**
 * Generated class for the HomeContent page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-home-content',
    templateUrl: 'home-content.html',
})
export class HomeContent {

    private categoryBtns: any[];  // 게시글의 분류 버튼을 저장하는 배열

    viewItems: any[];
    viewIndex: number;
    items: any[];
    dbItem: any;
    categorys: any[];
    hasMoreData: boolean = true;

    private user_no = null;
    private myProfileSrc = "assets/image/profile_default.png";
    private filterUsed: boolean = false;

    constructor(public navCtrl: NavController, public navParams: NavParams, private app: App, public modalCtrl: ModalController,
    private sevReq: ServerRequester, private localStorage: LocalStorage) {

        // this.user_no = nativeStorage.getItem('user_no');

        // alert('이게 계속...');

        // this.localStorage.getData("user_no").then(value => {
        //
        //     // 로그인이 되어있으면
        //     if( value != null ) {
        //         console.log("user_no: " + value);
        //         this.user_no = value;
        //         this.sevReq.getResult("homecontent", {user_no: value}, this);
        //     }
        //     else {
        //         this.sevReq.getResult("homecontent", {}, this);
        //     }
        //
        // }).catch((error) => {
        //     console.log(error);
        // });
            

        // 카테고리 버튼 초기화
        this.categoryBtns = [
            {
                name: "공지",
                color: "customBtn2",
                selected: true
            },
            {
                name: "이벤트",
                color: "customBtn3",
                selected: true
            },
            {
                name: "일상",
                color: "customBtn4",
                selected: true
            },
            {
                name: "건의",
                color: "customBtn5",
                selected: true
            }
        ];

        // this.viewIndex = 0;
        // this.hasMoreData = true;
        // this.infiniteScroll.enable(true);

    }

    content_search() {
        this.navCtrl.push(ContentSearch);
    }

    goContent() {
        this.navCtrl.setRoot(HomeContent);
    }

    goMap() {
        this.navCtrl.setRoot(HomeMap);
    }

    doInfinite(infiniteScroll: InfiniteScroll) {
        console.log('Begin async operation');

        setTimeout(() => {

            console.log('viewIndex: ', this.viewIndex);

            for (var i = 0; i < 2; i++) {
                if(this.viewIndex < this.items.length) {
                    this.viewItems[this.viewIndex] = this.items[this.viewIndex];
                    this.viewIndex++;
                    // infiniteScroll.enable(true);
                }
                else{
                    this.hasMoreData = false;
                    // infiniteScroll.enable(false);
                }
            }

            console.log('Async operation has ended');
            infiniteScroll.complete();
        }, 500);
    }

    callback(domainURL: string, link: string, data: any) {

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');

            console.log("pageCount", this.navCtrl.length());
            if( this.navCtrl.length() > 1 ) {
                this.navCtrl.pop();
            }
            else {
                // this.adapt();
                this.navCtrl.setRoot(HomeContent, {adapt: true, filter: this.categoryBtns, filterUsed: this.filterUsed});
            }
            return;
        }

        if( link == "homecontent" ) {

            console.log('서버에서 값 전달받음!!');
            this.dbItem = data.slice(1, data.length);


            this.viewIndex = 0;
            this.viewItems = [];
            this.items = [];

            if( data[0].myProfileSrc != null ) {
                if( data[0].myProfileSrc.includes('res/images/profile/') ) {
                    this.myProfileSrc = domainURL + data[0].myProfileSrc + "?v=" + Date.now();
                }
                else {
                    this.myProfileSrc = data[0].myProfileSrc + "?v=" + Date.now();
                }
            }

            console.log("MyProfileSrc", this.myProfileSrc);

            // this.myProfileSrc = (data[0].myProfileSrc == null)? this.myProfileSrc: domainURL + data[0].myProfileSrc + "?v=" + Date.now();
            // this.myProfileSrc = (data[0].myProfileSrc == null)? this.myProfileSrc: domainURL + data[0].myProfileSrc + "?v=" + Date.now();            
         
            for (var i = 0; i < this.dbItem.length; i++) {
                if (this.dbItem[i].resourceSrc != null) {
                    for (var j = 0; j < this.dbItem[i].resourceSrc.length; j++) {
                        this.dbItem[i].resourceSrc[j] = domainURL + this.dbItem[i].resourceSrc[j] + "?v=" + Date.now();
                    }
                }

                this.items.push({
                    id: this.dbItem[i].id,
                    type: this.dbItem[i].type,
                    profileSrc: domainURL + this.dbItem[i].profileSrc + "?v=" + Date.now(),
                    user_no: this.dbItem[i].user_no,
                    userName: this.dbItem[i].nickname,
                    registTime: this.dbItem[i].regist_time,
                    category: this.dbItem[i].category,
                    resourceSrc: [this.dbItem[i].resourceSrc],
                    title: this.dbItem[i].name,
                    content: this.dbItem[i].content,
                    tag: this.dbItem[i].tag == null ? "" : this.dbItem[i].tag,
                    count: this.dbItem[i].count,
                    yours: this.dbItem[i].yours,
                    like: this.dbItem[i].totalLikeCount,
                    comment: this.dbItem[i].commentCount,
                    reply: this.dbItem[i].reply,
                    markers: this.dbItem[i].coords
                });

                if (this.items[i].reply != null) {

                    this.items[i].reply.profile = domainURL + this.items[i].reply.profile + "?v=" + Date.now();

                    // 자체 회원가입이 아니면(답글)
                    if (this.items[i].reply.type != 's' && !this.items[i].reply.profile.includes('res/images/profile/') ) {
                        this.items[i].reply.profile = this.items[i].reply.profile.replace(domainURL, "");
                    }

                    if (this.dbItem[i].reply.profile == "" || this.dbItem[i].reply.profile == 'undefined') {
                        this.items[i].reply.profile = "assets/image/profile_default.png";
                    }

                }

                // 자체 회원가입이 아니면
                if (this.items[i].type != 's' && !this.items[i].profileSrc.includes('res/images/profile/') ) {
                    this.items[i].profileSrc = this.items[i].profileSrc.replace(domainURL, "");
                }

                if (this.dbItem[i].profileSrc == "" || this.dbItem[i].profileSrc == 'undefined') {
                    this.items[i].profileSrc = "assets/image/profile_default.png";
                }


                // this.items[i].resourceSrc[0].forEach((element) => {
                //   element = this.serverUrl + "/" + element;
                //   console.log("element", element);
                // });

                if(i < 2){
                    this.viewItems[i] = this.items[i];
                    this.viewIndex++;
                    this.hasMoreData = true;
                }

            }

            console.log('this.viewItems : ', this.viewItems);
            console.log('viewIndex: ', this.viewIndex);

            this.items.sort(function(a, b){
                return b["id"] - a["id"];
            });

            console.log('items : ', this.items);
        }
        else if( link == "category") {
            // this.dbItem = data;

            this.dbItem = data.slice(1, data.length);

            console.log("DBITEM...", this.dbItem);

            this.viewIndex = 0;
            this.viewItems = [];
            this.items = [];

            if( data[0].myProfileSrc != null ) {
                if( data[0].myProfileSrc.includes('res/images/profile/') ) {
                    this.myProfileSrc = domainURL + data[0].myProfileSrc + "?v=" + Date.now();
                }
                else {
                    this.myProfileSrc = data[0].myProfileSrc + "?v=" + Date.now();
                }
            }

            // this.myProfileSrc = (data[0].myProfileSrc == null)? this.myProfileSrc: domainURL + data[0].myProfileSrc + "?v=" + Date.now();

            for (var i = 0; i < this.dbItem.length; i++) {
                if (this.dbItem[i].resourceSrc != null) {
                    for (var j = 0; j < this.dbItem[i].resourceSrc.length; j++) {
                        this.dbItem[i].resourceSrc[j] = domainURL + this.dbItem[i].resourceSrc[j] + "?v=" + Date.now();
                    }
                }

                this.items.push({
                    id: this.dbItem[i].id,
                    type: this.dbItem[i].type,
                    profileSrc: domainURL + this.dbItem[i].profileSrc + "?v=" + Date.now(),
                    user_no: this.dbItem[i].user_no,
                    userName: this.dbItem[i].nickname,
                    registTime: this.dbItem[i].regist_time,
                    category: this.dbItem[i].category,
                    resourceSrc: [this.dbItem[i].resourceSrc],
                    title: this.dbItem[i].name,
                    content: this.dbItem[i].content,
                    tag: this.dbItem[i].tag == null ? "" : this.dbItem[i].tag,
                    count: this.dbItem[i].count,
                    yours: this.dbItem[i].yours,
                    like: this.dbItem[i].totalLikeCount,
                    comment: this.dbItem[i].commentCount,
                    reply: this.dbItem[i].reply,
                    markers: this.dbItem[i].coords
                });

                if (this.items[i].reply != null) {

                    this.items[i].reply.profile = domainURL + this.items[i].reply.profile + "?v=" + Date.now();

                    // 자체 회원가입이 아니면(답글)
                    if (this.items[i].reply.type != 's' && !this.items[i].reply.profile.includes('res/images/profile/') ) {
                        this.items[i].reply.profile = this.items[i].reply.profile.replace(domainURL, "");
                    }

                    if (this.dbItem[i].profileSrc == "" || this.dbItem[i].profileSrc == 'undefined') {
                        this.items[i].reply.profile = "assets/image/profile_default.png";
                    }

                }

                // 자체 회원가입이 아니면
                if (this.items[i].type != 's' && !this.items[i].profileSrc.includes('res/images/profile/') ) {
                    this.items[i].profileSrc = this.items[i].profileSrc.replace(domainURL, "");
                }

                if (this.dbItem[i].profileSrc == "" || this.dbItem[i].profileSrc == 'undefined') {
                    this.items[i].profileSrc = "assets/image/profile_default.png";
                }

                if(i < 2){
                    this.viewItems[i] = this.items[i];
                    this.viewIndex++;
                }
            }

            console.log('this.viewItems : ', this.viewItems);
            console.log('viewIndex: ', this.viewIndex);

            this.items.sort(function(a, b){
                return b["id"] - a["id"];
            });

            console.log('items : ', this.items);
        }
    }

    // onPageWillEnter() {
    //     console.log('onPageWillEnter()');
    //     // You can execute what you want here and it will be executed right before you enter the view
    // }

    ionViewDidEnter(){
        // alert('home-content.ts');
        console.log('home-content.ts');

        this.localStorage.getData("user_no").then(value => {

            // var link = this.navParams.get('adapt') != null? 'category': 'homecontent';

            // 로그인이 되어있으면
            if( value != null ) {
                console.log("user_no: " + value);
                this.user_no = value;
                // this.sevReq.getResult("homecontent", {user_no: value}, this);
            }
            // else {
            //     this.sevReq.getResult("homecontent", {}, this);
            // }

            if( this.navParams.get('adapt') != null ) {

                this.items = [];
                this.categorys = [];
                this.categoryBtns = this.navParams.get('filter');
                console.log("*적용된 필터*");

                this.categoryBtns.forEach((element) => {
                    if (element.selected) {
                        console.log(element.name);
                        this.categorys.push(element.name);
                    }
                });

                console.log('this.categorys : ', this.categorys);
                console.log("*----------*");

                let body = {
                    type: "non-search",
                    keyword: "",
                    user_no: this.user_no,
                    categorys: this.categorys
                };

                this.sevReq.getResult("category", body, this);
            }
            else {
                this.sevReq.getResult("homecontent", {user_no: this.user_no}, this);
            }

        }).catch((error) => {
            console.log(error);
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeContent');
    }


    // 필터를 적용
    adapt() {
        this.filterUsed = true;

        this.navCtrl.setRoot(HomeContent, {adapt: true, filter: this.categoryBtns, filterUsed: this.filterUsed});
        // this.items = [];
        // this.categorys = [];
        // console.log("*적용된 필터*");
        // this.categoryBtns.forEach((element) => {
        //     if (element.selected) {
        //         console.log(element.name);
        //         this.categorys.push(element.name);
        //     }
        // });

        // console.log('this.categorys : ', this.categorys);
        // console.log("*----------*");

        // let body = {
        //     type: "non-search",
        //     keyword: "",
        //     user_no: this.user_no,
        //     categorys: this.categorys
        // };

        // this.sevReq.getResult("category", body, this);

                
    }

    // 카테고리를 선택/해제하는 메소드
    categorySelect(category) {

        category.selected = !category.selected;

        console.log("category", category.name);
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
        //     item.like++;
        // else
        //     item.like—;

        if (this.user_no == null) {
            alert('로그인이 필요한 서비스 입니다.');
        }
        else {
            item.yours = !item.yours;

            if (item.yours) {
                item.like++;
                this.sevReq.getResult("docontentlike", {ub_id: item.id, user_no: this.user_no, type: 'insert'}, this);
            }
            else {
                item.like--;
                this.sevReq.getResult("docontentlike", {ub_id: item.id, user_no: this.user_no, type: 'delete'}, this);
            }
        }

        /******************************************************
         *                                                     *
         *          서버의 내용을 변경하는 로직이 필요            *
         *                                                     *
         ******************************************************/
    }

    reply(item) {

        let replyModal = this.modalCtrl.create(ContentReply, {id: item.id, like: item.like});

        replyModal.onDidDismiss(data => {

            if (this.user_no != null) {
                this.sevReq.getResult("homecontent", {user_no: this.user_no}, this);
            }
            else {
                this.sevReq.getResult("homecontent", {}, this);
            }

        });
        replyModal.present();

    }

    // 글 세부정보로 이동
    navigate(item) {

        item.count++;

        /******************************************************
         *                                                     *
         *               서버 전송 로직 필요                    *
         *                                                     *
         ******************************************************/

        this.app.getRootNav().push(ContentDetail, {
            id: item.id
        });
    }

    write() {
        this.app.getRootNav().push(ContentWrite, {});
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);

        setTimeout(() => {
            console.log('Async operation has ended');
            // this.adapt();
            // this.navCtrl.setRoot(HomeContent, {adapt: true, filterUsed: this.filterUsed});
            this.navCtrl.setRoot(HomeContent, {adapt: true, filter: this.categoryBtns, filterUsed: this.filterUsed});
            refresher.complete();
        }, 2000);
    }


    // doRefresh(refresher) {
    //     console.log('Begin async operation', refresher);

    //     setTimeout(() => {
    //         console.log('Async operation has ended');
    //         this.localStorage.getData("user_no").then(value => {

    //             // 로그인이 되어있으면
    //             if( value != null ) {
    //                 console.log("user_no: " + value);
    //                 this.user_no = value;
    //                 this.sevReq.getResult("homecontent", {user_no: value}, this);
    //             }
    //             else {
    //                 this.sevReq.getResult("homecontent", {}, this);
    //             }

    //         }).catch((error) => {
    //             console.log(error);
    //         });
    //         refresher.complete();
    //     }, 2000);
    // }

    userinfo(user_no: number) {

        console.log(user_no);

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
                // alert("userModal: " + data);
                if( data == 'unlink' ) {
                    this.ionViewDidEnter();
                }
            });
           
            userModal.present();
        });
    }

}