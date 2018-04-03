import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';

/**
 * esta es la lista de players con los que ha chateado
 */

@IonicPage()
@Component({
  selector: 'page-list-chats',
  templateUrl: 'list-chats.html',
})
export class ListChatsPage {

  public listUsers:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController, private http: HttpClient
  ) {
  }

  async ngOnInit(){
    try{
      let users:any = await this.http.get("/chat-list/"+ MyApp.User.id).toPromise();
      this.listUsers = users;
      //console.log(this.listUsers);
    }
    catch(e){
      console.error(e);
    }
  }

  public newChat(){
    let newChat = this.modal.create(SelectNewChatComponent);
    newChat.present();
  }

  public goChat(user){
    this.navCtrl.push(ChatOnePersonPage, {
      user
    });
  }

}
