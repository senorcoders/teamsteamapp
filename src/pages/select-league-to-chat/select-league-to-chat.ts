import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { ChatManagerOfTeamsLeaguePage } from '../chat-manager-of-teams-league/chat-manager-of-teams-league';
import { interceptor } from '../../providers/auth-service/interceptor';
import { GamesLeaguePage } from '../games-league/games-league';


@IonicPage()
@Component({
  selector: 'page-select-league-to-chat',
  templateUrl: 'select-league-to-chat.html',
})
export class SelectLeagueToChatPage {

  public leagues = [];
  public toGames = false;
  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient
  ) {
    if (this.navParams.get("toGames") === true) {
      this.toGames = true;
    }
  }

  async ionViewDidLoad() {
    let leagueteams = await this.http.get(`/teamleague?where={"team":"${MyApp.User.team}"}`).toPromise() as any[];
    leagueteams = leagueteams.filter(it => {
      return it.league !== undefined && it.league.typeObject();
    });

    for (let tl of leagueteams) {
      let index = this.leagues.findIndex(it => {
        return it.id === tl.league.id;
      });
      if (index === -1) {
        tl.league.imageSrc = interceptor.transformUrl("/images/ramdon/leagues/" + tl.league.id + "-thumbnail");
        this.leagues.push(tl.league);
      }

    }
  }

  public errorLoadImage(e) {
    e.target.src = "./assets/imgs/logo-login.png";
  }

  public async toChat(league) {
    await this.navCtrl.pop({ animation: "ios-transition" });
    if (this.toGames === false)
      this.navCtrl.push(ChatManagerOfTeamsLeaguePage, { league });
    else
      this.navCtrl.push(GamesLeaguePage, { league });
  }

}
