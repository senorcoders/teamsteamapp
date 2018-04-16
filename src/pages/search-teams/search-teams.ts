import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';


@IonicPage()
@Component({
  selector: 'page-search-teams',
  templateUrl: 'search-teams.html',
})
export class SearchTeamsPage {

  public filtro="";
  public teams:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
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
      it.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams&thumbnail/"+ it.id);
      it.loadImage=false;
      return it;
    });
    console.log(this.teams);
  }

  public loadImage(team){
    team.loadImage = true;
  }

}
