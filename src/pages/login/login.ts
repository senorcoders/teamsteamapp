import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { HttpClient } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar';
import { SearchTeamPage } from '../search-team/search-team';
import { SearchTeamsPage } from '../search-teams/search-teams';

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
  public remember:boolean;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public authService: AuthServiceProvider,
    private ngZone: NgZone,
    public http : HttpClient, public statusBar: StatusBar
  ) {
    this.statusBar.backgroundColorByName("white");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }
  public forgotPassword(){
    console.log('forgot password');
  }
  public Register(){
    console.log('register');
  }
  public Login(){
    
    if( this.firstname == '' || this.lastname == '' ){
      this.presentAlert("There's empty fields");
    }else{
      let t = this;
     this.authService.Login(this.firstname, this.lastname, function(err, user){
        if(user){
          t.statusBar.backgroundColorByHexString("#008e76");
          t.ngZone.run(() => t.navCtrl.setRoot(EventsSchedulePage));
        }else if(err){
          t.presentAlert("Invalid username or password");
          return;
        }else{
          t.alertCtrl.create({
            title: "Error",
            message: "Error In The Connection",
            buttons: ["Ok"]
          }).present();
        }
      });

    }
  }

  presentAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Required',
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
    this.navCtrl.push(SearchTeamsPage)
  }

}
