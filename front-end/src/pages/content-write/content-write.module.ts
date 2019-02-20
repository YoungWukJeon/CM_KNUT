import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentWrite } from './content-write';

@NgModule({
  declarations: [
    ContentWrite,
  ],
  imports: [
    IonicPageModule.forChild(ContentWrite),
  ],
  exports: [
    ContentWrite
  ]
})
export class ContentWriteModule {}
