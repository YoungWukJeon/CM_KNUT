import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, App, ModalController} from 'ionic-angular';

// pages
import {ContentDetail} from '../content-detail/content-detail';
import {ContentDetailFacility} from '../content-detail-facility/content-detail-facility';
import {ContentReply} from '../content-reply/content-reply';
import { UserInfo } from '../user-info/user-info';

// providers
import {ServerRequester} from '../../providers/server-requester';
import {LocalStorage} from '../../providers/local-storage';

/**
 * Generated class for the ContentSearch page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-content-search',
    templateUrl: 'content-search.html',
})
export class ContentSearch {

    search_keyword: string = "";
    keywords: any[];
    key: string = null;
    search: string = null;
    dbItem: any;
    facilityBoard: any[] = [];
    userBoard: any[] = [];
    categorys: any[];

    // items: Array<{id: string, profileSrc: string, userName: string, registTime: string, category: string, resourceSrc: string, content: string, count: number, like: number, comment: number, latitude: number, longitude: number}>;

    private categoryBtns: any[];  // 게시글의 분류 버튼을 저장하는 배열

    private searchResult: any;

    private user_no = null;

    history_keyword: Array<{ keyword: string }>;

    constructor(public navCtrl: NavController, public navParams: NavParams, public app: App, public modalCtrl: ModalController,
                private sevReq: ServerRequester, private localStorage: LocalStorage) {

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

        // this.history_keyword = [];
        // this.history_keyword.push({keyword: '디지털 도서관'});
        // this.history_keyword.push({keyword: '운동장'});
        // this.history_keyword.push({keyword: '대학본부'});

        this.localStorage.getData("user_no").then(value => {

            // 로그인이 되어있으면
            if (value != null) {
                this.user_no = value;
            }

        }).catch((error) => {
            console.log(error);
        });

        this.localStorage.getData("search_keyword").then(value => {

            // 검색한 키워드가 없으면
            if (value == null) {
                this.history_keyword = [];
            }
            else {
                console.log('search_keyword', value);
                this.search_keyword = value;
                this.keywords = [];
                this.keywords = this.search_keyword.split('*&$');
                this.history_keyword = [];
                for(var i = this.keywords.length - 2; i >= 0; i--)
                    this.history_keyword.push({keyword: this.keywords[i]});
                // this.history_keyword.push({keyword: '디지털 도서관'});
                // this.history_keyword.push({keyword: '운동장'});
                // this.history_keyword.push({keyword: '대학본부'});
            }

        }).catch((err) => {
            console.log(err);
        });

    }

    serverSearch(keyword) {
        this.sevReq.getResult("contentsearch", {user_no: this.user_no, keyword: keyword}, this);
    }

    callback(domainURL: string, link: string, data: any) {

        if (link == "contentsearch") {
            console.log('서버가 데이터 보냄..', data);
            this.dbItem = data;
            this.facilityBoard = [];
            this.userBoard = [];

            let userBoardIndex = 0;

            for (var i = 0; i < this.dbItem.length; i++) {
                if (this.dbItem[i].resourceSrc != null) {
                    for (var j = 0; j < this.dbItem[i].resourceSrc.length; j++) {
                        this.dbItem[i].resourceSrc[j] = domainURL + this.dbItem[i].resourceSrc[j] + "?v=" + Date.now();
                    }
                }

                if (this.dbItem[i].board == 'facilityboard') {
                    this.facilityBoard.push({
                        id: this.dbItem[i].id,
                        name: this.dbItem[i].name,
                        content: {
                            resourceSrc: [this.dbItem[i].resourceSrc],
                            category: this.dbItem[i].category,
                            addr: '충북 충주시 대소원면 대학로 50 ' + this.dbItem[i].name,
                            tel: this.dbItem[i].tel,
                            info: this.dbItem[i].content
                        },
                        latitude: this.dbItem[i].latitude,
                        longitude: this.dbItem[i].longitude,
                        issue: []
                    });
                }
                else if (this.dbItem[i].board == 'userboard') {
                    this.userBoard.push({
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

                    if (this.userBoard[userBoardIndex].reply != null) {

                        this.userBoard[userBoardIndex].reply.profile = domainURL + this.userBoard[userBoardIndex].reply.profile;

                        // 자체 회원가입이 아니면(답글)
                        if (this.userBoard[userBoardIndex].reply.type != 's' && !this.userBoard[userBoardIndex].reply.profile.includes('res/images/profile/') ) {
                            this.userBoard[userBoardIndex].reply.profile = this.userBoard[userBoardIndex].reply.profile.replace(domainURL, "");
                        }

                        if (this.dbItem[i].reply.profile == "" || this.dbItem[i].reply.profile == 'undefined') {
                            this.userBoard[userBoardIndex].reply.profile = "assets/image/profile_default.png";
                        }

                    }

                    // 자체 회원가입이 아니면
                    if (this.userBoard[userBoardIndex].type != 's' && !this.userBoard[userBoardIndex].profileSrc.includes('res/images/profile/') ) {
                        this.userBoard[userBoardIndex].profileSrc = this.userBoard[userBoardIndex].profileSrc.replace(domainURL, "");
                    }

                    if (this.dbItem[i].profileSrc == "" || this.dbItem[i].profileSrc == 'undefined') {
                        this.userBoard[userBoardIndex].profileSrc = "assets/image/profile_default.png";
                    }

                    userBoardIndex++;
                }
            }

            this.userBoard.sort(function (a, b) {
                return b["id"] - a["id"];
            });

            this.searchResult = {
                facilityBoard: this.facilityBoard,
                userBoard: this.userBoard
            };
        }
        else if (link == "category") {
            this.dbItem = data;

            // 로그인 유저 이미지를 담고 있는 배열 부분을 제거(0번째 인덱스)
            this.dbItem = data.slice(1, data.length);

            for (var i = 0; i < this.dbItem.length; i++) {
                if (this.dbItem[i].resourceSrc != null) {
                    for (var j = 0; j < this.dbItem[i].resourceSrc.length; j++) {
                        this.dbItem[i].resourceSrc[j] = domainURL + this.dbItem[i].resourceSrc[j];
                    }
                }

                this.userBoard.push({
                    id: this.dbItem[i].id,
                    type: this.dbItem[i].type,
                    profileSrc: domainURL + this.dbItem[i].profileSrc + "?v=" + Date.now(),
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

                if (this.userBoard[i].reply != null) {

                    this.userBoard[i].reply.profile = domainURL + this.userBoard[i].reply.profile + "?v=" + Date.now();

                    // 자체 회원가입이 아니면(답글)
                    if (this.userBoard[i].reply.type != 's' && !this.userBoard[i].profile.includes('res/images/profile/') ) {
                        this.userBoard[i].reply.profile = this.userBoard[i].reply.profile.replace(domainURL, "");
                    }

                    if (this.dbItem[i].reply.profile == "" || this.dbItem[i].reply.profile == 'undefined') {
                        this.userBoard[i].reply.profile = "assets/image/profile_default.png";
                    }

                }

                // 자체 회원가입이 아니면
                if (this.userBoard[i].type != 's' && !this.userBoard[i].profileSrc.includes('res/images/profile/') ) {
                    this.userBoard[i].profileSrc = this.userBoard[i].profileSrc.replace(domainURL, "");
                }

                if (this.dbItem[i].profileSrc == "" || this.dbItem[i].profileSrc == 'undefined') {
                    this.userBoard[i].profileSrc = "assets/image/profile_default.png";
                }
            }

            this.userBoard.sort(function (a, b) {
                return b["id"] - a["id"];
            });

            this.searchResult = {
                facilityBoard: this.facilityBoard,
                userBoard: this.userBoard
            };
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ContentSearch');

        // this.localStorage.getData("search_keyword").then(value => {
        //
        //     // 검색한 키워드가 없으면
        //     if (value == null) {
        //         this.history_keyword = [];
        //     }
        //     else {
        //         console.log('search_keyword', value);
        //         this.search_keyword = value;
        //         this.history_keyword = [];
        //         this.history_keyword.push({keyword: '디지털 도서관'});
        //         this.history_keyword.push({keyword: '운동장'});
        //         this.history_keyword.push({keyword: '대학본부'});
        //     }
        //
        // }).catch((err) => {
        //     console.log(err);
        // });
    }

    ionViewDidEnter() {
        // alert(this.testi++);

        if( this.key != null ) {
            this.sevReq.getResult("contentsearch", {user_no: this.user_no, keyword: this.key}, this);
        }
    }

    content_search() {
        if (this.search == null)
            alert('내용을 입력해주세요.');
        else {
            this.key = this.search;
            // 검색 함수 호출
            this.serverSearch(this.search);

            //스토리지에 추가
            this.search_keyword = this.search_keyword.replace(this.key + "*&$", "");
            this.search_keyword += this.key + "*&$";
            this.localStorage.setData("search_keyword", this.search_keyword);
            console.log("스토리지에 search_keyword 추가 : ", this.search_keyword);
        }
    }

    history_search(keyword) {
        this.search = keyword;
        this.key = this.search;
        this.serverSearch(this.key);

        // 스토리지에 추가
        this.search_keyword = this.search_keyword.replace(this.key + "*&$", "");
        this.search_keyword += this.key + "*&$";
        this.localStorage.setData("search_keyword", this.search_keyword);
        console.log("스토리지에 search_keyword 추가 : ", this.search_keyword);
    }

    history_delete(i) {

        // 스토리지에서 삭제
        console.log('저장 키워드 삭제 : ', this.history_keyword[i].keyword);
        this.search_keyword = this.search_keyword.replace(this.history_keyword[i].keyword + "*&$", "");
        this.localStorage.setData("search_keyword", this.search_keyword);
        console.log("스토리지에 search_keyword 추가 : ", this.search_keyword);

        this.history_keyword.splice(i, 1);
        // console.log('저장 키워드 삭제 : ', this.history_keyword[i].keyword);
    }

    // 필터를 적용
    adapt() {
        this.userBoard = [];
        this.categorys = [];
        console.log("*적용된 필터*");
        this.categoryBtns.forEach((element) => {
            if (element.selected) {
                console.log(element.name);
                this.categorys.push(element.name);
            }
        });

        console.log('this.categorys : ', this.categorys);
        console.log("*----------*");

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        let body = {
            type: "search",
            keyword: this.key,
            user_no: this.user_no,
            categorys: this.categorys
        };

        this.sevReq.getResult("category", body, this);
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
        //     item.like--;

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

            this.sevReq.getResult("contentsearch", {user_no: this.user_no, keyword: this.key}, this);

        });
        replyModal.present();

    }

    // 장소 세부정보로 이동
    navigate_facility_detail(item) {

        /******************************************************
         *                                                     *
         *               서버 전송 로직 필요                    *
         *                                                     *
         ******************************************************/

        this.app.getRootNav().push(ContentDetailFacility, {
            id: item.id
        });

        // test.catch(reason => {
        //     alert('gg');
        // });

        // test.then(value => {
        //     alert('gg');
        // });
    }

    // 글 세부정보로 이동
    navigate_detail(item) {

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
                    this.ionViewDidEnter();
                }
            });
           
            userModal.present();
        });
    }

}
