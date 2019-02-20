import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentDetail } from './content-detail';

@NgModule({
  declarations: [
    ContentDetail,
  ],
  imports: [
    IonicPageModule.forChild(ContentDetail),
  ],
  exports: [
    ContentDetail
  ]
})
export class ContentDetailModule {}
