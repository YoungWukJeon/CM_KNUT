import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController} from 'ionic-angular';
import {BigMap} from '../big-map/big-map';
import {ContentDetail} from '../content-detail/content-detail';

// providers
import {ServerRequester} from '../../providers/server-requester';
import {LocalStorage} from '../../providers/local-storage';

/**
 * Generated class for the ContentDetailFacility page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-content-detail-facility',
    templateUrl: 'content-detail-facility.html',
})
export class ContentDetailFacility {

    private item: any;
    private markers: any[] = [];

    private currentResIndex: number;
    private user_no = null;

    dbItem: any;
    paramId: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController,
                private sevReq: ServerRequester, private localStorage: LocalStorage) {

        this.item = {
            id: '',
            name: '',
            content: {
                resourceSrc: [''],
                category: '',
                addr: '',
                tel: '',
                info: ''
            },
            latitude: '',
            longitude: '',
            issue: [{
                id: '',
                category: '',
                title: '',
                registTime: ''
            },],
            icon: ''
        };

        this.paramId = this.navParams.get('id');

        // this.item = navParams.get('item');
        // console.log('item : ', this.item);

        console.log("paramid", this.paramId);

        
    }

    ionViewDidEnter() {
        console.log('호출');

        this.localStorage.getData("user_no").then(value => {

            // 로그인이 되어있으면
            if (value != null) {
                this.user_no = value;
            }
            // else {
            //     this.sevReq.getResult("detailfacility", {paramId: this.paramId}, this);                
            // }

            console.log('detailfacility');
            console.log('paramId', this.paramId);
            this.sevReq.getResult("detailfacility", {paramId: this.paramId}, this);

        }).catch((error) => {
            console.log(error);
        });
    }

    callback(domainURL: string, link: string, data: any) {

        this.dbItem = data;
        this.item = "";

        console.log("DATA!!!", data);

        if( data.result == 'not exists' ) {
            alert('해당 게시글이 존재하지 않거나 삭제되었습니다.');

            console.log("pageCount", this.navCtrl.length());
            if( this.navCtrl.length() > 1 ) {
                this.navCtrl.pop();
            }
            return;
        }

        if (this.dbItem.resourceSrc != null) {
            for (var j = 0; j < this.dbItem.resourceSrc.length; j++) {
                this.dbItem.resourceSrc[j] = domainURL + this.dbItem.resourceSrc[j] + "?v=" + Date.now();
            }
        }

        this.item = {
            id: this.dbItem.id,
            name: this.dbItem.name,
            content: {
                resourceSrc: [this.dbItem.resourceSrc],
                category: this.dbItem.category,
                addr: '충북 충주시 대소원면 대학로 50 ' + this.dbItem.name,
                tel: this.dbItem.tel,
                info: this.dbItem.content
            },
            markers: [
                {
                    lat: this.dbItem.latitude,
                    lng: this.dbItem.longitude
                }
            ],
            // latitude: this.dbItem.latitude,
            // longitude: this.dbItem.longitude,
            issue: this.dbItem.issue,
            icon: ''
        };

        if (this.dbItem.category == '교육시설') this.item.icon = {src: "assets/btn_icon/icon_marker_education.png", size: {width: 40, height: 40}};
        else if (this.dbItem.category == '편의시설') this.item.icon = {src: "assets/btn_icon/icon_marker_convenient.png", size: {width: 40, height: 40}};

        console.log('this.item : ', this.item);

        this.currentResIndex = this.item.content.resourceSrc[0].length > 0 ? 0 : -1;

        console.log(this.currentResIndex);

        for (var i = 0; i < this.item.markers.length; i++) {
            this.markers.push(this.item.markers[i]);
        }

        // this.markers = [
        //     {
        //         lat: this.item.latitude,
        //         lng: this.item.longitude
        //     }
        // ];
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ContentDetailFacility');
    }

    // ionViewDidEnter() {
    //     this.sevReq.getResult("detailfacility", {paramId: this.paramId}, this);
    // }

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

            text = date.getFullYear() + "년 " + (date.getMonth() + 1) + "월 " + date.getDate() + "일 \r\n";
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

        // bigMapModal.onDidDismiss(data => {

        //   // 성공적으로 수정을 완료한 경우
        //   if( data.result == 'success' ) {
        //     console.log('data');
        //   }
        //   else {
        //     console.log('cancel')
        //   }

        // });
        bigMapModal.present();
    }

    // 주변 이슈 클릭 후 detail 페이지로 이동
    viewDetail(issue) {
        this.navCtrl.push(ContentDetail, {id: issue.id});
    }

    update() {

    }

    delete() {

    }

}
