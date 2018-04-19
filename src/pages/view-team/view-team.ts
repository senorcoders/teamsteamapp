import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { FormJoinTeamPage } from '../form-join-team/form-join-team';


@IonicPage()
@Component({
  selector: 'page-view-team',
  templateUrl: 'view-team.html',
})
export class ViewTeamPage {

  public team:any={};
  public image=false;
  public request:any={acept: false, idUser : "" };
  public requestReady=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private modalCtrl: ModalController
  ) {

    this.team = this.navParams.get("team");
    let ramdon = new Date().getTime();
    this.team.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams/"+ this.team.id);
    console.log(this.team);
    
    if( MyApp.hasOwnProperty("User") && MyApp.User.hasOwnProperty("id") ){

      if( this.team.hasOwnProperty("request") ){
        for(let r of this.team.request){
          if( r.idUser === MyApp.User.id ){
            this.request = r;
            this.requestReady = true;
            break;
          }
        }
      }
      
    }

  }

  public enableRequest(){
    if( this.team.hasOwnProperty("ready") || this.requestReady === true )
      return true;
  }


  public success(){
    this.image = true;
  }

  public async sendRequest(){

    if( MyApp.hasOwnProperty("User") && MyApp.User.hasOwnProperty("id") )
    {

      let requests = [];
      if( this.team.hasOwnProperty("request") ){
        for(let r of this.team.request){
          requests.push(r);
        }
      }

      requests.push({ acept: false, idUser : MyApp.User.id });

      let request:any = await this.http.put("/teams/"+ this.team.id, { request: requests }).toPromise();

      console.log(request);
      this.request = { acept: false, idUser : MyApp.User.id };
      this.requestReady = true;

    }else{

      let m = this.modalCtrl.create(FormJoinTeamPage);
      m.present();
      m.onDidDismiss(async function(user){

        if( user === undefined || user === null )
          return;
        
          let requests = [];
          if( this.team.hasOwnProperty("request") ){
            for(let r of this.team.request){
              requests.push(r);
            }
          }
    
          requests.push({ acept: false, idUser : "", user: user });
    
          let request:any = await this.http.put("/teams/"+ this.team.id, { request: requests }).toPromise();
    
          console.log(request);
          this.request = { acept: false, idUser : "", user: user };
          this.requestReady = true;

      }.bind(this));

    }
    
  }


}
