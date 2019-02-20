import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentDetailSubContentResult } from './content-detail-sub-content-result';

@NgModule({
  declarations: [
    ContentDetailSubContentResult,
  ],
  imports: [
    IonicPageModule.forChild(ContentDetailSubContentResult),
  ],
  exports: [
    ContentDetailSubContentResult
  ]
})
export class ContentDetailSubContentResultModule {}
