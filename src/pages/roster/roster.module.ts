import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RosterPage } from './roster';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    RosterPage,
  ],
  imports: [
    IonicPageModule.forChild(RosterPage),
    TranslateModule.forChild()
  ],
})
export class RosterPageModule {}
