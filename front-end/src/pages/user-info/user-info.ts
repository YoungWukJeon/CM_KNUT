import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

// pages
import { ContentSearch } from '../content-search/content-search';
import { ContentWrite } from '../content-write/content-write';
import { ContentDetail } from '../content-detail/content-detail';
import { UserInfoUpdate } from '../user-info-update/user-info-update';

// provider
import { ServerRequester } from '../../providers/server-requester';
import { LocalStorage } from '../../providers/local-storage';
import { MenuContent } from '../../providers/menu-content';

/**
 * Generated class for the UserInfo page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


/*
2017.05.11 made by Youngwuk Jeon

  <Update Log>
    [2017.05.18]
      1. header의 찾기 버튼 기능 추가(content_search 메소드)
    [2017.05.20]
      1. HTTP plugin 추가
    [2017.05.21]
      1. 게시글로 이동하는 기능 추가(viewDetail 메소드)
      2. 게시글 쓰기로 이동하는 기능 추가(wrtie 메소드)
      3. 회원정보 수정하기로 이동하는 기능 추가(update 메소드)
        - 페이지가 없어서 메소드만 구현
    [2017.05.23]
      1. Thirdparty 로그인의 이미지들을 위한 이미지 경로 설정 변경(domainURL 제거)
      2. 프로필 이미지와 배경 이미지가 없는 회원을 위한 기본이미지 경로 설정
    [2017.05.30]
      1. 서버 연결로직 별도의 provider로 이동(../../providers/server-requester)
      2. 이전 페이지에서 본 페이지로 넘어올 때 navParams로 값을 넘겨받는 로직으로 변경
      3. http 부분 모두 제거
    [2017.06.04]
      1. 이전 페이지에서 모든 정보를 받아오는 것에서 navParams에서 user_no만 받아온 후 본 페이지에서 서버 호출 로직으로 변경
    [2017.06.26]
      1. 회원정보를 보려는 사용자가 본인이 아닐경우에 수정하기와 글쓰기 버튼 삭제
      2. modal 형식으로 바꾸기
    [2017.07.03]
      1. 성별과 생년월일 추가
      2. 회원 정보 수정 기능 추가
    [2017.07.04]
      1. 게시글 쓰기 부분을 현재 유저 정보의 modal을 닫고 이동
    [2017.07.12]
      1. 회원탈퇴 로직 추가
*/


@IonicPage()
@Component({
  selector: 'page-user-info',
  templateUrl: 'user-info.html',
})
export class UserInfo {

  private userinfo: any = {
    nickname: "",
    bgImg: "assets/image/bg_gray.png",
    profileImg: "assets/image/bg_gray.png",
    type: "",
    gender: "",
    birth: "",
    age: "",
    info: "",
    intro: "",
    contents: [],
    pw: ''
  };

  // 자신의 사용자 정보인지 확인
  private myInfo: boolean = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, 
    private alertCtrl: AlertController, private sevReq: ServerRequester, private localStorage: LocalStorage, private menuContent: MenuContent) {

    // var domainURL = this.navParams.get('domainURL');
    // var link = this.navParams.get('link');
    // var data = this.navParams.get('data');

    // console.log('domainURL: ', domainURL);
    // console.log('link: ', link);
    // console.log('data: ', data);
    
  }

  callback(domainURL: string, link: string, data: any) {

    if( data == 'Empty Set!!' ) {
      alert('존재하지 않는 회원이거나 탈퇴한 회원입니다.');
      this.dismiss('unlink');
      return;
    }

    if( link == 'userunlink' ) {
      alert('탈퇴가 완료되었습니다.');
      this.localStorage.removeData("user_no");
      this.menuContent.changePageTitle(3, "로그인 및 회원가입");
      this.dismiss('unlink');
    }
    else if( link == 'userinfo' ) {
      this.userinfo = {
        nickname: data.nickname,
        bgImg: domainURL + data.bgImg[0] + "?v=" + Date.now(),
        profileImg: domainURL + data.profileImg[0] + "?v=" + Date.now(),
        type: data.type,
        gender: (data.gender != null)? (data.gender == 'male')? '남성': '여성': null,
        birth: (data.birth != null)? (data.birth.substring(0, 4) + "년 " + data.birth.substring(5, 7) + "월 " + data.birth.substring(8, 10) + "일"): null,
        age: '',
        info: data.info,
        intro: data.intro,
        contents: data.contents,
        pw: data.pw
      };


      // 생년월일을 이용하여 나이 계산
      this.userinfo.age = data.birth != null? ((new Date().getFullYear() - data.birth.substring(0, 4)) + 1): '';

      // 자체 회원가입이 아니면
      if( this.userinfo.type != 's' && !this.userinfo.profileImg.includes('res/images/profile/') ) {
        this.userinfo.profileImg = this.userinfo.profileImg.replace(domainURL, "");
        // this.userinfo.bgImg = this.userinfo.bgImg.replace(domainURL, "");
      }
      
      console.log('확인: ', data.profileImg[0]);

      if( data.profileImg[0] == null || data.profileImg[0] == "" || data.profileImg[0] == 'undefined' ) {
        this.userinfo.profileImg = "assets/image/profile_default.png";
      }

      console.log(data.profileImg[0]);

      if( data.bgImg[0] == null || data.bgImg[0] == "" || data.bgImg[0] == 'undefined' ) {
        this.userinfo.bgImg = "assets/image/bg_gray.png";
      }

      // info에서 마지막 세미콜론(;) 제거
      this.userinfo.info = this.userinfo.info.substring(0, this.userinfo.info.length - 1);

      // this.userinfo.info = this.userinfo.info.replace("/\n/gi", " | newline");

      console.log(this.userinfo);
    }

  }

  ionViewDidEnter() {
    if( this.navParams.get('myInfo') != null ) {
      this.myInfo = this.navParams.get('myInfo');
    }

    this.sevReq.getResult("userinfo", {user_no: this.navParams.get('user_no')}, this);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserInfo');
  }

  content_search() {
    this.navCtrl.push(ContentSearch);
  }

  write() {
    this.viewCtrl.dismiss();
    this.navCtrl.push(ContentWrite);
  }

  update() {
    this.navCtrl.push(UserInfoUpdate, {user_no: this.navParams.get('user_no'), userinfo: this.userinfo});
  }

  unlink() {
    let alert = this.alertCtrl.create({
        title: '회원탈퇴',
        message: '정말로 탈퇴하시겠습니까?',
        cssClass: 'custom_alert',
        buttons: [
            {
                text: '아니요',
                role: 'cancel',
                cssClass: 'custom_alert_btn',
                handler: () => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: '네',
                cssClass: 'custom_alert_btn',
                handler: () => {
                    console.log('Expire clicked');

                    let body = {
                      user_no: this.navParams.get('user_no'),
                      domainURL: this.sevReq.getDomainURL(),
                      postId: [],
                      resourceSrc: [
                        {
                          src: this.userinfo.profileImg,
                          kind: 'usrp'
                        },
                        {
                          src: this.userinfo.bgImg,
                          kind: 'usrb'
                        }
                      ]
                    }

                    this.userinfo.contents.forEach((element) => {
                      body.postId.push(element.id);
                    });

                    this.sevReq.getResult("userunlink", body, this);
                }
            }
        ]
    });
    alert.present();
  }

  viewDetail(issue) {
    this.navCtrl.push(ContentDetail, {id: issue.id});
  }

  dismiss(msg: string = null) {
    this.viewCtrl.dismiss(msg);
  }

}
