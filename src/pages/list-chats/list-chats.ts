import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { ChatPage } from '../chat/chat';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ChatFamilyPage } from '../chat-family/chat-family';

/**
 * esta es la lista de players con los que ha chateado
 */

@IonicPage()
@Component({
  selector: 'page-list-chats',
  templateUrl: 'list-chats.html',
})
export class ListChatsPage {

  public static __name = "ListChatsPage"

  public listUsers:Array<any>=[];
  public team:any={ name : "" };
  public idTeam:string;
  public loadImage=false;
  public user;
  public static newMessages:Array<string>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController, private http: HttpClient
  ) {
    this.idTeam = MyApp.User.team;
    this.user = MyApp.User;
  }

  async ionViewWillEnter(){
    
    try{
      let users:any = await this.http.get("/chat-list/"+ MyApp.User.id+ "/"+ MyApp.User.team).toPromise();
      
      let ramdon = new Date().getTime();
      this.listUsers = users.map(function(item){
        
        item.loadImage = false;
        item.imgSrc = interceptor.transformUrl("/userprofile/images/" + item._id + "/" + MyApp.User.team);
        return item;

      });

      let team:any = await this.http.get("/teams/"+ this.idTeam).toPromise();
      this.team = team;
      let random = new Date().getTime();
      this.team.imageSrc = interceptor.transformUrl("/images/"+ random+ "/teams/"+ this.team.id+ "-thumbnail");
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

  public goChatFamily(){
    this.navCtrl.push(ChatFamilyPage);
  }

  public newMessagePeople(user){
    let valid = true, ide:string;
    if(Object.prototype.toString.call(user) === "[object String]"){
      ide = user;
    }else{
      ide = user._id;
    }

    for(let id of ListChatsPage.newMessages){
      if( ide === id ){
        valid = false;
        break;
      }
    }
    
    return valid;
  }

  public successImage(){
    this.loadImage = true;
  }

  public success(event, user){
    user.loadImage = true;
  }

}
