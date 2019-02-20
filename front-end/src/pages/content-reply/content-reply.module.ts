import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentReply } from './content-reply';

@NgModule({
  declarations: [
    ContentReply,
  ],
  imports: [
    IonicPageModule.forChild(ContentReply),
  ],
  exports: [
    ContentReply
  ]
})
export class ContentReplyModule {}
