import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AddTeamsLeagueComponent } from '../../components/add-teams-league/add-teams-league';
import { RosterLeaguePage } from '../roster-league/roster-league';


@IonicPage()
@Component({
  selector: 'page-teams-league',
  templateUrl: 'teams-league.html',
})
export class TeamsLeaguePage {

  public static __name = "TeamsLeaguePage"


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
      it.imageSrc = interceptor.transformUrl("/images/ramdon/teams/" + it.id+ "-thumbnail");
      it.loadImage = false;
      return it;
    });
  }

  loadImage(team) {
    team.loadImage = true;
  }

  public async addTeam() {
    try {
      let m = this.modalCtrl.create(AddTeamsLeagueComponent, { teamsSelect: JSON.parse( JSON.stringify(this.teams) ) });
      m.present();
      m.onDidDismiss(this.addTeamPost.bind(this))
    }
    catch (e) {
      console.error(e);
    }
  }

  private async addTeamPost(teams) {
    if (teams) {
      let teamsNew = [];
      for(let team of teams){
        let index = this.teams.findIndex(it=>{
          return it.id === team.id;
        });
        if(index===-1){
          teamsNew.push(team);
        }
      }
      teams=teamsNew;
      await this.http.post("/leagues/team", { teams: teams.map(it => { return it.id; }), league: this.league.id }).toPromise() as any;
    }
  }

  public async toTeam(team){
    this.navCtrl.push(RosterLeaguePage, {team});
  }

}
