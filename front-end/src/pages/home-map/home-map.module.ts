import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeMap } from './home-map';

@NgModule({
  declarations: [
    HomeMap,
  ],
  imports: [
    IonicPageModule.forChild(HomeMap),
  ],
  exports: [
    HomeMap
  ]
})
export class HomeMapModule {}
