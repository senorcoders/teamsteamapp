import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MemberRosterPage } from '../member-roster/member-roster';
import { ViewPlayerPage } from '../view-player/view-player';
import { interceptor } from '../../providers/auth-service/interceptor';
import { CreatePlayerPage } from '../create-player/create-player';
import { MyApp } from '../../app/app.component';

/**
 * para mostrar la lista de jugadores del equipo
 */

@IonicPage()
@Component({
  selector: 'page-roster',
  templateUrl: 'roster.html',
})
export class RosterPage {
  
  public user:any;
  public isManager:boolean=false;

  private team:any;
  public players:Array<any>=[];

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

  async ngOnInit(){

    let load = this.loading.create({ content: "Loading Roster..."});
    load.present({ disableApp : true });

    this.user = MyApp.User;
    try{
    let url;
    if( this.user.role.name === "Player"){
      url = "/team/player/"+ this.user.id;
    }else if( this.user.role.name === "Manager" ){
      url = "/team/manager/"+ this.user.id;
      this.isManager = true;
    }else if( this.user.role.name === "Parent" ){
      url = "/team/parent/"+ this.user.id;
    }
    
    this.team = await this.http.get(url).toPromise();
    
    var players:any;
    if( this.team.hasOwnProperty('team') ){
      players = await this.http.get("/players/team/"+ this.team.team).toPromise();
    }else if( Object.prototype.toString.call(this.team) === '[object Array]'){
      players = await this.http.get("/players/team/"+ this.team[0].team).toPromise();
    }

    this.players = players;

    let src = interceptor.url;
    let t = this;

    this.players = await Promise.all(this.players.map(async function(item){
      
        item.loadImage = false;
        let ramdon = new Date().getTime();
        item.image = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ item.user.id);

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
    this.navCtrl.push(CreatePlayerPage);
  }

}
