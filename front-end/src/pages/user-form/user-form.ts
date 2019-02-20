import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// pages
import { Login } from '../login/login';

// providers
import { ServerRequester } from '../../providers/server-requester';

/**
 * Generated class for the UserForm page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


/*
2017.05.11 made by Youngwuk Jeon

  <Update Log>
    [2017.05.22]
      1. user-email에서 인증된 이메일을 navParams로 받음
      2. 입력 데이터들의 유효성 판단
      3. 서버와 통신 부분 구현
    [2017.05.30]
      1. 서버 연결로직 별도의 provider로 이동(../../providers/server-requester)
      2. http 부분 모두 제거

*/



@IonicPage()
@Component({
  selector: 'page-user-form',
  templateUrl: 'user-form.html',
})
export class UserForm {

  flag_c: boolean = true;  // 모든 내용을 입력했는지 여부(c : complete)

  private id: string;                 // 사용자의 인증된 이메일
  private name: string;               // 사용자 이름
  private gender: string;             // 사용자 성별
  private birth: string;              // 사용자 생년월일
  private pw: string;                 // 사용자 패스워드
  private pwconfirm: string;          // 사용자 패스워드 확인

  constructor(public navCtrl: NavController, public navParams: NavParams, private sevReq: ServerRequester) {
    this.id = navParams.get("emailAddr");
    console.log(this.id);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserForm');
  }

  // input 속성들의 값들이 변했을 때 발생하는 이벤트
  change() {

    if( this.name == null || this.name.trim().length == 0 ) {
      console.log("[필수] 이름(닉네임) 입력");
      this.flag_c = true;
      return;
    }

    if( this.gender == null || this.gender.trim().length == 0 ) {
      console.log("[필수] 성별 입력");
      this.flag_c = true;
      return;
    }

    if( this.birth == null ) {
      console.log("[필수] 생년월일 입력");
      this.flag_c = true;
      return;
    }

    if( this.pw == null || this.pw.trim().length == 0 ) {
      console.log("[필수] 비밀번호 입력");
      this.flag_c = true;
      return;
    }

    if( this.pwconfirm == null || this.pwconfirm.trim().length == 0 ) {
      console.log("[필수] 비밀번호 확인 입력");
      this.flag_c = true;
      return;
    }

    if( this.pw != this.pwconfirm ) {
      console.log("비밀번호 불일치!!");
      this.flag_c = true;
      return;
    }

    // 모든 내용이 완벽히 입력되면 '완료' 버튼 활성화
    this.flag_c = false;

  }

  // 완료 버튼을 클릭했을 경우 이벤트
  complete() {

    console.log("name", this.name);
    console.log("gender", this.gender);
    console.log("birth", this.birth);
    console.log("pw", this.pw);
    console.log("pwconfirm", this.pwconfirm);

    let body = {
      type: 's',  // 자체회원가입(self)
      id: this.id,
      name: this.name,
      gender: this.gender,
      birth: this.birth,
      pw: this.pw
    };

    this.sevReq.getResult("createuser", body, this);

  }

  // 서버와 통신 결과 실행될 callback 함수
  callback(domainURL: string, link: string, data: any) {
    if( data == 'success' ) {
        // alert('전송완료!!');
        console.log('전송완료!!');
        alert('회원가입을 축하드립니다.');
        /*********************************************/
        // 회원가입이 되었다는 페이지로 이동
        /********************************************/
        this.navCtrl.setRoot(Login);
      }
      else {
        console.log('전송실패!!');        
      }
  }

}