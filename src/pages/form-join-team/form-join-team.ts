import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-form-join-team',
  templateUrl: 'form-join-team.html',
})
export class FormJoinTeamPage {

  public fullName = "";
  public email = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController, public alertCtrl: AlertController,
  private helper: HelpersProvider, private http:HttpClient
  ) {
  }

  public async sent(){

    if( this.fullName == "" || this.email == "" ){
      let requiredM = await this.helper.getWords("REQUIRED"),
      unex = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: unex })
      .present();
      return;
    }

    let email:any = await this.http.get("/user/enable/"+ this.email).toPromise();
    if( email.valid === false ){
      let emailM = await this.helper.getWords("EMAILREADY");
      this.alertCtrl.create({ message:  emailM, buttons: ["Ok"]})
      .present();
      return;
    }

    
    let user = { fullName: this.fullName, email: this.email };
    this.viewCtrl.dismiss(user);

  }

}
