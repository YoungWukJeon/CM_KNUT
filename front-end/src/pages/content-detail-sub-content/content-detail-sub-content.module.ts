import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentDetailSubContent } from './content-detail-sub-content';

@NgModule({
  declarations: [
    ContentDetailSubContent,
  ],
  imports: [
    IonicPageModule.forChild(ContentDetailSubContent),
  ],
  exports: [
    ContentDetailSubContent
  ]
})
export class ContentDetailSubContentModule {}
