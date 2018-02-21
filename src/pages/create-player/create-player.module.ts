import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatePlayerPage } from './create-player';

@NgModule({
  declarations: [
    CreatePlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatePlayerPage),
  ],
})
export class CreatePlayerPageModule {}
