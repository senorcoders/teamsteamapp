import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberRosterPage } from './member-roster';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MemberRosterPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberRosterPage),
    TranslateModule.forChild()
  ],
})
export class MemberRosterPageModule {}
