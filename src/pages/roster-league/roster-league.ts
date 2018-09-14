import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MemberRosterPage } from '../member-roster/member-roster';
import { ViewPlayerPage } from '../view-player/view-player';
import { CreatePlayerPage } from '../create-player/create-player';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';


@IonicPage()
@Component({
  selector: 'page-roster-league',
  templateUrl: 'roster-league.html',
})
export class RosterLeaguePage {

  public user:any={};
  public players:Array<any>=[];
  public team:any={};

  public updateImagePlayer = (index:number, stringBase64:string)=>{

    let t = this; console.log(index);
    return new Promise(function(resolve, reject){
      t.players[index].image = stringBase64;
    })

  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient
  ) {
    this.team = this.navParams.get("team");
  }

  async ionViewWillEnter (){

    let load = HelpersProvider.me.getLoadingStandar();

    this.user = MyApp.User;
    try{
      
    let players:any = await this.http.get("/players/team/"+ this.team.id).toPromise();

    this.players = players;

    this.players = this.players.filter(function(item){
      return item.user !== undefined;
    });

    this.players = await Promise.all(this.players.map(async function(item){
      
        item.loadImage = false;
        item.image = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);

        return item;
      }));

    }
    catch(e){
      console.error(e);
    }
    
    load.dismiss();
  }

  public success(event, player){
    player.loadImage = true;
  }

  public editMember(index:number, member:any){
    this.navCtrl.push(MemberRosterPage, {
      player : member,
      index,
      updateImage: this.updateImagePlayer
    });
  }

  public viewPlayer(member){
    this.navCtrl.push(ViewPlayerPage, {
      player : member,
      user : this.user
    });
  }

  public addPlayer(){
    this.navCtrl.push(CreatePlayerPage, {team: this.team});
  }

  public goChat(user){
    this.navCtrl.push(ChatOnePersonPage, { user });
  }

}
