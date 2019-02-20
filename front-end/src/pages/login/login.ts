import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController } from 'ionic-angular';

import { GooglePlus } from '@ionic-native/google-plus';

// pages
import { UserAgree } from '../user-agree/user-agree';
import { UserInfo } from '../user-info/user-info';
import { UserPwSearch } from '../user-pw-search/user-pw-search';

// providers
import { ServerRequester } from '../../providers/server-requester';
import { LocalStorage } from '../../providers/local-storage';
import { MenuContent } from '../../providers/menu-content';
import { InAppBrowserHandler } from '../../providers/in-app-browser-handler';


/**
 * Generated class for the Login page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.05.07 made by Youngwuk Jeon

  <Update Log>
    [2017.05.23]
      1. 서버 로직 추가
    [2017.06.02]
      1. 서버 연결로직 별도의 provider로 이동(../../providers/server-requester)
      2. 로그인시 menu에 존재하는 '로그인/회원가입'의 메뉴이름을 '로그아웃'으로 변경
      3. http 부분 모두 제거
      4. inAppBrowser 부분 provider로 이동(../../providers/in-app-browser-handler)
    [2017.06.04]
      1. 로그인시 userinfo 로 이동할 때 user_no만 navParams로 넘겨서 처리
    [2017.06.26]
      1. modal 형식으로 바꾸기
    [2017.06.29]
      1. google plus 로그인 추가
*/


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class Login {

  private email: string;
  private password: string;

  private user_no: number = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, private platform: Platform, private viewCtrl: ViewController,
  private sevReq: ServerRequester, private localStorage: LocalStorage, private menuContent: MenuContent, 
  private iabh: InAppBrowserHandler) {
    // private googlePlus: GooglePlus, 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
  }

  private regist() {
    this.navCtrl.push(UserAgree);
  }

  private login() {

    if( this.email == null || this.email.trim() == "" ) {
      console.log("아이디 입력 필요!!");
      return;
    }
    
    if( this.password == null || this.password.trim() == "" ) {
      console.log("비밀번호 입력 필요!!");
      return;
    }
    
    this.sevReq.getResult("login", {email: this.email, password: this.password}, this);
  }

  // 서버와 통신 결과 실행될 callback 함수
  callback(domainURL: string, link: string, data: any) {
    if( link == "login" ) {
      if( data == "fail" ) {
        console.log("로그인 실패");
        alert("로그인 실패! 로그인정보를 확인해주세요.");
      }
      else {
        console.log(data);
        alert("로그인 성공");
        this.user_no = data.user_no;
        // this.sevReq.getResult("userinfo", {user_no: data.user_no}, this);
        this.menuContent.changePageTitle(3, "로그아웃");
        this.localStorage.setData("user_no", data.user_no);
        this.dismiss();
      }
    }
    // else if( link == "userinfo" ) {
    //   this.menuContent.changePageTitle(3, "로그아웃");
    //   this.localStorage.setData("user_no", data.user_no);
    //   // this.navCtrl.setRoot(UserInfo, {domainURL: domainURL, link: link, data: data});
    //   this.navCtrl.setRoot(UserInfo, {user_no: data.user_no});
      
    // }
  }

  public tpLogin(type: string) {

    console.log('type: ', type);

    if( type == 'google' ) {
      alert('준비중...');

      // this.googlePlus.login({}).then(res => {
      //   // console.log(res);
      //   alert(JSON.stringify(res));
      // }).catch(err => {
      //   console.error(err);
      // });

      return;
    }

    this.platform.ready().then(() => {
      this.iabh.tpLoginConnection(type).then(data => {
        console.log(data);
        alert("로그인 성공");
        // alert(data);
        this.user_no = data;
        // this.sevReq.getResult("userinfo", {user_no: data}, this);
        this.menuContent.changePageTitle(3, "로그아웃");
        this.localStorage.setData("user_no", data);
        this.dismiss();
      }, (error) => {
        alert(error);
      });
    });
  }

  resetPw() {
    this.navCtrl.push(UserPwSearch);
  }

  dismiss() {
      this.viewCtrl.dismiss({user_no: this.user_no});
  }
}
