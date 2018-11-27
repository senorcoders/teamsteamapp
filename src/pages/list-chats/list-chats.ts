import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectNewChatComponent } from '../../components/select-new-chat/select-new-chat';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { ChatPage } from '../chat/chat';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ChatFamilyPage } from '../chat-family/chat-family';
import { ChatManagerOfTeamsLeaguePage } from '../chat-manager-of-teams-league/chat-manager-of-teams-league';
import { SelectLeagueToChatPage } from '../select-league-to-chat/select-league-to-chat';

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

  public listUsers: Array<any> = [];
  public team: any = { name: "" };
  public idTeam: string;
  public loadImage = false;
  public user;
  public static newMessages: Array<string> = [];

  //For League
  public league: any = {};
  public loadImageLeague = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modal: ModalController, private http: HttpClient
  ) {
    this.user = MyApp.User;
  }

  async ionViewWillEnter() {
    try {
      if (MyApp.User.role.name !== "OwnerLeague") {
        await this.processForNotOwnerLeague();
      } else {
        await this.processForOwnerLeague();
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  private async processForNotOwnerLeague() {
    this.idTeam = MyApp.User.team;
    let users: any = await this.http.get("/chat-list/" + MyApp.User.id + "/" + MyApp.User.team).toPromise();
    this.listUsers = users.map(function (item) {

      item.loadImage = false;
      item.imgSrc = interceptor.transformUrl("/userprofile/images/" + item._id + "/" + MyApp.User.team);
      return item;

    });

    let team: any = await this.http.get("/teams/" + this.idTeam).toPromise();
    this.team = team;
    let random = new Date().getTime();
    this.team.imageSrc = interceptor.transformUrl("/images/" + random + "/teams/" + this.team.id + "-thumbnail");
  }

  private async processForOwnerLeague() {
    if (this.user.role.league.typeObject() === true) {
      this.league.imageSrc = interceptor.transformUrl("/images/ramdon/leagues/" + this.user.role.league.id + "-thumbnail");
    } else {
      this.league = await this.http.get(`/leagues/${this.user.role.league}`).toPromise();
      this.league.imageSrc = interceptor.transformUrl("/images/ramdon/leagues/" + this.user.role.league.id + "-thumbnail");
    }
  }

  public goChatTeam() {
    this.navCtrl.push(ChatPage);
  }

  public newChat() {
    let newChat = this.modal.create(SelectNewChatComponent);
    newChat.present();
  }

  public goChat(user) {
    this.navCtrl.push(ChatOnePersonPage, {
      user
    });
  }

  public goChatFamily() {
    this.navCtrl.push(ChatFamilyPage);
  }

  public newMessagePeople(user) {
    let valid = true, ide: string;
    if (Object.prototype.toString.call(user) === "[object String]") {
      ide = user;
    } else {
      ide = user._id;
    }

    for (let id of ListChatsPage.newMessages) {
      if (ide === id) {
        valid = false;
        break;
      }
    }

    return valid;
  }

  public successImageLeague(){
    this.loadImageLeague = true;
  }

  public successImage() {
    this.loadImage = true;
  }

  public success(event, user) {
    user.loadImage = true;
  }

  public goManagersOfTeamsLeague() {
    if(this.user.role.name === "OwnerLeague"){
      this.navCtrl.push(ChatManagerOfTeamsLeaguePage, { league: this.league });
    }else{
      this.navCtrl.push(SelectLeagueToChatPage, {}, { animation: "ios-transition" });
    }
    
  }
}
