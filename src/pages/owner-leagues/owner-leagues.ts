import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { SelectOwnerLeaguePage } from '../select-owner-league/select-owner-league';


@IonicPage()
@Component({
  selector: 'page-owner-leagues',
  templateUrl: 'owner-leagues.html',
})
export class OwnerLeaguesPage {

  public owners = [];
  public user = MyApp.User;
  public league = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewWillEnter() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      if (MyApp.User.role.league.typeObject() === true)
        this.league = MyApp.User.role.league.id;
      else
        this.league = MyApp.User.role.league;

      this.owners = await this.http.get(`/roles?where={"name":"OwnerLeague","league":"${this.league}"}`).toPromise() as any[];
      this.owners = this.owners.filter(it => {
        return it.user !== undefined && it.user !== null;
      });
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
  }

  public addOwner() {
    let newOwner = HelpersProvider.me.modalCtrl.create(SelectOwnerLeaguePage);
    newOwner.present();
    newOwner.onDidDismiss(function (user) {
      if (user) {
        this.saveOwner(user);
      }
    }.bind(this));
  }

  private async saveOwner(owner) {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      await this.http.post("/league/owner", { owner, league: this.league }, { responseType: "text" }).toPromise();
      await this.ionViewWillEnter();
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
  }

}
