import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamsProfilePage } from './teams-profile';
import { LongPressModule } from 'ionic-long-press';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TeamsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(TeamsProfilePage),
    TranslateModule.forChild()
  ],
})
export class TeamsProfilePageModule {}
