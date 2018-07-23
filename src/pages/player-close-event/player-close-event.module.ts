import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlayerCloseEventPage } from './player-close-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PlayerCloseEventPage,
  ],
  imports: [
    IonicPageModule.forChild(PlayerCloseEventPage),
    TranslateModule.forChild()
  ],
})
export class PlayerCloseEventPageModule {}
