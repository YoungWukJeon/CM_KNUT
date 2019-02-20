import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ContentReplyUpdate page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-content-reply-update',
  templateUrl: 'content-reply-update.html',
})
export class ContentReplyUpdate {

  private content: string = "";  // 수정된 내용

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {

    this.content = navParams.get('content');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentReplyUpdate');
  }

  dismiss(result: boolean) {

    if( result ) {
      /******************************************************
      *                                                     *
      *          서버로 답글을 전송하는 로직이 필요            *
      *                                                     *
      ******************************************************/
      this.viewCtrl.dismiss({result: 'success', content: this.content});
    }
    else {
      this.viewCtrl.dismiss({result: 'cancel'});
    }
  }

}
