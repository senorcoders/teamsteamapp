import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';

/**
 * Generated class for the ListChatsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-list-chats',
  templateUrl: 'list-chats.html',
})
export class ListChatsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController
  ) {
  }

  public newChat(){
    let newChat = this.modal.create(SelectNewChatComponent);
    newChat.present();
  }

}
