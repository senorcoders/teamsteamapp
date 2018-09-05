import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagesEventPage } from './images-event';
import { TranslateModule } from '@ngx-translate/core';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    ImagesEventPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagesEventPage),
    TranslateModule.forChild(),
    IonicImageViewerModule
  ],
})
export class ImagesEventPageModule {}
