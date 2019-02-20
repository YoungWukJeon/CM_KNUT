import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomeContent } from './home-content';

@NgModule({
  declarations: [
    HomeContent,
  ],
  imports: [
    IonicPageModule.forChild(HomeContent),
  ],
  exports: [
    HomeContent
  ]
})
export class HomeContentModule {}
