import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListChatsPage } from './list-chats';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ListChatsPage,
  ],
  imports: [
    IonicPageModule.forChild(ListChatsPage),
    TranslateModule.forChild()
  ],
})
export class ListChatsPageModule {}
