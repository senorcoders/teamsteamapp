import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { ChatPage } from '../chat/chat';
import { interceptor } from '../../providers/auth-service/interceptor';

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
  public loadImage=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController, private http: HttpClient
  ) {
    this.idTeam = MyApp.User.team;
  }

  async ionViewWillEnter(){
    
    try{
      let users:any = await this.http.get("/chat-list/"+ MyApp.User.id+ "/"+ MyApp.User.team).toPromise();
      
      let ramdon = new Date().getTime();
      this.listUsers = users.map(function(item){
        
        item.imgSrc = interceptor.transformUrl(`/images/${ramdon}/users&thumbnail/`+ item._id);
        return item;

      });

      let team:any = await this.http.get("/teams/"+ this.idTeam).toPromise();
      this.team = team;
      let random = new Date().getTime();
      this.team.imageSrc = interceptor.transformUrl("/images/"+ random+ "/teams&thumbnail/"+ this.team.id);
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

  public successImage(){
    this.loadImage = true;
  }

}
