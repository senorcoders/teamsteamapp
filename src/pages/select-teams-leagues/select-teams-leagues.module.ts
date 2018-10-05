import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectTeamsLeaguesPage } from './select-teams-leagues';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectTeamsLeaguesPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectTeamsLeaguesPage),
    TranslateModule.forChild()
  ],
})
export class SelectTeamsLeaguesPageModule {}
