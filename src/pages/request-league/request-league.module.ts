import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestLeaguePage } from './request-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RequestLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(RequestLeaguePage),
    TranslateModule.forChild()
  ],
})
export class RequestLeaguePageModule {}
