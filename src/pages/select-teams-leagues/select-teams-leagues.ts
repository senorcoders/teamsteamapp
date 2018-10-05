import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AddTeamPage } from '../add-team/add-team';

@IonicPage()
@Component({
  selector: 'page-select-teams-leagues',
  templateUrl: 'select-teams-leagues.html',
})
export class SelectTeamsLeaguesPage {

  public roles = [];
  public havingTeams = false;
  public havingLeagues = false;
  public havingTeamsAndLeague = false;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private auth: AuthServiceProvider
  ) {
    this.roles = MyApp.User.roles;
  }

  async ionViewWillEnter() {
    try {
      //Para saber los tipos de roles
      let team = false, leagues = false;

      this.roles = await Promise.all(this.roles.map(async it => {
        it.identity = "";
        if (it.hasOwnProperty("league")) {
          leagues = true;
          try {
            if (it.league.typeObject()) {
              let league: any = await HelpersProvider.me.http.get("/leagues/" + it.league.id).toPromise();
              it.identity = league.name;
              it.imageSrc = interceptor.transformUrl("/images/ramdon/teams/" + it.league.id+ "-thumbnail");
            } else {
              let league: any = await HelpersProvider.me.http.get("/leagues/" + it.league).toPromise();
              it.identity = league.name;
              it.imageSrc = interceptor.transformUrl("/images/ramdon/teams/" + it.league+ "-thumbnail");
            }
          }
          catch (e) {
            console.error(e);
            it.identity = "";
          }
        }

        if (it.hasOwnProperty("team")){
          team = true;
          it.identity = it.team.name;
          it.imageSrc = interceptor.transformUrl("/images/ramdon/teams/" + it.team.id+ "-thumbnail");
        }
          

        return it;
      }));

      this.roles = this.roles.filter(it => it.name !== "");
      if(team !== false && leagues === false)
        this.havingTeams = true;
      else if(team === false && leagues !== false)
        this.havingLeagues = true;
      else
        this.havingTeamsAndLeague = true;
        
      console.log(this.roles);
    }
    catch (e) {
      console.error(e);
    }
  }

  public errorLoadImage(e) {
    e.target.src = "./assets/imgs/logo-login.png";
  }

  public isSelect(role) {
    return role.id === MyApp.User.role.id;
  }

  public isEditable(role) {
    //No hay pantalla para editar league
    // if (role.hasOwnProperty("league") && role.name === "OwnerLeague") {
    //   return true;
    // }
    if (role.hasOwnProperty("team") && role.name === "Manager") {
      return true;
    }
    return false;
  }

  public async setRole(role) {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      await this.auth.updateRole(role);
      await this.auth.setTimeZoneTeam();
      await HelpersProvider.me.setGeofences(200);
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
    this.navCtrl.pop();

  }

  public editRole(role){
    //No hay pantalla para editar league
    // if (role.hasOwnProperty("league")) {
    //   return true;
    // }
    if (role.hasOwnProperty("team")) {
      this.navCtrl.push(AddTeamPage, { role });
    }
  }

}
