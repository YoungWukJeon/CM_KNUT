import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserInfo } from './user-info';

@NgModule({
  declarations: [
    UserInfo,
  ],
  imports: [
    IonicPageModule.forChild(UserInfo),
  ],
  exports: [
    UserInfo
  ]
})
export class UserInfoModule {}
