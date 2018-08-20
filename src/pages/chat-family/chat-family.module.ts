import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatFamilyPage } from './chat-family';
import { TranslateModule } from '@ngx-translate/core';
import { EmojiPickerComponentModule } from '../../components/emoji-picker/emoji-picker.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ChatFamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatFamilyPage),
    TranslateModule.forChild(),
    EmojiPickerComponentModule,
    PipesModule
  ],
})
export class ChatFamilyPageModule {}
