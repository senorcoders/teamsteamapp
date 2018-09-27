import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { ResetPasswordPage } from '../reset-password/reset-password';


@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  public static __name = "ForgotPasswordPage"

  public email="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private helper: HelpersProvider, private alertCtrl: AlertController,
    private http: HttpClient
  ) {

  }

  public async rePassword(){

    if( !this.helper.validEmail(this.email) ){
      let invalidM = await this.helper.getWords("EMAILINVALID");
      this.alertCtrl.create({
        message: invalidM,
        buttons: ["Ok"]
      })
      .present();
      return;
    }
    
    try{

      let valid:any = await this.http.get("/user/enable/"+ this.email).toPromise();
      if( valid.valid === false ){

        //Preguntamos si quiere que le enviemos el codigo al correo
        let codeM = await this.helper.getWords("RESETPASS.SENDCODE");
          this.alertCtrl.create({
            message: codeM,
            buttons: [
              {text: "Ok", handler: async function(){
                
                try{

                  let pass:any = await this.http.post("/user/reset-password", { email : this.email }).toPromise();
                  if( pass.message === "ok" ){
                    this.navCtrl.push(ResetPasswordPage, { email: this.email });
                  }
                }catch(e){
                  console.error(e);
                  let notEmailM = await this.helper.getWords("EMAILNOT");
                  this.alertCtrl.create({
                    message: notEmailM,
                    buttons: ["Ok"]
                  })
                  .present();
                }
                 
              }.bind(this) },
              {text: "No", handler: function(){ this.navCtrl.push(ResetPasswordPage, { email: this.email }); }.bind(this) }              
            ]
          })
          .present();
        

      }else{
        let notEmailM = await this.helper.getWords("EMAILNOT");
        this.alertCtrl.create({
          message: notEmailM,
          buttons: ["Ok"]
        })
        .present();
      }

    }
    catch(e){
      console.error(e);
    }

  }

}
