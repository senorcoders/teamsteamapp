import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MemberRosterPage } from '../member-roster/member-roster';

/**
 * Generated class for the RosterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-roster',
  templateUrl: 'roster.html',
})
export class RosterPage {
  
  public user:any;
  private team:any;
  public players:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public http: HttpClient, public auth: AuthServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RosterPage');
  }

  async ngOnInit(){
    this.user = await this.auth.User();
    let url;
    if( this.user.role.name === "Player"){
      url = "/team/player/"+ this.user.id;
    }else if( this.user.role.name === "Manager" ){
      url = "/team/manager/"+ this.user.id;
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

  }

  public editMember(member:any){
    this.navCtrl.push(MemberRosterPage, {
      player : member
    });
  }

}
