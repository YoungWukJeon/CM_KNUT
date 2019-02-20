import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAgree } from './user-agree';

@NgModule({
  declarations: [
    UserAgree,
  ],
  imports: [
    IonicPageModule.forChild(UserAgree),
  ],
  exports: [
    UserAgree
  ]
})
export class UserAgreeModule {}
