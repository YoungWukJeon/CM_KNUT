import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentReplyReply } from './content-reply-reply';

@NgModule({
  declarations: [
    ContentReplyReply,
  ],
  imports: [
    IonicPageModule.forChild(ContentReplyReply),
  ],
  exports: [
    ContentReplyReply
  ]
})
export class ContentReplyReplyModule {}
