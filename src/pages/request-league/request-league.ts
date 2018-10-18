import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-request-league',
  templateUrl: 'request-league.html',
})
export class RequestLeaguePage {

  public static __name = "RequestLeague"


  public image = false;
  public request: any = {};
  public league: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.request = this.navParams.get("request");
    this.league = this.request.league;
  }

  async ionViewDidLoad() {

  }

  public async updateRequest(response) {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let request: any;
      request = {
        id: this.request.id,
        response,
        team: this.request.teamPre,
        league: this.league.id
      };

      let r = await this.http.put("/leagues/team", request).toPromise();
      console.log(r);
      this.navCtrl.pop();
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
  }


}
