import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  public roles:Array<any>=[];
  public user:any={ role: {} };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private auth: AuthServiceProvider
  ) {
    this.user = MyApp.User;
    this.menu = this.navParams.get("menu") || false;
  }

  async ionViewDidEnter(){
    await this.getTeams();
  }
  
  async getTeams(){
    try{
      this.roles = MyApp.User.roles.map(function(it){
        let ramdon = new Date().getTime();
        it.team.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams&thumbnail/"+ it.team.id);
        it.team.loadImage=false; 
        return it;
      });
      
    }
    catch(e){
      console.error(e);
    }
  }

  public loadImage(role:any){
    role.team.loadImage = true;
  }

  async addTeam(){

    this.navCtrl.push(AddTeamPage)

  }

  public isSelect(role){
    return role.team.id === MyApp.User.team;
  }

  public async setTeam(role){
    await this.auth.updateRole(role);
    
    //Para actualizar el nombre del equipo en menu slide
    document.getElementById("nameTeam").innerHTML = role.team.name;

    this.navCtrl.pop();
  }

  public editTeam(role){
    this.navCtrl.push(AddTeamPage, { role });
  }

  public searchTeams(){
    this.navCtrl.push(SearchTeamsPage);
  }

}
