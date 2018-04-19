import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormJoinTeamPage } from './form-join-team';

@NgModule({
  declarations: [
    FormJoinTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(FormJoinTeamPage),
  ],
})
export class FormJoinTeamPageModule {}
