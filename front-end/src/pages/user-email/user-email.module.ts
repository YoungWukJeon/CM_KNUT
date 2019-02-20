import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserEmail } from './user-email';

@NgModule({
  declarations: [
    UserEmail,
  ],
  imports: [
    IonicPageModule.forChild(UserEmail),
  ],
  exports: [
    UserEmail
  ]
})
export class UserEmailModule {}
