import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { ChatPage } from '../chat/chat';

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
  public team:any={ name : "" };
  public idTeam:string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController, private http: HttpClient
  ) {
    this.idTeam = MyApp.User.team;
  }

  async ngOnInit(){
    try{
      let users:any = await this.http.get("/chat-list/"+ MyApp.User.id).toPromise();
      this.listUsers = users;
      let team:any = await this.http.get("/team/"+ this.idTeam).toPromise();
      this.team = team.team;
      console.log(this.team);
    }
    catch(e){
      console.error(e);
    }
  }

  public goChatTeam(){
    this.navCtrl.push(ChatPage);
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
