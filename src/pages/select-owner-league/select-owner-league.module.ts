import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectOwnerLeaguePage } from './select-owner-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectOwnerLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectOwnerLeaguePage),
    TranslateModule.forChild()
  ],
})
export class SelectOwnerLeaguePageModule {}
