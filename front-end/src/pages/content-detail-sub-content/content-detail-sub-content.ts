import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

// providers
import {ServerRequester} from '../../providers/server-requester';

/**
 * Generated class for the ContentDetailSubContent page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.06.08 made by Youngwuk Jeon

  <Update Log>
    
*/


@IonicPage()
@Component({
  selector: 'page-content-detail-sub-content',
  templateUrl: 'content-detail-sub-content.html',
})
export class ContentDetailSubContent {

  private item: any = {
    id: 0,
    ub_id: 0,
    expired: 0,
    title: "",
    content: [],
    end_time: 0,
    start_time: 0,
    peopleCount: 0,
    type: "",
    method: "",
    count: 0
  };

  private user_no: number;
  private ub_id: number;

  private vote_result: number = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController,
  private sevReq: ServerRequester) {
    
    this.user_no = this.navParams.get('user_no');
    this.ub_id = this.navParams.get('id');

    // this.user_no = 9;
    // this.ub_id = 36;

    console.log("user_no: ", this.user_no);
    console.log("ub_id: ", this.ub_id);

    this.sevReq.getResult("subcontent", {user_no: this.user_no, ub_id: this.ub_id}, this);

    // 
  }

  callback(domainURL: string, link: string, data: any) {

    console.log(data);

    if( link == "subcontent" ) {
      if( data.result == 'not exists' ) {
        alert('해당 투표 / 설문조사가 존재하지 않거나 삭제되었습니다.');
        this.dismiss('not exists');
        return;
      }
      else if( data.result == "duplicated" ) {
        alert("이미 하셨습니다.");
        this.dismiss('duplicated');
        return;
      }
      else {
        this.item = data;

        if( this.item.type == 'survey' ) {
          this.item.content.forEach((element1) => {
            if( element1.type != 'sc' ) {
              element1.content.forEach((element2) => {
                element2.checked = false;
              })
            }
            else if( element1.type == 'sc' ) {
              element1.answer = "";
            }
          });
        }

        if( !this.canPost() ) {
          return;
        }
      }
    }
    else if( link == "subcontentexec" ) {

      if( data.result == "expired" ) {
        alert("만료되어 참여할 수 없습니다.");
        this.item.expired = 1;
        return;
      }

      alert("완료했습니다.");
      this.dismiss();
    }
  }

  canPost(isUI: boolean = false): boolean {

    if( !isUI ) {
      if( this.item.method == 'time' && this.item.start_time > (Date.now() + new Date().getTimezoneOffset() * 60000) ) {
        alert('아직 시작하지 않아서 참여할 수 없습니다.');
        return false;
      }

      if( this.item.expired == 1 ) {
        alert('만료되어 참여할 수 없습니다.');
        return false;
      }
    }
    else {
      if( this.item.method == 'time' && this.item.start_time > (Date.now() + new Date().getTimezoneOffset() * 60000) ) {
        return false;
      }

      if( this.item.expired == 1 ) {
        return false;
      }
    }

    return true;
  }

  getTimeText(time: number): string {

    // var now = new Date();
    // var nowLocalTime = now.getTime() - now.getTimezoneOffset() * 60000;

    var text = "";
    var date = new Date(time);

    text = date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate() + ".";
    text += (date.getHours() >= 12) ? ((date.getHours() != 12) ? "오후 " + (date.getHours() - 12) + ":" : "오후 12:") : "오전 " + date.getHours() + ":";
    text += (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

    return text;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentDetailSubContent');
  }

  dismiss(msg: string = null) {
    this.viewCtrl.dismiss({msg: msg});
  }

  cancel() {
    this.dismiss();
  }

  change(content) {
    console.log(content);
    content.checked = !content.checked;
  }

  post() {
    var result: any;

    if( this.item.type == "vote" ) {

      if( this.vote_result == null ) {
        alert('항목을 선택해주세요.');
        return;
      }

      result = {
        no: this.vote_result,
        content: this.item.content[this.vote_result - 1].content 
      };
    }
    else if( this.item.type == "survey" ) {

      result = [];

      this.item.content.forEach((element1) => {

        var answer: any;

        if( element1.type == 'mc' || element1.type == 'cb' ) {

          answer = [];

          element1.content.forEach((element2) => {
            if( element2.checked ) {
              answer.push({
                no: element2.no,
                content: element2.content
              });
            }
          });
        }
        else if( element1.type == 'rb' ) {
          if( element1.answer != null ) {
              answer = {
              no: element1.answer,
              content: element1.content[element1.answer - 1].content
            }
          }
        }
        else if( element1.type == 'sc' ) {
          answer = element1.answer;
        }

        result.push({
          no: element1.no,
          title: element1.title,
          type: element1.type,
          typename: element1.typename,
          necessity: element1.necessity,
          answer: answer
        });
      })
    }

    console.log("result: ", result);

    let sendable: boolean = true;

    if( this.item.type == "survey" ) {
      result.some((element) => {
        if( element.necessity ) {
          if( element.type == 'sc' ) {
            if( element.answer.trim() == '' ) {
              sendable = false;
              return true;
            } 
          }
          else if( element.type == 'rb' ) {
            if( element.answer == null || element.answer === undefined ) {
              sendable = false;            
              return true;
            }
          }
          else {
            if( element.answer.length == 0 ) {
              sendable = false;            
              return true;
            }
          }
          if( !sendable ) {
            return true;
          }
        }
      });
    }

    if( !sendable ) {
      alert('필수 항목을 모두 입력해주세요.');
      return false;
    }

    let body = {
      qes_id: this.item.id, 
      user_no: this.user_no, 
      // user_no: 2,
      content: JSON.stringify(result)
    };

    this.sevReq.getResult("subcontentexec", body, this);
  }

}
