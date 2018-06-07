import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatePlayerDetailsPage } from './create-player-details';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreatePlayerDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatePlayerDetailsPage),
    TranslateModule.forChild()
  ],
})
export class CreatePlayerDetailsPageModule {}
