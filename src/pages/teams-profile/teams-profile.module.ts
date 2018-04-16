import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamsProfilePage } from './teams-profile';
import { LongPressModule } from 'ionic-long-press';

@NgModule({
  declarations: [
    //TeamsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(TeamsProfilePage)
  ],
})
export class TeamsProfilePageModule {}
