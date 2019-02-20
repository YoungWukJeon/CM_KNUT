import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

// pages
// import { HomePage } from '../pages/home/home';
// import { Login } from '../pages/login/login';
// import { UserInfo } from '../pages/user-info/user-info';

/*
  Generated class for the MenuContent provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

/*
2017.06.01 made by Youngwuk Jeon

  <Update Log>
    [2017.06.04]
      1. rootPage를 HomePage로 바꿈에 따라 import 순서 때문에 오류가 발생해서 app.component.ts에서 pages의 component를 초기화

*/

@Injectable()
export class MenuContent {

  private pages: Array<{title: string, component: any}>;

  constructor(public http: Http) {
    console.log('Hello MenuContent Provider');

    // set our app's pages
    this.pages = [
      // { title: 'Home', component: HomePage },
      // { title: '버스 시간표', component: Login },
      // { title: '회원정보', component: UserInfo },
      // { title: '로그인 및 회원가입', component: Login }
      { title: 'Home', component: null },
      { title: '버스 시간표', component: null },
      { title: '회원정보', component: null },
      { title: '로그인 및 회원가입', component: null }
    ];
  }

  changePageTitle(index: number, title: string) {
    this.pages[index].title = title;
  }

  getMenuComponent(index: number): any {
    return this.pages[index].component;
  }

  setMenuComponent(index: number, comp: any) {
    this.pages[index].component = comp;
  }

  getPages(): any {
    return this.pages;
  }

}
