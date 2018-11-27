import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatManagerOfTeamsLeaguePage } from './chat-manager-of-teams-league';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { EmojiPickerComponentModule } from '../../components/emoji-picker/emoji-picker.module';

@NgModule({
  declarations: [
    ChatManagerOfTeamsLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(ChatManagerOfTeamsLeaguePage),
    TranslateModule.forChild(),
    EmojiPickerComponentModule,
    PipesModule,
    IonicImageViewerModule
  ],
})
export class ChatManagerOfTeamsLeaguePageModule {}
