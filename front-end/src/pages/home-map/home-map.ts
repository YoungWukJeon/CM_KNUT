import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, App} from 'ionic-angular';

// pages
import {ContentSearch} from '../content-search/content-search';
import {HomeContent} from '../home-content/home-content';
import {ContentDetail} from '../content-detail/content-detail';
import {ContentDetailFacility} from '../content-detail-facility/content-detail-facility';

// providers
import {ServerRequester} from '../../providers/server-requester';

/**
 * Generated class for the HomeMap page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-home-map',
    templateUrl: 'home-map.html',
})
export class HomeMap {

    markers: any[];
    dbItem: any;

    constructor(public navCtrl: NavController, private app: App, public navParams: NavParams, private sevReq: ServerRequester) {

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

    ionViewDidEnter() {
        console.log('home-map.ts');

        this.sevReq.getResult("homemap", {}, this);
    }

    callback(domainURL: string, link: string, data: any) {

        this.dbItem = data;

        // console.log('item : ', this.dbItem);
        this.markers = [];

        for (var i = 0; i < this.dbItem[0].length; i++) {
            this.markers.push({
                id: this.dbItem[0][i].id,
                category: this.dbItem[0][i].category,
                latitude: this.dbItem[0][i].latitude,
                longitude: this.dbItem[0][i].longitude,
                type: this.dbItem[0][i].type,
                icon: ''
            });

            if (this.dbItem[0][i].type == 'facilityboard') {

                if (this.dbItem[0][i].category == '교육시설') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_education.png", size: {width: 40, height: 40}};
                else if (this.dbItem[0][i].category == '편의시설') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_convenient.png", size: {width: 40, height: 40}};

            } else if (this.dbItem[0][i].type == 'userboard') {

                if (this.dbItem[0][i].category == '공지') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_notice.png", size: {width: 40, height: 40}};
                else if (this.dbItem[0][i].category == '이벤트') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_event.png", size: {width: 40, height: 40}};
                else if (this.dbItem[0][i].category == '일상') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_daily.png", size: {width: 40, height: 40}};
                else if (this.dbItem[0][i].category == '건의') this.markers[i].icon = {src: "assets/btn_icon/icon_marker_suggest.png", size: {width: 40, height: 40}};

            }
        }

        console.log('this.markers : ', this.markers);
    }

    clickMarker(marker){
        
        if(marker.type == 'facilityboard'){
            // this.app.getRootNav().push(ContentDetailFacility, {
            //     id: marker.id
            // });
            this.navCtrl.push(ContentDetailFacility, {
                id: marker.id
            })
        }
        else if(marker.type == 'userboard'){
            // this.app.getRootNav().push(ContentDetail, {
            //     id: marker.id
            // });
            this.navCtrl.push(ContentDetail, {
                id: marker.id
            })
        }
    }


    ionViewDidLoad() {
        console.log('ionViewDidLoad HomeMap');
    }

}
