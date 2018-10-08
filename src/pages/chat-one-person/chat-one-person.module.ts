import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatOnePersonPage } from './chat-one-person';
import { PipesModule } from '../../pipes/pipes.module';
import { EmojiPickerComponentModule } from '../../components/emoji-picker/emoji-picker.module';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    ChatOnePersonPage
  ],
  imports: [
    IonicPageModule.forChild(ChatOnePersonPage),
    PipesModule,
    EmojiPickerComponentModule,
    IonicImageViewerModule
  ]
})
export class ChatOnePersonPageModule {}
