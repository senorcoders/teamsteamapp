import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AddTeamPage } from '../add-team/add-team';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { SearchTeamsPage } from '../search-teams/search-teams';


@IonicPage()
@Component({
  selector: 'page-teams-profile',
  templateUrl: 'teams-profile.html',
})
export class TeamsProfilePage {

  public menu=false;
  public teams:Array<any>=[];
  public user:any={ role: {} };

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient, private auth: AuthServiceProvider
  ) {
    this.user = MyApp.User;
    this.menu = this.navParams.get("menu") || false;
  }

  async ionViewDidEnter(){
    await this.getTeams();
  }
  
  async getTeams(){
    try{

      let teams:any = await this.http.get("/manager/teams/"+ MyApp.User.id).toPromise();
      this.teams = teams.map(function(it){
        let ramdon = new Date().getTime();
        it.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams&thumbnail/"+ it.team.id);
        it.loadImage=false; 
        return it;
      });
      
    }
    catch(e){
      console.error(e);
    }
  }

  public loadImage(team:any){
    team.loadImage = true;
  }

  async addTeam(){

    this.navCtrl.push(AddTeamPage)

  }

  public isSelect(team){
    return team.team.id === MyApp.User.team;
  }

  public async setTeam(team){
    await this.auth.updateTeam(team.team.id);
    
    //Para actualizar el nombre del equipo en menu slide
    let t:any = await this.http.get("/teams/"+ MyApp.User.team).toPromise();
    document.getElementById("nameTeam").innerHTML = t.name;
  }

  public editTeam(team){
    this.navCtrl.push(AddTeamPage, { team });
  }

  public searchTeams(){
    this.navCtrl.push(SearchTeamsPage);
  }

}
