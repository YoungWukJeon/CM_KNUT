import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentSearch } from './content-search';

@NgModule({
  declarations: [
    ContentSearch,
  ],
  imports: [
    IonicPageModule.forChild(ContentSearch),
  ],
  exports: [
    ContentSearch
  ]
})
export class ContentSearchModule {}
