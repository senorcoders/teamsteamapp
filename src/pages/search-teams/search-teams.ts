import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ViewTeamPage } from '../view-team/view-team';
import { MyApp } from '../../app/app.component';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


@IonicPage()
@Component({
  selector: 'page-search-teams',
  templateUrl: 'search-teams.html',
})
export class SearchTeamsPage {

  public static __name = "SearchTeamsPage"


  @ViewChild("#sear") Search;
  public filtro="";
  public teams:Array<any>=[];
  public user=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private auht: AuthServiceProvider
  ) {
  }

  async ngOnInit(){
    this.user = await this.auht.checkUser();
  }

  public async search(){
    if( this.filtro === "" ){
      this.teams = [];
      return;
    }

    let params = { name: {"contains" : this.filtro } };
    let teams:any = await this.http.get("/teams/?where="+ JSON.stringify(params) ).toPromise();
    this.teams = teams.map(function(it){ 
      let ramdon = new Date().getTime();
      it.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams/"+ it.id+ "-thumbnail");
      it.loadImage=false;

      if( this.user === true ){
        for(let manager of it.managers){
          if( manager.user === MyApp.User.id ){
            it.ready = true;
            break;
          }
        }
      }

      return it;
    }.bind(this));
    //console.log(this.teams);
  }

  ionViewLoaded() {

    setTimeout(() => {
      this.Search.setFocus();
    },150);

 }

  public loadImage(team){
    team.loadImage = true;
  }

  public goTeam(team:any){
    this.navCtrl.push(ViewTeamPage, { team });
  }

}
