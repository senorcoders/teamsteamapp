import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RosterLeaguePage } from './roster-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RosterLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(RosterLeaguePage),
    TranslateModule.forChild()
  ],
})
export class RosterLeaguePageModule {}
