import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlacesPlayerFreePage } from './places-player-free';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PlacesPlayerFreePage,
  ],
  imports: [
    IonicPageModule.forChild(PlacesPlayerFreePage),
    TranslateModule.forChild()
  ],
})
export class PlacesPlayerFreePageModule {}
