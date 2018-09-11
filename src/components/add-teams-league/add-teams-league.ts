import { Component } from '@angular/core';
import { ViewController, ModalController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { CreateTeamManagerPage } from '../../pages/create-team-manager/create-team-manager';


@Component({
  selector: 'add-teams-league',
  templateUrl: 'add-teams-league.html'
})
export class AddTeamsLeagueComponent {

  public search = "";
  public teams = [];
  public teamsSelect = [];

  constructor(public viewCtrl: ViewController, public http: HttpClient,
    public modalCtrl: ModalController, public navParams: NavParams
  ) {
    this.teamsSelect = this.navParams.get("teamsSelect");
  }

  public async searchTeams() {

    if(this.search===""){
      this.teams = [];
      return;
    }
    
    try {
      let params = { name: { "contains": this.search } };
      let teams: Array<any> = await this.http.get("/teams/?where=" + JSON.stringify(params)).toPromise() as any;
      this.teams = teams.filter(function (it) {
        let index = this.teamsSelect.findIndex(i => {
          return i.id === it.id;
        });
        return index === -1;
      }.bind(this)).map(function (it) {
        it.imageSrc = interceptor.transformUrl("/images/ramdon/teams/" + it.id+ "-thumbnail");
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

  public addTeam(team) {
    this.teamsSelect.push(team);
    this.teams = this.teams.filter(function (it) {
      let index = this.teamsSelect.findIndex(i => {
        return i.id === it.id;
      });
      return index === -1;
    }.bind(this));
  }

  public removeTeam(index) {
    if (this.teamsSelect.length === 1) {
      this.teamsSelect = [];
    } else {
      this.teamsSelect.splice(index, 1)
    }
  }

  public ready() {
    this.viewCtrl.dismiss(this.teamsSelect);
  }

  public createTeam() {
    let create = this.modalCtrl.create(CreateTeamManagerPage);
    create.present();
    create.onDidDismiss(function (team) {
      if (team) {
        this.teamsSelect.push(team);
      }
    }.bind(this));
  }
}
