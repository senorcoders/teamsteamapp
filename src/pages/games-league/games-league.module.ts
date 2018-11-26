import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GamesLeaguePage } from './games-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    GamesLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(GamesLeaguePage),
    TranslateModule.forChild()
  ],
})
export class GamesLeaguePageModule {}
