import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MemberRosterPage } from '../member-roster/member-roster';
import { ViewPlayerPage } from '../view-player/view-player';
import { interceptor } from '../../providers/auth-service/interceptor';
import { CreatePlayerPage } from '../create-player/create-player';
import { MyApp } from '../../app/app.component';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * para mostrar la lista de jugadores del equipo
 */

@IonicPage()
@Component({
  selector: 'page-roster',
  templateUrl: 'roster.html',
})
export class RosterPage {
  
  public user=MyApp.User;
  public isManager:boolean=false;

  public players=[];
  public playersOrigin=[];
  public filtro="";

  public updateImagePlayer = (index:number, stringBase64:string)=>{

    let t = this; console.log(index);
    return new Promise(function(resolve, reject){
      t.players[index].image = stringBase64;
    })

  }

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public http: HttpClient, public auth: AuthServiceProvider,
    public loading: LoadingController
  ) {
  }

  async ionViewDidLoad(){

    let load = HelpersProvider.me.getLoadingStandar();
    try{
      
    let players:any = await this.http.get("/players/team/"+ this.user.team).toPromise();

    this.players = players;

    this.players = this.players.filter(function(item){
      return item.user !== undefined;
    });

    this.players = await Promise.all(this.players.map(async function(item){
      
        item.loadImage = false;
        let ramdon = new Date().getTime();
        item.image = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ item.user.id);

        return item;
      }));

      this.playersOrigin = this.players;

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

  public search(){
    if(this.filtro===""){
      this.players = this.playersOrigin;
      return;
    }

    this.players = this.playersOrigin.filter(function(it){
      return it.user.firstName.toLowerCase().includes(this.filtro.toLowerCase()) ||
      it.user.lastName.toLowerCase().includes(this.filtro.toLowerCase());
    }.bind(this))
  }

  public addPlayer(){
    this.navCtrl.push(CreatePlayerPage);
  }

  public goChat(user){
    this.navCtrl.push(ChatOnePersonPage, { user });
  }

}
