import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UploadMultiplesImagesPage } from './upload-multiples-images';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    UploadMultiplesImagesPage,
  ],
  imports: [
    IonicPageModule.forChild(UploadMultiplesImagesPage),
    TranslateModule.forChild(),
    PipesModule
  ],
})
export class UploadMultiplesImagesPageModule {}
