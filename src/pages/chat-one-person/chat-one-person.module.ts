import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatOnePersonPage } from './chat-one-person';

@NgModule({
  declarations: [
    //ChatOnePersonPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatOnePersonPage),
  ],
})
export class ChatOnePersonPageModule {}
