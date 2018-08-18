import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestsLeaguePage } from './requests-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RequestsLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(RequestsLeaguePage),
    TranslateModule.forChild()
  ],
})
export class RequestsLeaguePageModule {}
