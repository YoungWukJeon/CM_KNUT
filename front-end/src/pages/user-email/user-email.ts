import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserForm } from '../user-form/user-form';

// providers
import { ServerRequester } from '../../providers/server-requester';

/**
 * Generated class for the UserEmail page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.05.09 made by Youngwuk Jeon

  <Update Log>
    [2017.05.11]
      1. ViewChild를 이용한 로직을 input 태그 내에 [(ngModel)] 로 변환
    [2017.05.22]
      1. 서버에 해당 메일로 인증번호를 보내는 로직 추가
    [2017.05.30]
      1. 서버 연결로직 별도의 provider로 이동(../../providers/server-requester)
      2. http 부분 모두 제거
*/


@IonicPage()
@Component({
  selector: 'page-user-email',
  templateUrl: 'user-email.html',
})
export class UserEmail {

  private emailAddr: string = "";  // 사용자가 입력한 이메일 주소
  private certNumber: string = ""; // 사용자가 입력한 인증번호

  flag_sn: boolean = false;  // 올바른 인증 메일을 입력했는지 여부(sn : sendNumber)
  flag_np: boolean = true;  // 인증이 되었는지의 여부(np : nextPage)
  flag_ca: boolean = false;  // 인증번호를 입력할 수 있는 영역의 Visibility 여부(ca : certArea)

  private certNum: number;  // 이메일로 발송될 인증번호
  private certTime: any; // 인증번호 입력을 위한 남은 시간 카운트용 변수

  constructor(public navCtrl: NavController, public navParams: NavParams, private sevReq: ServerRequester) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserEmail');
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

    this.sevReq.getResult("checkid", {emailAddr: this.emailAddr, certNum: this.certNum}, this);
  }

  // 서버와 통신 결과 실행될 callback 함수
  callback(domainURL: string, link: string, data: any) {
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
          this.flag_np = true;
          this.flag_sn = false;
          this.certNum = -1;
          clearInterval(this.certTime);

          alert('인증번호 입력 시간이 완료되었습니다. 다시 인증번호를 받으세요.');
        }

      }, 1000);
      
      this.flag_ca = true;  // 인증번호를 입력할 수 있도록 영역을 보이게 함
    }
    else if( data == 'duplicated email' ) {
      this.certNum = -1;
      console.log('중복된 이메일입니다.');
      alert('중복된 이메일입니다.');    
    }
    else {
      this.certNum = -1;
      console.log('전송실패!!');
      alert('유효하지 않은 이메일입니다.');    
    }
  }


  // 인증 번호의 내용을 입력하면 다음 버튼 활성화
  certInput() {
    if( this.certNumber.length > 0 ) {
      this.flag_np = false;
    }
    else {
      this.flag_np = true;
    }
  }

  // 초(second)를 mm:ss 형식으로 변환
  private changeTimeFormat(time: number): string {

    var min = Math.floor(time / 60) >= 10? Math.floor(time / 60): "0" + Math.floor(time / 60);
    var sec = time % 60 >= 10? time % 60: "0" + time % 60;

    return min + ":" + sec;
  }

  // 모든 인증이 완료후 다음페이지로 이동
  private nextPage() {

    // 인증번호와 입력한 번호가 일치하는지 확인
    if( this.certNum != -1 && this.certNum == Number.parseInt(this.certNumber) ) {
      console.log("인증 완료");
      clearInterval(this.certTime);
      this.flag_np = true;
      this.flag_ca = false;
      this.flag_sn = false;
      this.certNum = -1;
      this.certNumber = "";
      this.navCtrl.push(UserForm, {emailAddr: this.emailAddr});
    } else {
      console.log("인증 번호 불일치");
    }

  }

}