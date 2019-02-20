import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the BigMap page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
 2017.05.18 made by Youngwuk Jeon

 <Update Log>


 */



@IonicPage()
@Component({
  selector: 'page-big-map',
  templateUrl: 'big-map.html',
})
export class BigMap {

  private markers: any[];
  icon: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
    this.markers = navParams.get('markers');
    this.icon = navParams.get('icon');
    console.log('this.markers : ', this.markers);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BigMap');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
