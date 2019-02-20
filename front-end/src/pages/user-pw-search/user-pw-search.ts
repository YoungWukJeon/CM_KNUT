import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// providers
import { ServerRequester } from '../../providers/server-requester';

/*
2017.06.28 made by Youngwuk Jeon

  <Update Log>
    
*/

/**
 * Generated class for the UserPwSearch page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-user-pw-search',
  templateUrl: 'user-pw-search.html',
})
export class UserPwSearch {

  private emailAddr: string = "";  // 사용자가 입력한 이메일 주소
  private certNumber: string = ""; // 사용자가 입력한 인증번호

  private pw: string;                 // 사용자 패스워드
  private pwconfirm: string;          // 사용자 패스워드 확인

  flag_sn: boolean = false;  // 올바른 인증 메일을 입력했는지 여부(sn : sendNumber)
  flag_c1: boolean = true;  // 인증이 되었는지의 여부(c1 : confirm)
  flag_c2: boolean = false; // 비밀번호를 제대로 입력했는지 여부(c2 : confirm)
  flag_ca: boolean = false;  // 인증번호를 입력할 수 있는 영역의 Visibility 여부(ca : certArea)

  private certNum: number;  // 이메일로 발송될 인증번호
  private certTime: any; // 인증번호 입력을 위한 남은 시간 카운트용 변수

  constructor(public navCtrl: NavController, public navParams: NavParams, private sevReq: ServerRequester) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPwSearch');
  }

  // 사용자가 입력한 메일로 인증번호를 발송
  private sendNumber() {

    if( this.emailAddr == null || this.emailAddr.trim().length == 0 ) {
      console.log("[필수] 이메일 입력");
      return;
    }

    // 인증번호 만들기
    this.certNum = Math.floor((Math.random() * 100));
    console.log(this.certNum);

    this.sevReq.getResult("pwsearch", {emailAddr: this.emailAddr, certNum: this.certNum}, this);
    // this.callback("http://localhost:3200/", "pwsearch", "success");
  }

  // 서버와 통신 결과 실행될 callback 함수
  callback(domainURL: string, link: string, data: any) {

    if( link == 'pwsearch' ) {
      if( data == 'success' ) {
        // alert('전송완료!!');
        console.log('전송완료!!');

        this.flag_sn = true; // 인증번호 무단 재전송을 방지
        var certCount = 300;  // 인증번호 남은 시간(최초 5분 = 300초)

        this.certTime = setInterval(() => {

          // UI단의 남은 시간 갱신
          // {{}} 이용하여 태그내에서의 바운딩을 하려했으나 UI적으로 최초에는 나타나지만 갱신이 안됨
          document.getElementById('remainCount').innerText = this.changeTimeFormat(certCount);
          
          console.log("certCount", certCount);
          certCount--;

          if( certCount == -1 ) {
            console.log("Timeout!! Expire number");
            document.getElementById('remainCount').innerText = "시간 만료";
            
            this.flag_ca = false;
            this.flag_c1 = true;
            this.flag_sn = false;
            this.certNum = -1;
            clearInterval(this.certTime);

            alert('인증번호 입력 시간이 완료되었습니다. 다시 인증번호를 받으세요.');
          }

        }, 1000);
        
        this.flag_ca = true;  // 인증번호를 입력할 수 있도록 영역을 보이게 함
      }
      else if( data == 'does not exist' ) {
        this.certNum = -1;
        console.log('가입되지 않은 이메일입니다.');
        alert('가입되지 않은 이메일입니다.');    
      }
      else {
        this.certNum = -1;
        console.log('전송실패!!');
        alert('유효하지 않은 이메일입니다.');    
      }
    }
    else if( link == 'updatepw' ) {
      if( data == 'success' ) {
        alert("비밀번호가 변경되었습니다.");
        this.navCtrl.pop();
      }
      else {
        alert('오류가 발생했습니다. 다시 시도해 주세요.');
      }
    }
  }


  // 인증 번호의 내용을 입력하면 다음 버튼 활성화
  certInput() {
    if( this.certNumber.length > 0 ) {
      this.flag_c1 = false;
    }
    else {
      this.flag_c1 = true;
    }
  }

  // 초(second)를 mm:ss 형식으로 변환
  private changeTimeFormat(time: number): string {

    var min = Math.floor(time / 60) >= 10? Math.floor(time / 60): "0" + Math.floor(time / 60);
    var sec = time % 60 >= 10? time % 60: "0" + time % 60;

    return min + ":" + sec;
  }

  // input 속성들의 값들이 변했을 때 발생하는 이벤트
  change() {

    if( this.pw == null || this.pw.trim().length == 0 ) {
      console.log("[필수] 비밀번호 입력");
      this.flag_c1 = true;
      return;
    }

    if( this.pwconfirm == null || this.pwconfirm.trim().length == 0 ) {
      console.log("[필수] 비밀번호 확인 입력");
      this.flag_c1 = true;
      return;
    }

    if( this.pw != this.pwconfirm ) {
      console.log("비밀번호 불일치!!");
      this.flag_c1 = true;
      return;
    }

    // 모든 내용이 완벽히 입력되면 '완료' 버튼 활성화
    this.flag_c1 = false;

  }

  // 모든 인증이 완료후 다음페이지로 이동
  private confirm() {

    // 비밀번호 변경이 활성화 되어있을 경우
    if( this.flag_c2 ) {
      // console.log(this.emailAddr);
      this.sevReq.getResult("updatepw", {emailAddr: this.emailAddr, pw: this.pw}, this);
      return;
    }

    // 인증번호와 입력한 번호가 일치하는지 확인
    if( this.certNum != -1 && this.certNum == Number.parseInt(this.certNumber) ) {
      console.log("인증 완료");
      clearInterval(this.certTime);
      this.flag_c1 = true;
      this.flag_c2 = true;
      this.flag_ca = false;
      this.flag_sn = false;
      this.certNum = -1;
      this.certNumber = "";
    } else {
      console.log("인증 번호 불일치");
    }

  }


}
