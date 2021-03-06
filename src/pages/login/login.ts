import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
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
import { MyApp } from '../../app/app.component';
import { AgentFreePage } from '../agent-free/agent-free';
import { Diagnostic } from '@ionic-native/diagnostic';
import { TabsPage } from '../tabs/tabs';

/**
 * para logearse en el app
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public static __name = "LoginPage"

  public showPassword: boolean = false;
  public firstname: string = "";
  public lastname: string = "";
  public email: string = "";
  public password = "";
  public username = "";
  // public usernameTrans = "";

  public emailTrans = "";
  public passwordTrans = "";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public authService: AuthServiceProvider,
    public http: HttpClient, public statusBar: StatusBar,
    private helper: HelpersProvider,
    private diagnostic: Diagnostic,
    public plt: Platform
  ) {

  }

  ionViewDidEnter() {
    this.statusBar.overlaysWebView(true);
  }

  async ionViewDidLoad() {
    this.helper.setLenguagueLocal();
    this.emailTrans = await this.helper.getWords("EMAIL");
    // this.passwordTrans = await this.helper.getWords("PASSWORD");
    this.statusBar.overlaysWebView(true);
  }

  public forgotPassword() {
    console.log('forgot password');
  }

  public Register() {
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#fe324d");
    this.navCtrl.push(RegistrationPage);
    //this.navCtrl.push(PaymentSubscripcionPage);
  }

  showGPSalert() {
    this.diagnostic.isLocationEnabled().then(
      (isAvailable) => {
        console.log('Is available? ' + isAvailable);
        if (isAvailable == false) {
          const confirm = this.alertCtrl.create({
            title: 'Turn on GPS Location Services',
            message: 'Please turn on your GPS location services',
            buttons: [
              {
                text: 'Cancel',
                handler: () => {
                  console.log('Disagree clicked');
                }
              },
              {
                text: 'Go to Settings',
                handler: () => {
                  this.diagnostic.switchToLocationSettings();
                }
              }
            ]
          });
          confirm.present();
        }
      }).catch((e) => {
        console.log(e);
      });
  }

  public async Login() {
    document.getElementById('login-button').innerHTML = "...Loading";
    // if (this.username === '') {
    //   let emptyM = await this.helper.getWords("EMPTYFIELDS");
    //   this.presentAlert(emptyM);
    // } else {
    //   this.authService.LoginWithUsername(this.username, this.actionLogin.bind(this));
    // }
    if (this.email === '') {
      let emptyM = await this.helper.getWords("EMPTYFIELDS");
      document.getElementById('login-button').innerHTML = "LOGIN AGAIN";
      this.presentAlert(emptyM);
    } else {
      this.authService.Login(this.email, this.actionLogin.bind(this));
    }
  }

  private async actionLogin(err, user) {
    if (user) {
      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString("#fe324d");

      if (MyApp.User.role.name === "Player" && MyApp.User.role.firstTime === undefined) {
        await this.http.put("/roles/" + MyApp.User.role.id, { firstTime: true }).toPromise()
      }

      if (MyApp.User.hasOwnProperty("team") || MyApp.User.role.name === "OwnerLeague") {
        await this.navCtrl.setRoot(TabsPage);
        // await this.navCtrl.setRoot(EventsSchedulePage);
        if (this.plt.is('ios')) {
          this.showGPSalert();
        }
      } else {
        await this.navCtrl.setRoot(TabsPage);
        // await this.navCtrl.setRoot(AgentFreePage);
        if (this.plt.is('ios')) {
          this.showGPSalert();
        }
      }
      await MyApp.initNotifcations();

    } else if (err) {

      if (err.hasOwnProperty("message")) {

        let passwordM = await this.helper.getWords("INVALIDUSERNAMEYPASS")
        this.presentAlert(passwordM);
        return;

      } else if (err.hasOwnProperty("verify")) {
        let msgVerifiedEmail = await this.helper.getWords("VERFIEDDEVICE");
        this.presentAlert(msgVerifiedEmail);
        return;
      } else {

        let invalidM = await this.helper.getWords("INVALIDPASS");
        this.presentAlert(invalidM);
        return;
      }

    } else {
      this.alertCtrl.create({
        title: "Error",
        message: "Error In The Connection",
        buttons: ["Ok"]
      }).present();
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

  public async toPassword() {
    let response: any;
    response = await this.http.get('/user?where={"username":{"like":"' + /*this.username+*/ '"}}').toPromise();
    if (response.length > 0) {
      this.showPassword = true;
    } else {
      console.log("Register");
    }

  }

  public toUserName() {
    this.showPassword = false;
  }

  public goSearchTeam() {
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#fe324d");
    this.navCtrl.push(SearchTeamsPage)
  }

  public goInvitation() {
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#fe324d");
    this.navCtrl.push(FormPlayerRegistrationPage);
  }

  public goForgotPassword() {
    this.statusBar.overlaysWebView(false);
    this.statusBar.backgroundColorByHexString("#fe324d");
    this.navCtrl.push(ForgotPasswordPage);
  }

}
