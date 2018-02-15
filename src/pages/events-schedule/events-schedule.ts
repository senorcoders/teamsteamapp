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
  public team:any;

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
      url = "/team/player/"+ this.user.id;
    }else if( this.user.role.name === "Manager" ){
      url = "/team/manager/"+ this.user.id;
    }else if( this.user.role.name === "Parent" ){
      url = "/team/parent/"+ this.user.id;
    }
    
    this.team = await this.http.get(url).toPromise();
    let events:any;

    console.log(this.team);
    if( this.team.hasOwnProperty('team') ){
      events = await this.http.get("/event/team/"+ moment().format("MM-DD-YYYY-hh:mm:ss-a") + "/"+ this.team.team).toPromise();
    }else if( Object.prototype.toString.call(this.team) === '[object Array]'){
      events = await this.http.get("/event/team/"+ moment().format("MM-DD-YYYY-hh:mm:ss-a") + "/"+ this.team[0].team).toPromise();
    }
    console.log(events);
    this.events = events;

    this.events = await Promise.all(this.events.map(async function(it, index){
      it.dateTime = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("MM/DD/YYYY hh:mm:ss a");
      return it;
    }));

    this.events = this.events.sort(function(a, b){
      let d1 = moment(a.dateTime, "MM/DD/YYYY hh:mm:ss a"), d2 = moment(b.dateTime, "MM/DD/YYYY hh:mm:ss a");
      if (d1.isBefore(d2)) {            // a comes first
        return 1
      } else if (d1.isAfter(d2)) {     // b comes first
          return -1
      } else {                // equal, so order is irrelevant
          return 0            // note: sort is not necessarily stable in JS
      }

    });

    this.events = this.events.reverse();
  }

}
