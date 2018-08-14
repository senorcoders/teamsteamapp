import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateTeamManagerPage } from './create-team-manager';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreateTeamManagerPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateTeamManagerPage),
    TranslateModule.forChild()
  ],
})
export class CreateTeamManagerPageModule {}
