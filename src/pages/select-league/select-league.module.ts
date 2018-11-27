import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectLeaguePage } from './select-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectLeaguePage),
    TranslateModule.forChild()
  ],
})
export class SelectLeaguePageModule {}
