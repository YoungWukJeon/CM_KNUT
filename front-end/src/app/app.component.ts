import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// pages
import { HomePage } from '../pages/home/home';
import { HomeContent } from '../pages/home-content/home-content';
import { HomeMap } from '../pages/home-map/home-map';
import { Login } from '../pages/login/login';
import { UserAgree } from '../pages/user-agree/user-agree';
import { UserEmail } from '../pages/user-email/user-email';
import { UserForm } from '../pages/user-form/user-form';
import { UserInfo } from '../pages/user-info/user-info';
import { UserInfoUpdate } from '../pages/user-info-update/user-info-update';
import { ContentWrite } from '../pages/content-write/content-write';
import { ContentWriteSub } from '../pages/content-write-sub/content-write-sub';
import { ContentLike } from '../pages/content-like/content-like';
import { ContentReplyReply } from '../pages/content-reply-reply/content-reply-reply';
import { ContentReply } from '../pages/content-reply/content-reply';
import { ContentReplyUpdate } from '../pages/content-reply-update/content-reply-update';
import { ContentDetail } from '../pages/content-detail/content-detail';
import { ContentDetailFacility } from '../pages/content-detail-facility/content-detail-facility';
import { ContentSearch } from '../pages/content-search/content-search';
import { UserPwSearch } from '../pages/user-pw-search/user-pw-search';

import { ContentDetailSubContent } from '../pages/content-detail-sub-content/content-detail-sub-content';
import { ContentDetailSubContentResult } from '../pages/content-detail-sub-content-result/content-detail-sub-content-result';

import { Busboard } from '../pages/busboard/busboard';


// providers
import { ServerRequester } from '../providers/server-requester';
import { LocalStorage } from '../providers/local-storage';
import { MenuContent } from '../providers/menu-content';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // rootPage:any = HomePage;
  rootPage: any = HomeContent;
  // rootPage:any = Login;
  // rootPage:any = UserAgree;
  // rootPage:any = UserEmail;
  // rootPage:any = UserForm;
  // rootPage:any = UserInfo;
  // rootPage:any = ContentWrite;
  // rootPage:any = ContentWriteSub;
  // rootPage:any = ContentLike;
  // rootPage:any = ContentReplyReply;
  // rootPage:any = ContentReply;
  // rootPage:any = ContentReplyUpdate;
  // rootPage:any = ContentDetail;
  // rootPage:any = ContentDetailFacility;
  // rootPage:any = ContentSearch;

  // rootPage:any = ContentDetailSubContent;
  // rootPage:any = ContentDetailSubContentResult;


  // rootPage: any = UserPwSearch;

  // rootPage: any = UserInfoUpdate;

  private pages: any[];

  // pages: Array<{title: string, component: any}>;

  private changedPage = null;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private modalCtrl: ModalController,
    private sevReq: ServerRequester,
    private localStorage: LocalStorage,
    private menuContent: MenuContent
  ) {
    this.initializeApp();

    // this.menuContent.setMenuComponent(0, HomePage);
    this.menuContent.setMenuComponent(0, HomeContent);
    this.menuContent.setMenuComponent(1, Busboard);
    this.menuContent.setMenuComponent(2, UserInfo);
    this.menuContent.setMenuComponent(3, Login);

    this.pages = this.menuContent.getPages();

    // set our app's pages
    // this.pages = [
    //   { title: 'Home', component: HomePage },
    //   { title: '버스 시간표', component: Login },
    //   { title: '회원정보', component: UserInfo },
    //   { title: '로그인 및 회원가입', component: Login }
    // ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();


      // this.localStorage.setData("user_no", 1);
      // this.localStorage.clearStorage();

      
      // 현재 로그인이 되어있으면 버튼 이름 수정
      this.localStorage.getData("user_no").then(value => {

        if( value != null ) {
          console.log("user_no: " + value);
          // this.pages[3].title = "로그아웃";
          this.menuContent.changePageTitle(3, "로그아웃");
        }
        else {
          // this.pages[3].title = "로그인 및 회원가입";
          this.menuContent.changePageTitle(3, "로그인 및 회원가입");
        }
      }).catch((error) => {
        console.log(error);
      });
      
    });
  }

  openPage(page) {

    this.changedPage = page;

    this.closePage();

    

    // close the menu when clicking a link from the menu
    // this.menu.close();

    
    // navigate to the new page if it is not the current page

    if( page.title == 'Home' ) {
      this.nav.setRoot(page.component);
    }
    else if( page.title == '버스 시간표' ) {
      // alert('준비중...');
      // return;
      let busModal = this.modalCtrl.create(Busboard);

      busModal.present();
    }
    else if( page.title == '회원정보' ) {

      this.localStorage.getData("user_no").then(value => {

        if( value != null ) {
          console.log("user_no: " + value);
          // // this.sevReq.getResult("userinfo", {user_no: value}, this);
          // this.nav.setRoot(page.component, {user_no: value});

          let userModal = this.modalCtrl.create(UserInfo, {user_no: value});

          userModal.onDidDismiss(data => {
            alert("userModal: ->" + data);
            if( data == 'unlink' ) {
                this.nav.setRoot(this.menuContent.getMenuComponent(0));
            }
          });

          userModal.present();
        }
        else {
          alert('로그인을 해주세요.');
          // // this.nav.setRoot(this.pages[3].component);
          // this.nav.setRoot(this.menuContent.getMenuComponent(3));

          let loginModal = this.modalCtrl.create(Login);

          loginModal.onDidDismiss(result => {
            if( result.user_no != null ) {
              console.log("result=>", result);
              let userModal = this.modalCtrl.create(UserInfo, {user_no: result.user_no});
              userModal.present();

              userModal.onDidDismiss(result => {
                this.localStorage.getData('user_no').then((value) => {
                  if( value != null ) {
                    this.nav.setRoot(this.menuContent.getMenuComponent(0));
                  }
                });
              });
            }
          });

          loginModal.present();
        }
      }).catch((error) => {
        console.log(error);
      });
    }
    else if(page.title == '로그인 및 회원가입') {
      let loginModal = this.modalCtrl.create(Login);
      loginModal.present();

      loginModal.onDidDismiss(result => {
        if( result.user_no != null ) {
          this.nav.setRoot(this.menuContent.getMenuComponent(0));
        }
      });

      
    }
    else if(page.title == '로그아웃') {
      this.localStorage.removeData("user_no");
      this.menuContent.changePageTitle(3, "로그인 및 회원가입");
      this.nav.setRoot(this.menuContent.getMenuComponent(0));
    }
    
    // this.app.getRootNav().push(page.component);
  }

  closePage() {
    this.menu.close();
  }

  // 서버와 통신 결과 실행될 callback 함수
  callback(domainURL: string, link: string, data: any) {
    this.nav.setRoot(this.changedPage.component, {domainURL: domainURL, link: link, data: data});
  }

}
