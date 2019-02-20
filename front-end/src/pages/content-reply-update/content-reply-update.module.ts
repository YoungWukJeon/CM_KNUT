import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentReplyUpdate } from './content-reply-update';

@NgModule({
  declarations: [
    ContentReplyUpdate,
  ],
  imports: [
    IonicPageModule.forChild(ContentReplyUpdate),
  ],
  exports: [
    ContentReplyUpdate
  ]
})
export class ContentReplyUpdateModule {}
