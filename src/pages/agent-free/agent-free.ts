import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment'
import { MyApp } from '../../app/app.component';
import { EventTeamJoinPage } from '../event-team-join/event-team-join';


@IonicPage()
@Component({
  selector: 'page-agent-free',
  templateUrl: 'agent-free.html',
})
export class AgentFreePage {

  public static __name = "AgentFreePage"

  public events=[];
  private idEventTime:number=-1;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient
  ) {
  }

  async ionViewDidLoad() {
    let events:any = await this.http.get(`/userfree/${MyApp.User.id}/${moment().toISOString()}/${20}`).toPromise();
    this.events = events;console.log(this.events);
    if( this.idEventTime===-1)
      this.idEventTime = setInterval(this.ionViewDidLoad.bind(this), 20000);
  }

  ionViewWillUnload(){
    console.log("desactive ", this.idEventTime);
    clearInterval(this.idEventTime);
  }

  goEventTeam(event){
    this.navCtrl.push(EventTeamJoinPage, {event});
  }

}
