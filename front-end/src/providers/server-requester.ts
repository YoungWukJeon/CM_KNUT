import { Injectable } from "@angular/core";
import { LoadingController } from "ionic-angular";
import { Http, Headers } from "@angular/http";
import "rxjs/add/operator/map";

/*
  Generated class for the ServerRequester provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

/*
2017.05.30 made by Youngwuk Jeon

  <Update Log>
    
*/

@Injectable()
export class ServerRequester {
  // private domainURL: string = "http://localhost:3200/";  /// 로컬
  private domainURL: string = "YourServerDomainURL";

  private state: boolean = false; // 서버에서 값을 정확히 주고 받는지 여부
  private loading: any = null; // 서버에서 값을 받거나 전달할 때 띄워줄 로딩
  private time = null; // 서버에서 일정시간 동안이 지나도 값이 안넘어올 때 처리를 위함 함수

  constructor(public http: Http, private loadingCtrl: LoadingController) {
    console.log("Hello ServerRequester Provider");
  }

  // 현재 통신중인 서버의 도메인을 return
  getDomainURL(): string {
    return this.domainURL;
  }

  // 서버로 요청을 보내 결과를 받음
  getResult(link: string, body: any, cla: any) {
    this.createLoading();

    this.http
      .post(this.domainURL + link, JSON.stringify(body), {
        headers: this.setHeader()
      })
      .map(res => res.json())
      .subscribe(data => {
        console.log("received data: ", data);
        clearTimeout(this.time);
        this.state = true;

        if (data == null) {
          alert("오류");
          this.closeLoading();
          return;
        }
        setTimeout(() => {
          this.closeLoading();
          cla.callback(this.domainURL, link, data);
        }, 1000);
      });
  }

  // 로딩창 생성
  // 서버에서 값을 받아올 동안 최대 대기 시간도 함께 설정
  createLoading(
    connectionTime: number = 3000,
    content: string = "Please wait..."
  ) {
    this.loading = this.loadingCtrl.create({
      content: content
    });
    this.loading.present();

    this.state = false;

    // 일정시간동안 값에 대한 처리가 이루어지지 않았을 경우
    this.time = setTimeout(() => {
      if (!this.state) {
        alert("값을 받을 수 없습니다. 네트워크 상태를 확인해주세요.");
        this.loading.dismiss();
      }
    }, connectionTime);
  }

  // 로딩창 닫기
  closeLoading() {
    this.loading.dismiss();
  }

  // 헤더설정
  setHeader(): any {
    let headers = new Headers();
    headers.append("Content-Type", "application/json");

    return headers;
  }
}
