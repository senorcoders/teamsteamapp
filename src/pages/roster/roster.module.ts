import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RosterPage } from './roster';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    RosterPage,
  ],
  imports: [
    IonicPageModule.forChild(RosterPage),
    IonicImageLoader
  ],
})
export class RosterPageModule {}
