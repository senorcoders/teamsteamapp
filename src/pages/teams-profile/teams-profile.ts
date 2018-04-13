import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AddTeamPage } from '../add-team/add-team';


@IonicPage()
@Component({
  selector: 'page-teams-profile',
  templateUrl: 'teams-profile.html',
})
export class TeamsProfilePage {

  public teams:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient
  ) {
  }

  async ionViewDidEnter(){
    await this.getTeams();
  }
  
  async getTeams(){
    try{

      let teams:any = await this.http.get("/manager/teams/"+ MyApp.User.id).toPromise();
      this.teams = teams.map(function(it){
        it.imageSrc = interceptor.transformUrl("/images/teams&thumbnail/"+ it.team.id);
        return it;
      });
      console.log(this.teams);
    }
    catch(e){
      console.error(e);
    }
  }

  async addTeam(){

    this.navCtrl.push(AddTeamPage)

  }

}
