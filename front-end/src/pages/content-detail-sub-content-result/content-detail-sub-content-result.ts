import { Component, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, Content } from 'ionic-angular';

import { Chart } from 'chart.js';

// providers
import { ServerRequester } from '../../providers/server-requester';

/**
 * Generated class for the ContentDetailSubContentResult page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

/*
2017.06.10 made by Youngwuk Jeon

  <Update Log>
    
*/

@IonicPage()
@Component({
  selector: 'page-content-detail-sub-content-result',
  templateUrl: 'content-detail-sub-content-result.html',
})
export class ContentDetailSubContentResult {

  @ViewChildren('voteBarCanvas') private voteBarCanvas: QueryList<ElementRef>;
  @ViewChildren('surveyBarCanvas') private surveyBarCanvas: QueryList<ElementRef>;
  @ViewChildren('surveyPieCanvas') private surveyPieCanvas: QueryList<ElementRef>;
  @ViewChildren('surveyDoughnutCanvas') private surveyDoughnutCanvas: QueryList<ElementRef>;
  @ViewChild(Content) content: Content;
  
  private voteBarChart: any;
  private surveyBarChart: any;
  private surveyPieChart: any;
  private surveyDoughnutChart: any;

  private mcIndex: number[] = [];
  private scIndex: number[] = [];
  private cbIndex: number[] = [];
  private rbIndex: number[] = [];

