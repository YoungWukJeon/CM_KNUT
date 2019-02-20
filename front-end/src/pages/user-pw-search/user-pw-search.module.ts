import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserPwSearch } from './user-pw-search';

@NgModule({
  declarations: [
    UserPwSearch,
  ],
  imports: [
    IonicPageModule.forChild(UserPwSearch),
  ],
  exports: [
    UserPwSearch
  ]
})
export class UserPwSearchModule {}
