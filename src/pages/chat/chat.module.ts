import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatPage } from './chat';
import { PipesModule } from '../../pipes/pipes.module';
import { EmojiProvider } from '../../providers/emoji/emoji';

@NgModule({
  declarations: [
    ChatPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatPage)
  ],
  providers:[
    EmojiProvider
  ]
})
export class ChatPageModule {}