  private labels: any;
  private data: any;
  private backgroundColor: any;
  private borderColor: any;

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
    result: []
  };

  private user_no: number;
  private ub_id: number;
  private currentViewIndex: number = 0;
  private personal: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, private modalCtrl: ModalController,
  private sevReq: ServerRequester) {

    this.user_no = this.navParams.get('user_no');
    this.ub_id = this.navParams.get('id');
    this.personal = this.navParams.get('personal') == null? false: this.navParams.get('personal');
    var item = this.navParams.get('item');

    console.log("user_no: ", this.user_no);
    console.log("ub_id: ", this.ub_id);
    console.log("personal: ", this.personal);
    console.log("item: ", item);

    if( item != null ) {
      this.item = item;
      this.user_no = this.item.result[this.currentViewIndex].user_no;
      console.log(this.item);
    }
    else {
      // this.user_no = 1;
      // this.ub_id = 36;

      this.sevReq.getResult("subcontentresult", {user_no: this.user_no, ub_id: this.ub_id}, this);
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContentDetailSubContentResult');
  }

  callback(domainURL: string, link: string, data: any) {
    console.log("data => ", data);
    this.item = data;

    console.log(this.item);
    console.log("user_no", this.user_no);

    // 글 작성자가 투표 / 설문 조사 전체의 결과를 확인할 경우
    if( this.user_no == null ) {
      if( this.item.result.length > 0 ) {
        if( this.item.type == 'vote') {

          this.labels = new Array(new Array(this.item.content.length));
          this.data = new Array(new Array(this.item.content.length));
          this.backgroundColor = new Array(new Array(this.item.content.length));
          this.borderColor = new Array(new Array(this.item.content.length));

          for( var i = 0; i < this.item.content.length; i++ ) {
            var label = this.item.content[i].no + "번";
            this.labels[0][i] = label;
            this.backgroundColor[0][i] = "rgba(75, 192, 192, 0.5)";
            // backgroundColor.push("rgba(201, 201, 201, 1)");
            this.borderColor[0][i] = "rgba(75, 192, 192, 1)";
            this.data[0][i] = 0;
          }
          
          this.item.result.forEach((element) => {
            this.data[0][element.content.no - 1]++;
          });

          var maxCount = 0;
          var maxIndex = -1;

          // 결과의 최대값을 구함
          this.data[0].forEach((element) => {
            if( element > maxCount ) {
              maxCount = element;
              maxIndex = this.data[0].indexOf(element);
            }
          });
          // 제일 높은 항목은 다른 색으로 표시
          this.backgroundColor[0][maxIndex] = "rgba(154, 86, 95, 0.5)";
          // backgroundColor[maxIndex] = "rgba(68, 114, 196, 1)";
          this.borderColor[0][maxIndex] = "rgba(154, 86, 95, 1)";
        }
        else if( this.item.type == "survey" ) {

          this.labels = new Array(this.item.content.length);
          this.data = new Array(this.item.content.length);
          this.backgroundColor = new Array(this.item.content.length);
          this.borderColor = new Array(this.item.content.length);

          for( var i = 0; i < this.item.content.length; i++ ) {

            this.labels[i] = new Array(this.item.content[i].content.length);
            this.data[i] = new Array(this.item.content[i].content.length);
            this.backgroundColor[i] = new Array(this.item.content[i].content.length);
            this.borderColor[i] = new Array(this.item.content[i].content.length);
            
            if( this.item.content[i].type != 'sc' ) {
              for( var j = 0; j < this.item.content[i].content.length; j++ ) {

                var label = this.item.content[i].content[j].no + "번";

                this.labels[i][j] = label;
                this.data[i][j] = 0;
                this.backgroundColor[i][j] = "rgba(75, 192, 192, 0.5)";
                // backgroundColor.push("rgba(201, 201, 201, 1)");
                this.borderColor[i][j] = "rgba(75, 192, 192, 1)";
              }
            }
            else {
              this.labels[i] = [];
              this.data[i] = [];
            }
          }

          this.item.result.forEach((result) => {
            result.content.forEach((content) => {
              if( content.type != 'sc' ) {
                // content.type == 'mc' || content.type == 'cb' 의 경우는 답항이 여러개 발생할 수 있기 때문에 확인
                if( !Array.isArray(content.answer)  ) {
                  this.data[content.no - 1][content.answer.no - 1]++;
                }
                else {
                  content.answer.forEach((answer) => {
                    this.data[content.no - 1][answer.no - 1]++;
                  });
                }
              }
              else {
                // 빈 내용은 제거
                if( content.answer.trim() != '' ) {
                  this.data[content.no - 1].push("- " + content.answer);
                }
              }            
            });
          });

          this.mcIndex = [];
          this.scIndex = [];
          this.cbIndex = [];
          this.rbIndex = [];

          this.item.content.forEach((element) => {
            element.result = this.data[this.item.content.indexOf(element)];

            // 각 항목들의 type의 번호를 저장
            switch( element.type ) {
              case 'mc':
                this.mcIndex.push(element.no - 1);
                break;
              case 'sc':
                this.scIndex.push(element.no - 1);
                break;
              case 'cb':
                this.cbIndex.push(element.no - 1);
                break;
              case 'rb':
                this.rbIndex.push(element.no - 1);
                break;
            }

            if( element.type != 'sc' ) {
              var maxCount = 0;
              var maxIndex = -1;

                // 결과의 최대값을 구함
                element.result.forEach((result) => {
                  if( result > maxCount ) {
                    maxCount = result;
                    maxIndex = element.result.indexOf(result);
                  }
                });

                // 제일 높은 항목은 다른 색으로 표시
                this.backgroundColor[this.item.content.indexOf(element)][maxIndex] = "rgba(154, 86, 95, 0.5)";
                // this.backgroundColor[maxIndex] = "rgba(68, 114, 196, 1)";
                this.borderColor[this.item.content.indexOf(element)][maxIndex] = "rgba(154, 86, 95, 1)";
            }
          });
          console.log(this.data);
          console.log(this.item);
        }
      }
    }
    
    if( this.item.result.length > 0 ) {
      // 일반 사용자가 자신의 투표 / 설문 조사 정보를 확인할 경우

      this.changeViewContent();
      console.log(this.item);
    }
  }

  // 현재 보고 있는 투표 / 설문 조사의 내용을 변경
  changeViewContent() {

    
    if( this.item.type == 'vote' ) {
      this.item.content.forEach((element) => {
        if( element.no == this.item.result[this.currentViewIndex].content.no ) {
          element.checked = true;
        }
        else {
          element.checked = false;
        }
      });
    }
    else if( this.item.type == 'survey' ) {
      this.item.content.forEach((element) => {
        element.answer = this.item.result[this.currentViewIndex].content[this.item.content.indexOf(element)].answer;
        
        element.content.forEach((content) => {
          content.checked = false;
        });

        if( element.type == 'sc' ) {
          if( element.answer.trim() == '' ) {
            element.hasAnswer = false;
          }
          else {
            element.hasAnswer = true;
          }
        }
        else {
          if( element.answer != null ) {
            if( Array.isArray(element.answer) ) {
              if( element.answer.length == 0 ) {
                element.hasAnswer = false;
              }
              else {
                element.hasAnswer = true;

                // 해당 항목이 선택되었는지를 조사
                element.answer.forEach((answer) => {
                  element.content[answer.no - 1].checked = true;
                });
              }
            }
            else {
              element.hasAnswer = true;

              // 해당 항목이 선택되었는지를 조사              
              element.content[element.answer.no - 1].checked = true;
            }
          }
          else {
            element.hasAnswer = false;
          }
        }
      });
    }
  }

  ngAfterViewInit(): void {

    // 투표 결과
    this.voteBarCanvas.changes.subscribe(() => {
      this.voteBarCanvas.toArray().forEach((element) => {
        this.drawBarChart(element, 0);
      });
    });

    // 설문 조사 결과

    // mc 결과
    this.surveyBarCanvas.changes.subscribe(() => {
      this.surveyBarCanvas.toArray().forEach((element) => {
        this.drawBarChart(element, this.mcIndex[this.surveyBarCanvas.toArray().indexOf(element)]);
      });
    });

    // cb 결과
    this.surveyPieCanvas.changes.subscribe(() => {
      this.surveyPieCanvas.toArray().forEach((element) => {
        this.drawPieChart(element, this.cbIndex[this.surveyPieCanvas.toArray().indexOf(element)]);
      });
    });

    // rb 결과
    this.surveyDoughnutCanvas.changes.subscribe(() => {
      this.surveyDoughnutCanvas.toArray().forEach((element) => {
        this.drawDoughnutChart(element, this.rbIndex[this.surveyDoughnutCanvas.toArray().indexOf(element)]);
      });
    });
  }

  drawBarChart(barCanvas: ElementRef, index: number) {
    this.surveyBarChart = new Chart(barCanvas.nativeElement, {
      responsive: true,
      type: 'horizontalBar',
      data: {
          // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          labels: this.labels[index],
          datasets: [{
              label: '득표수',
              // data: [12, 19, 3, 5, 2, 3],
              data: this.data[index],
              backgroundColor: this.backgroundColor[index],
              borderColor: this.borderColor[index],
              // backgroundColor: [
              //     'rgba(255, 99, 132, 0.2)',
              //     'rgba(54, 162, 235, 0.2)',
              //     'rgba(255, 206, 86, 0.2)',
              //     'rgba(75, 192, 192, 0.2)',
              //     'rgba(153, 102, 255, 0.2)',
              //     'rgba(255, 159, 64, 0.2)'
              // ],
              // borderColor: [
              //     'rgba(255,99,132,1)',
              //     'rgba(54, 162, 235, 1)',
              //     'rgba(255, 206, 86, 1)',
              //     'rgba(75, 192, 192, 1)',
              //     'rgba(153, 102, 255, 1)',
              //     'rgba(255, 159, 64, 1)'
              // ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
            xAxes: [{
                  ticks: {
                      beginAtZero: true,
                      stepSize: 1
                  },
                  gridLines: {
                      display: false
                  }
              }],
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  },
                  gridLines: {
                      display: false                            
                  }
              }]
          }
      }
    });
  }

  drawPieChart(pieCanvas: ElementRef, index: number) {
    this.surveyBarChart = new Chart(pieCanvas.nativeElement, {
      responsive: true,
      type: 'pie',
      data: {
          labels: this.labels[index],
          datasets: [{
              label: '득표수',
              data: this.data[index],
              backgroundColor: this.backgroundColor[index],
              borderColor: this.borderColor[index],
              borderWidth: 1
          }]
      },
      options: {
      }
    });
  }

  drawDoughnutChart(doughnutCanvas: ElementRef, index: number) {
    this.surveyBarChart = new Chart(doughnutCanvas.nativeElement, {
      responsive: true,
      type: 'doughnut',
      data: {
          labels: this.labels[index],
          datasets: [{
              label: '득표수',
              data: this.data[index],
              backgroundColor: this.backgroundColor[index],
              borderColor: this.borderColor[index],
              borderWidth: 1
          }]
      },
      options: {
      }
    });
  }    

  getTimeText(time: number): string {
    var text = "";
    var date = new Date(time);

    text = date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate() + ".";
    text += (date.getHours() >= 12) ? ((date.getHours() != 12) ? "오후 " + (date.getHours() - 12) + ":" : "오후 12:") : "오전 " + date.getHours() + ":";
    text += (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

    return text;
  }

  dismiss() {
    this.viewCtrl.dismiss();
    
  }

  close() {
    this.dismiss();
  }

  view() {
    let modal = this.modalCtrl.create(ContentDetailSubContentResult, {personal: true, item: this.item});

    // 모달을 닫은 후 처음 투표 / 설문 조사 내용으로 이동
    modal.onDidDismiss(data => {
      this.currentViewIndex = 0;
      this.changeViewContent();
    });

    modal.present();
  }

  pre() {
    if( this.currentViewIndex > 0 ) {
      this.currentViewIndex--;
      this.changeViewContent();
      this.content.scrollToTop(100);
    }
  }

  next() {
    if( this.currentViewIndex < this.item.count - 1 ) {
      this.currentViewIndex++;
      this.changeViewContent();
      this.content.scrollToTop(100);
    }
  }

}