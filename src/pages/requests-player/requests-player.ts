import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { RequestPlayerPage } from '../request-player/request-player';

@IonicPage()
@Component({
  selector: 'page-requests-player',
  templateUrl: 'requests-player.html',
})
export class RequestsPlayerPage {

  public static __name = "RequestsPLayerPage"


  public requests:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient
  ) {
  }

  async ionViewDidLoad() {
    this.requests = await this.http.get("/playerfree/request/"+ MyApp.User.id).toPromise() as any;
  }

  toRequest(request){
    this.navCtrl.push(RequestPlayerPage, {request});
  }

}
