import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormJoinTeamPage } from './form-join-team';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormJoinTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(FormJoinTeamPage),
    TranslateModule.forChild()
  ],
})
export class FormJoinTeamPageModule {}
