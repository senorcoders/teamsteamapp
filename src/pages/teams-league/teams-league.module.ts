import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamsLeaguePage } from './teams-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TeamsLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(TeamsLeaguePage),
    TranslateModule.forChild()
  ],
})
export class TeamsLeaguePageModule {}
