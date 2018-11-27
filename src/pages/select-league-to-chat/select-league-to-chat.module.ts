import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectLeagueToChatPage } from './select-league-to-chat';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectLeagueToChatPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectLeagueToChatPage),
    TranslateModule.forChild()
  ],
})
export class SelectLeagueToChatPageModule {}
