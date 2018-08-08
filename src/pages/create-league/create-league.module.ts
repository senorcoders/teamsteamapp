import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateLeaguePage } from './create-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreateLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateLeaguePage),
    TranslateModule.forChild()
  ],
})
export class CreateLeaguePageModule {}
