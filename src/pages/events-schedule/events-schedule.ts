import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';

/**
 * Generated class for the EventsSchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-events-schedule',
  templateUrl: 'events-schedule.html',
})
export class EventsSchedulePage {
  user:any;
  public team:Object;

  public events:Array<any>=[];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth: AuthServiceProvider,
    public http: HttpClient
  ) {
  }

  async ngOnInit(){
    this.user = await this.auth.User();
    let url;
    if( this.user.role.name === "Player"){
      url = "/team/player/"+this.user.id;
    }else if( this.user.role.name === "Manager" ){
      url = "/team/manager/"+ this.user.id;
    }else if( this.user.role.name === "Parent" ){
      url = "/team/parent/"+ this.user.id
    }
    
    this.team = await this.http.get(url.toString()).toPromise();
    let events:Object;
    console.log(this.team);
    if( this.team.hasOwnProperty('team') ){
      events = await this.http.get("/event/team/"+ this.team.team).toPromise();
    }else if( Object.prototype.toString.call(this.team) === '[object Array]'){
      events = await this.http.get("/event/team/"+ this.team[0].team).toPromise();
    }

    this.events = events;

    this.events = await Promise.all(this.events.map(async function(it, index){
      it.createdAt = moment(it.createdAt, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("MM/DD/YYYY hh:mm:ss a");
      return it;
    }));

    /*this.events = this.events.sort(function(a, b){
      return moment(a.createdAt, "MM/DD/YYYY hh:mm:ss a").diff
    });*/
    this.events = this.events.reverse();
  }

}
