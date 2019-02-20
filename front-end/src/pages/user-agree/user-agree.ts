import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserEmail } from '../user-email/user-email';

/**
 * Generated class for the UserAgree page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */


/*
2017.05.08 made by Youngwuk Jeon

  <Update Log>

  
*/

@IonicPage()
@Component({
  selector: 'page-user-agree',
  templateUrl: 'user-agree.html',
})
export class UserAgree {

  @ViewChild('allCheck') allCheck;  // 약관의 checkbox
  @ViewChild('nextBtn') nextBtn;  // 다음 button

  items: any[]; // Card에 들어가는 요소들(약관 내용)
  allAgree: boolean = true; // 모든 약관에 동의했는지의 여부

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.items = [
      {title: '약관내용 1', 
      content: 'The British use the term "header", but the American term "head-shot" the English simply refuse to adopt.', 
      checked: false},
      {title: '약관내용 2', 
      content: 'The British use the term "header", but the American term "head-shot" the English simply refuse to adopt.', 
      checked: false},
      {title: '약관내용 3', 
      content: 'The British use the term "header", but the American term "head-shot" the English simply refuse to adopt.', 
      checked: false}
    ];
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad UserAgree');
  }

  // checkbox '선택/해제' 에 대한 클릭 이벤트
  public check(type: string) {

    if( type == "all" ) { // 전체 '선택/해제'에 대한 이벤트
      this.items.forEach((element) => {
        element.checked = this.allCheck.checked;
      });
    }
    else {  // 약관 하나의 '선택/해제'에 대한 이벤트
      var flag = true;  // 모든 약관을 선택했는지 여부

      this.items.forEach((element) => {
        if( !element.checked )
          flag = false;
          
      });

      // 모든 약관이 선택되었으면 전체 checkbox을 선택으로 변환
      if( flag )
        this.allCheck.checked = true;
      else  
        this.allCheck.checked = false;
    }

    // 모든 약관이 선택되었으면 다음 단계 버튼 활성화
    if( this.allCheck.checked )
      this.allAgree = false;
    else
      this.allAgree = true;
  }

  private nextPage() {
    this.navCtrl.push(UserEmail);
  }
}
