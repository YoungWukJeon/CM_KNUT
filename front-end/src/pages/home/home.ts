import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

// pages
import {HomeMap} from '../home-map/home-map';
import {HomeContent} from '../home-content/home-content';
// import { ContentDetail } from '../content-detail/content-detail';
import {ContentSearch} from '../content-search/content-search';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    tab1Root: any;
    tab2Root: any;

    constructor(public navCtrl: NavController) {
        // window.location.reload();
        this.tab1Root = HomeContent;
        this.tab2Root = HomeMap;
    }

    bounds_changed(event) {

        console.log(event);

    }

    // ngOnInit() {
    //     console.log('ngOnInit()');
    //
    //     this.tab1Root = HomeContent;
    //     this.tab2Root = HomeMap;
    // }
    //
    // onPageWillEnter() {
    //     console.log('onPageWillEnter()');
    //
    //     this.tab1Root = HomeContent;
    //     this.tab2Root = HomeMap;
    //     // You can execute what you want here and it will be executed right before you enter the view
    // }

    ionViewWillEnter() {
        console.log('home.ts');

        // window.location.reload();

        // this.navCtrl.setRoot(this.navCtrl.getActive().component);
        // this.tab1Root;
        // this.tab2Root;

        // HomeContent = "";

        // this.tab1Root = null;
        // this.tab2Root = null;
        // this.tab1Root = HomeContent;
        // this.tab2Root = HomeMap;
        // this.navCtrl.setRoot(HomePage);
    }

    // ionViewWillLeave(){
    //     console.log('ionViewWillLeave()');
    //
    //     this.navCtrl.getActiveChildNav();
    //
    //     this.tab1Root = null;
    //     this.tab2Root = null;
    // }

    content_search() {
        this.navCtrl.push(ContentSearch);
    }

    // navigate() {
    //   this.navCtrl.push(ContentDetail, {
    //       item: item
    //     });
    //   alert('호출호출');
    // }

}
