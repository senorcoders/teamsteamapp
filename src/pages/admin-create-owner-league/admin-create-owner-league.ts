import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { SelectLeaguePage } from '../select-league/select-league';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-admin-create-owner-league',
  templateUrl: 'admin-create-owner-league.html',
})
export class AdminCreateOwnerLeaguePage {

  public username = "";
  public firstname = "";
  public lastname = "";
  public email = "";

  public leagueId = "";
  public user: any = MyApp.User;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public modalCtrl: ModalController
  ) {

  }

  ionViewDidLoad() {
    //Si el rol es de league cargamos la liga
    if (this.user.role.league !== undefined && this.user.role.league !== null) {
      if (Object.prototype.toString.call(this.user.role.league) === "[object Object]")
        this.leagueId = this.user.role.league.id;
      else
        this.leagueId = this.user.role.league;
    }
  }

  public async addOwnerLeague() {

    let load = HelpersProvider.me.getLoadingStandar();
    let valid = HelpersProvider.me.validadorFields(this, [
      { value: this.username, type: "text", nameMessage: "Username" },
      { value: this.firstname, type: "text", nameMessage: "FIRSTNAME" },
      { value: this.lastname, type: "text", nameMessage: "LASTNAME" },
      { value: this.email, type: "email", nameMessage: "Email" },
    ]);
    if (valid.valid === false) {
      load.dismiss();
      return;
    }

    try{
      let user = {
        username: this.username,
        email: this.email,
        firstName: this.firstname,
        lastName: this.lastname
      };
  
      await this.http.post("/league/owner/create-user", { user, league: this.leagueId }, { responseType: "text" }).toPromise();
      this.navCtrl.pop();
    }
    catch(e){
      console.error(e);
    }

    load.dismiss();
  }

  // public selectLeague() {
  //   let p = this.modalCtrl.create(SelectLeaguePage);
  //   p.present();
  //   p.onDidDismiss(function (league) {
  //     if (league) {
  //       this.league = league;
  //     }
  //   }.bind(this))
  // }

}
