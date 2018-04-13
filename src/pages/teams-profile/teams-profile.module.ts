import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamsProfilePage } from './teams-profile';

@NgModule({
  declarations: [
    //TeamsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(TeamsProfilePage),
  ],
})
export class TeamsProfilePageModule {}
