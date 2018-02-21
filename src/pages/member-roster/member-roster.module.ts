import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberRosterPage } from './member-roster';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    MemberRosterPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberRosterPage),
    IonicImageLoader
  ],
})
export class MemberRosterPageModule {}
