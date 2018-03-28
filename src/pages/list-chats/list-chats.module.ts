import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListChatsPage } from './list-chats';

@NgModule({
  declarations: [
    //ListChatsPage,
  ],
  imports: [
    IonicPageModule.forChild(ListChatsPage),
  ],
})
export class ListChatsPageModule {}
