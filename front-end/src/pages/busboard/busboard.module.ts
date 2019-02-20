import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Busboard } from './busboard';

@NgModule({
  declarations: [
    Busboard,
  ],
  imports: [
    IonicPageModule.forChild(Busboard),
  ],
  exports: [
    Busboard
  ]
})
export class BusboardModule {}
