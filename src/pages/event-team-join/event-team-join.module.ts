import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventTeamJoinPage } from './event-team-join';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    EventTeamJoinPage,
  ],
  imports: [
    IonicPageModule.forChild(EventTeamJoinPage),
    TranslateModule.forChild()
  ],
})
export class EventTeamJoinPageModule {}
