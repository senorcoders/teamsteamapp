import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';


@Component({
  selector: 'add-teams-league',
  templateUrl: 'add-teams-league.html'
})
export class AddTeamsLeagueComponent {

  public search = "";
  public teams = [];
  public teamsSelect = [];

  constructor(public viewCtrl: ViewController, public http: HttpClient) {

  }

  public async searchTeams() {
    try {
      let params = { name: { "contains": this.search } };
      let teams: any = await this.http.get("/teams/?where=" + JSON.stringify(params)).toPromise();
      this.teams = teams.map(function (it) {
        it.imageSrc = interceptor.transformUrl("/images/ramdon/teams&thumbnail/" + it.id);
        it.loadImage = false;
        return it;
      }.bind(this));
    }
    catch (e) {
      console.error(e);
    }
  }

  public loadImage(team) {
    team.loadImage = true;
  }

  public addTeam(team){
    this.teamsSelect.push(team);
  }

}
