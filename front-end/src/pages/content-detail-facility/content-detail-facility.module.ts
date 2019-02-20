import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContentDetailFacility } from './content-detail-facility';

@NgModule({
  declarations: [
    ContentDetailFacility,
  ],
  imports: [
    IonicPageModule.forChild(ContentDetailFacility),
  ],
  exports: [
    ContentDetailFacility
  ]
})
export class ContentDetailFacilityModule {}
