import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddTeamPage } from './add-team';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(AddTeamPage),
    TranslateModule.forChild()
  ],
})
export class AddTeamPageModule {}
