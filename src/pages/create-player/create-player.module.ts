import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreatePlayerPage } from './create-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreatePlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatePlayerPage),
    TranslateModule.forChild()
  ],
})
export class CreatePlayerPageModule {}
