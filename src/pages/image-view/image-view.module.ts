import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageViewPage } from './image-view';
import { PipesModule } from '../../pipes/pipes.module';
import { AngularCropperjsModule } from 'angular-cropperjs';

@NgModule({
  declarations: [
    ImageViewPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageViewPage),
    PipesModule,
    AngularCropperjsModule
  ],
})
export class ImageViewPageModule {}
