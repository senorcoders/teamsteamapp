import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RosterPage } from './roster';
@NgModule({
  declarations: [
    //RosterPage,
  ],
  imports: [
    IonicPageModule.forChild(RosterPage)
  ],
})
export class RosterPageModule {}
