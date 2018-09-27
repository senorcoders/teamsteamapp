import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { LoginPage } from '../login/login';


@IonicPage()
@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {

  public static __name = "ResetPaswordPage"


  public code="";
  public password="";
  public repeatPassword="";
  public email="";
  public codeValid = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private helper: HelpersProvider,
    private alertCtrl: AlertController
  ) {
    this.email = this.navParams.get("email");
  }

  public checkCodeInput(){
    if( this.code.length === 4 ){
      this.checkForgot();
    }
  }

  private async checkForgot(){

    try{

      let fort = await this.http.get(`/user/reset-password/${this.email}/${this.code}`).toPromise();
      if( fort.hasOwnProperty("invalid") ){
        let inavalidM = await this.helper.getWords("RESETPASS.CODEINVALID");
        this.alertCtrl.create({
          message: inavalidM,
          buttons: ["Ok"]
        })
        .present();
        this.codeValid = false;
        return;
      }

      this.codeValid = true;

    }
    catch(e){
      console.error(e);
    }

  }

  public async change(){

    if( this.code === "" ||
      this.password === "" ||
      this.repeatPassword === ""
    ){

      let empty = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({
        title: "Error",
        message: empty,
        buttons: ["Ok"]
      })
      .present();
      return;
    }

    if( this.password !== this.repeatPassword ){

      let passnot = await this.helper.getWords("PASSWORDNOT");
      this.alertCtrl.create({
        title: "Error",
        message: passnot,
        buttons: ["Ok"]
      })
      .present();
      return;
    }

    let load = this.helper.getLoadingStandar();

    try{

      let pass:any = this.http.post("/reset-password", {
        email: this.email,
        code: this.code,
        password: this.password
      }).toPromise();

      if( pass.hasOwnProperty("invalid") ){

        let Pec = await this.helper.getWords("ERORC");
        this.alertCtrl.create({
          title: "Error",
          message: Pec,
          buttons: ["Ok"]
        })
        .present();
      }else{
        this.navCtrl.setRoot(LoginPage);
      }

    }
    catch(e){
      console.log(e);
      let Pec = await this.helper.getWords("ERORC");
      this.alertCtrl.create({
        title: "Error",
        message: Pec,
        buttons: ["Ok"]
      })
      .present();
    }

    load.dismiss();
  }


}
