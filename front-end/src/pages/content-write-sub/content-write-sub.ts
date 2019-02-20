import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

/**
 * Generated class for the ContentWriteSub page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.05.15 made by Youngwuk Jeon

  <Update Log>
    [2017.06.06]
      1. 글의 유효성 검사 추가
  
*/


@IonicPage()
@Component({
  selector: 'page-content-write-sub',
  templateUrl: 'content-write-sub.html',
})
export class ContentWriteSub {

  private type: string = "";  // 어떤 종류의 추가 기능인지 저장
  private title: string = ""; // 추가 기능의 제목
  private contents: any[] = []; // 추가 기능의 내용

  private voteMaxCount: number = 15; // 투표 내용의 최대 수
  private surveyMaxCount: number = 10;  // 설문 조사 내용의 최대 수
  private startDate;  // 기능 시작일
  private endDate;  // 기능 종료일
  private peopleCount: number = 10;  // 기능에 참여할 수 있는 사람수

  private method: string = "time";  // 기능 만료 형태(time || people)

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public alertCtrl: AlertController) {
    this.type = navParams.get('type')

    // 추가 기능 내용 수정으로 인한 호출
    if( this.type == null ) {
      // 이전의 내용을 파싱
      let subContent = JSON.parse(navParams.get('subContent'));

      this.title = subContent.title;
      this.type = subContent.type;
      this.contents = subContent.content;
      this.method = subContent.method;
      this.startDate = subContent.startDate;
      this.endDate = subContent.endDate;
      this.peopleCount = subContent.peopleCount;
    }

    console.log('params', this.type);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentWriteSub');
  }

  // 항목 추가
  addItem(addType: string = null) {

    /*
    addType
    - mc(multiple choice) : 객관식
    - sc(single choice) : 주관식
    - rb(radio button) : 선택형(택1)
    - cb(checkbox) : 선택형(다중)
    */

    if( this.type == 'vote' ) {
      this.contents.push({
        no: this.getEmptyNo(),
        content: "",
      });
    }
    else if( this.type == "survey" ) {

      var typename; // 추가 서브 타입의 한글명
      var maxSubCount;  // 추가 서브 타입의 생성 최대 수

      switch(addType) {
        case 'mc':
          typename = "객관식";
          maxSubCount = 10;
          break;
        case 'sc':
          typename = "주관식";
          maxSubCount = 0;
          break;
        case 'rb':
          typename = "택1";
          maxSubCount = 10;
          break;
        case 'cb':
          typename = "다중";
          maxSubCount = 10;
          break;
      }

      this.contents.push({
        no: this.getEmptyNo(),
        title: "",
        type: addType,
        typename: typename,
        necessity: false,
        maxSubCount: maxSubCount,
        content: []
      });
    }

    // 항목 번호에 따라 정렬
    this.contents = this.contents.sort((a, b) => a.no - b.no);
  }

  // 서브 항목 추가
  addSubItem(item) {
    item.content.push({
      no: this.getEmptyNo(item),
      content: ""
    });

    // 항목 번호에 따라 정렬
    item.content = item.content.sort((a, b) => a.no - b.no);
  }

  // 항목 제거
  removeItem(item) {
    this.contents.splice(this.contents.indexOf(item), 1);
  }

  // 서브 항목 제거
  removeSubItem(parentItem, item) {
    parentItem.content.splice(parentItem.content.indexOf(item), 1);
  }

  // 항목 번호에서 비어있는 번호를 반환
  getEmptyNo(item: any = null): number {

    var index = 1;

    if( item == null ) {
      this.contents.some((element) => {
        if( element.no != index ) {
          return true;
        }
        index++;
      });
    }
    else {
      item.content.some((element) => {
        if( element.no != index ) {
          return true;
        }
        index++;
      });
    }

    return index;
  }

  // 항목의 필수여부 변경
  changeNecessity(item) {
    item.necessity = !item.necessity;
  }

  // 인원수 변경 alert 호출
  changePeopleCount() {
    // changeAlert 관련된 css는 ../app.scss 파일 참조
    let changeAlert = this.alertCtrl.create({
      title: '인원수 변경',
      message: '참여 인원을 변경해보세요.',
      cssClass: 'custom_alert',
      inputs: [
        {
          name: 'peopleCount',
          placeholder: '10 ~ 1000명',
          type: 'number',
          value: this.peopleCount + '',
        }
      ],
      buttons: [
        {
          text: '취소',
          role: 'cancel',
          cssClass: 'custom_alert_btn',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: '확인',
          cssClass: 'custom_alert_btn',
          handler: data => {  
            console.log(data);

            if( data.peopleCount >= 10 && data.peopleCount <= 1000 )
              this.peopleCount = data.peopleCount;
            else {
              changeAlert.setMessage("범위에 맞는 숫자를 입력하세요.");
              return false;
            }
          }
        }
      ]
    });
    changeAlert.present();
  }

  // modal 창이 닫힐 때의 이벤트
  dismiss(result: boolean) {
    console.log('dismiss', result);

    var data; // 반환할 데이터

    if( result ) {


    /******************************************************
    *                                                     *
    *       모든내용이 채워졌는지 확인하는 로직이 필요,       *
    *            빈 번호들을 당기는 로직도 필요              *
    *                                                     *
    ******************************************************/

      // console.log(this.startDate);

      if( this.title == null || this.title.trim().length == 0 ) {
        console.log("[필수] 제목 입력");
        return;
      }

      var index = 1;
      var tempContents: any[] = [];

      if( this.type == "vote" ) {
        this.contents.forEach((element) => {
          if( element.content.trim() != "" ) {
            tempContents.push(element);
            tempContents[tempContents.length - 1].no = index++;
          }
        });
      }
      else if( this.type == "survey" ) {
        this.contents.forEach((element) => {
          if( element.title.trim() != "" ) {
            tempContents.push(element);
            tempContents[tempContents.length - 1].no = index++;

            // 주관식을 제외한 나머지의 경우 하위 항목이 존재하기 때문에 검사
            if( tempContents[tempContents.length - 1].type != "sc" ) {
              var sub_index = 1;
              var sub_tempContents: any[] = [];

              // 하위 항목들 인덱스 조정
              tempContents[tempContents.length - 1].content.forEach((item) => {
                if( item.content.trim() != "" ) {
                  sub_tempContents.push(item);
                  sub_tempContents[sub_tempContents.length - 1].no = sub_index++;
                }
              });

              // 하위 내용이 없으면 title이 있더라도 설문에서 제거
              if( sub_tempContents.length > 0 ) {
                tempContents[tempContents.length - 1].content = sub_tempContents;
              }
              else {
                tempContents.pop();
                index--;
              }
            }
          }
        });
      }

      if( tempContents.length < 1 ) {
        console.log("[필수] 내용이 최소 1개 이상은 있어야 함");
        return;
      }

      if( this.type == "vote" && tempContents.length < 2 ) {
        console.log("[필수] 투표의 경우 내용이 최소 2개 이상은 있어야 함");
        return;
      }

      if( this.method == "time" && this.startDate == null ) {
        console.log("[필수] 시간 종료시 시작시간 필요");
        return;
      }

      if( this.method == "time" && this.endDate == null ) {
        console.log("[필수] 시간 종료시 종료시간 필요");
        return;
      }

      data = new Object();
      data.title = this.title;
      data.type = this.type;
      data.content = tempContents;
      data.method = this.method;
      data.startDate = this.startDate;
      data.endDate = this.endDate;
      data.peopleCount = this.peopleCount;
      data = JSON.stringify(data);
    }
    else {
      data = null;
    }

    this.viewCtrl.dismiss(data);
  }

}
