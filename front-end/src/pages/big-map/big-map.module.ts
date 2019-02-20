import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BigMap } from './big-map';

@NgModule({
  declarations: [
    BigMap,
  ],
  imports: [
    IonicPageModule.forChild(BigMap),
  ],
  exports: [
    BigMap
  ]
})
export class BigMapModule {}
