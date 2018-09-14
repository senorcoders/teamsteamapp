import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhotosPage } from './photos';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PhotosPage,
  ],
  imports: [
    IonicPageModule.forChild(PhotosPage),
    TranslateModule.forChild()
  ],
})
export class PhotosPageModule {}
