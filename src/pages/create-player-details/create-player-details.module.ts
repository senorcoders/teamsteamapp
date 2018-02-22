import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatePlayerDetailsPage } from './create-player-details';

@NgModule({
  declarations: [
    CreatePlayerDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatePlayerDetailsPage),
  ],
})
export class CreatePlayerDetailsPageModule {}
