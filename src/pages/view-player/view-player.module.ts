import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewPlayerPage } from './view-player';

@NgModule({
  declarations: [
    ViewPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewPlayerPage),
  ],
})
export class ViewPlayerPageModule {}
