import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewTeamPage } from './view-team';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewTeamPage),
    TranslateModule.forChild()
  ],
})
export class ViewTeamPageModule {}
