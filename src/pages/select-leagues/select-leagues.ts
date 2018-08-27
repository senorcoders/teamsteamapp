import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


@IonicPage()
@Component({
  selector: 'page-select-leagues',
  templateUrl: 'select-leagues.html',
})
export class SelectLeaguesPage {

  public leagues = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient, public auth:AuthServiceProvider
  ) {
  }

  async ionViewDidLoad() {
    this.leagues = await this.http.get(`/roles?where={"name":"OwnerLeague","user":"${MyApp.User.id}"}`).toPromise() as any;
    this.leagues = this.leagues.filter(it=>{
      return it.league !== undefined;
    });
    this.leagues = this.leagues.map(function (it) {
      it.imageSrc = interceptor.transformUrl("/images/ramdon/teams&thumbnail/" + it.league.id);
      it.loadImage = false;
      return it;
    });
  }

  loadImage(league){
    league.loadImage = true;
  }

  public async select(league){
    await this.auth.updateRole(league);
    this.navCtrl.pop();
  }

}
