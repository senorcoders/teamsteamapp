import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { HttpClient } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SearchTeamsPage } from '../search-teams/search-teams';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { RegistrationPage } from '../registration/registration';
//import { PaymentSubscripcionPage } from '../payment-subscripcion/payment-subscripcion';
import { FormPlayerRegistrationPage } from '../form-player-registration/form-player-registration';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';

/**
 * para logearse en el app
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  
  public showPassword:boolean=false;
  public firstname:string="";
  public lastname:string="";
  public email:string="";
  public password="";

  public emailTrans="";
  public passwordTrans="";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public authService: AuthServiceProvider,
    private ngZone: NgZone,
    public http : HttpClient, public statusBar: StatusBar,
    private helper: HelpersProvider
  ) {
    //this.statusBar.backgroundColorByName("white");
  }

  ionViewDidEnter(){
    this.statusBar.overlaysWebView(true);
  }

  async ionViewDidLoad() {
    this.helper.setLenguagueLocal();
    this.emailTrans = await this.helper.getWords("EMAIL");
    this.passwordTrans = await this.helper.getWords("PASSWORD");
    this.statusBar.overlaysWebView(true);
  }

  public forgotPassword(){
    console.log('forgot password');
  }

  public Register(){
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#008e76");
    this.navCtrl.push(RegistrationPage);
    //this.navCtrl.push(PaymentSubscripcionPage);
  }

  public async Login(){
    
    if( this.email == '' ){

      let emptyM = await this.helper.getWords("EMPTYFIELDS");
      this.presentAlert(emptyM);

    }else{

     this.authService.Login(this.email, async function(err, user){

        if(user){
          this.statusBar.overlaysWebView(false);
          this.statusBar.backgroundColorByHexString("#008e76");
          this.ngZone.run(() => this.navCtrl.setRoot(EventsSchedulePage));
        }else if( err ){

          if( err.hasOwnProperty("message") ){

            let passwordM = await this.helper.getWords("INVALIDUSERNAMEYPASS")
            this.presentAlert(passwordM);
            return;

          }else if( err.hasOwnProperty("verify") ){
            let msgVerifiedEmail = await this.helper.getWords("VERFIEDDEVICE");
            this.presentAlert(msgVerifiedEmail);
            return;
          }else{

            let invalidM = await this.helper.getWords("INVALIDPASS");
            this.presentAlert(invalidM);
            return;
          }
          
        }else{
          this.alertCtrl.create({
            title: "Error",
            message: "Error In The Connection",
            buttons: ["Ok"]
          }).present();
        }

      }.bind(this));

    }
  }

  async presentAlert(message) {

    let requiredM = await this.helper.getWords("REQUIRED");

    let alert = this.alertCtrl.create({
      title: requiredM,
      subTitle: message,
      buttons: ['Ok']
    });
    alert.present();
  }

  public async toPassword(){
    let response:any;
    response = await this.http.get('/user?where={"username":{"like":"'+ /*this.username+*/ '"}}').toPromise();
    if( response.length > 0){
      this.showPassword = true;
    }else{
      console.log("Register");
    }
    
  }

  public toUserName(){
    this.showPassword = false;
  }

  public goSearchTeam(){
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#008e76");
    this.navCtrl.push(SearchTeamsPage)
  }

  public goInvitation(){
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#008e76");
    this.navCtrl.push(FormPlayerRegistrationPage);
  }

  public goForgotPassword(){
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#008e76");
    this.navCtrl.push(ForgotPasswordPage);
  }

}
