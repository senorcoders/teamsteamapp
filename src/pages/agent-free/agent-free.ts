import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as momnent from 'moment'
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-agent-free',
  templateUrl: 'agent-free.html',
})
export class AgentFreePage {

  public events=[];
  private idEventTime:number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient
  ) {
  }

  async ionViewDidLoad() {
    let events:any = await this.http.get(`/userfree/${MyApp.User.id}/${momnent().toISOString()}/${20}`).toPromise();
    this.events = events;
    this.idEventTime = setInterval(this.ionViewDidLoad.bind(this), 5000);
  }

  ionViewWillUnload(){
    clearInterval(this.idEventTime);
  }

}
