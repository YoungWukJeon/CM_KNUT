import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentLike } from './content-like';

@NgModule({
  declarations: [
    ContentLike,
  ],
  imports: [
    IonicPageModule.forChild(ContentLike),
  ],
  exports: [
    ContentLike
  ]
})
export class ContentLikeModule {}
