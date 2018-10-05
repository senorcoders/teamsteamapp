import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormJoinTeamCodePage } from './form-join-team-code';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormJoinTeamCodePage,
  ],
  imports: [
    IonicPageModule.forChild(FormJoinTeamCodePage),
    TranslateModule.forChild()
  ],
})
export class FormJoinTeamCodePageModule {}
