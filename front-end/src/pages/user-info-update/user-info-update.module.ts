import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserInfoUpdate } from './user-info-update';

@NgModule({
  declarations: [
    UserInfoUpdate,
  ],
  imports: [
    IonicPageModule.forChild(UserInfoUpdate),
  ],
  exports: [
    UserInfoUpdate
  ]
})
export class UserInfoUpdateModule {}
