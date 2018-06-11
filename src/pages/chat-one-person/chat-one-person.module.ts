import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatOnePersonPage } from './chat-one-person';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ChatOnePersonPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatOnePersonPage),
    PipesModule
    
  ]
})
export class ChatOnePersonPageModule {}
