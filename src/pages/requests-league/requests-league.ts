import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { RequestLeaguePage } from '../request-league/request-league';
import { interceptor } from '../../providers/auth-service/interceptor';


@IonicPage()
@Component({
  selector: 'page-requests-league',
  templateUrl: 'requests-league.html',
})
export class RequestsLeaguePage {

  public requests = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ionViewWillEnter() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let requests: Array<any> = await this.http.get(`/teamleague?where={"teamPre":"${MyApp.User.team}"}`).toPromise() as any;
      this.requests = await Promise.all(requests.map(async function (it) {
        it.team = await this.http.get("/teams/" + it.teamPre).toPromise();
        it.league = await this.http.get("/leagues/" + it.leaguePre).toPromise();

        return it;
      }.bind(this)));

      this.requests = this.requests.filter(it => {
        return it.team !== undefined && it.league !== undefined;
      });
      this.requests = this.requests.map(it => {
        it.league.imgSrc = interceptor.transformUrl("/images/ramdon/leagues/" + it.league.id+ "-thumbnail");
        it.league.loadImage = false;
        return it;
      });
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
  }

  public loadImage(request) {
    request.league.loadImage = true;
  }

  public toRequest(request) {
    let r = JSON.parse(JSON.stringify(request));
    r.league.loadImage = false;
    this.navCtrl.push(RequestLeaguePage, { request: r });
  }

}
