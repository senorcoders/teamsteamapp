import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AddTeamsLeagueComponent } from '../../components/add-teams-league/add-teams-league';


@IonicPage()
@Component({
  selector: 'page-teams-league',
  templateUrl: 'teams-league.html',
})
export class TeamsLeaguePage {

  public league: any;
  public teams = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public modalCtrl: ModalController
  ) {
    this.league = MyApp.User.role.league;
  }

  async ionViewDidLoad() {
    if (Object.prototype.toString.call(this.league) === "[object Object]")
      this.league = await this.http.get(`/leagues/${this.league.id}`).toPromise() as any;
    else
      this.league = await this.http.get(`/leagues/${this.league}`).toPromise() as any;

    this.teams = this.league.teams.map(function (it) {
      it.imageSrc = interceptor.transformUrl("/images/ramdon/teams&thumbnail/" + it.id);
      it.loadImage = false;
      return it;
    });
  }

  loadImage(team) {
    team.loadImage = true;
  }

  public async addTeam() {
    try {
      let m = this.modalCtrl.create(AddTeamsLeagueComponent, { teamsSelect: [] });
      m.present();
      m.onDidDismiss(this.addTeamPost.bind(this))
    }
    catch (e) {
      console.error(e);
    }
  }

  private async addTeamPost(teams) {
    if (teams) {
      await this.http.post("/leagues/team", { teams: teams.map(it => { return it.id; }), league: this.league.id }).toPromise() as any;
      this.teams = this.teams.concat(teams);
    }
  }

}
