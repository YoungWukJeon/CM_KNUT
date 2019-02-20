import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentWriteSub } from './content-write-sub';

@NgModule({
  declarations: [
    ContentWriteSub,
  ],
  imports: [
    IonicPageModule.forChild(ContentWriteSub),
  ],
  exports: [
    ContentWriteSub
  ]
})
export class ContentWriteSubModule {}
