import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberRosterPage } from './member-roster';

@NgModule({
  declarations: [
    MemberRosterPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberRosterPage),
  ],
})
export class MemberRosterPageModule {}
