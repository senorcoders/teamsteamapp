import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public showPassword:boolean=false;

  public username:string="";
  public password:string="";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public authService: AuthServiceProvider,
    private ngZone: NgZone,
    public http : HttpClient
  ) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  public Login(){
    
    if( this.username == '' || this.password == '' ){
      this.presentAlert("There's empty fields");
    }else{
      let t = this;
      this.authService.Login(this.username, this.password, function(err, user){
          if(user){
            t.ngZone.run(() => t.navCtrl.setRoot(EventsSchedulePage));
          }else{
            t.presentAlert("Invalid email or password");
            return;
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
    response = await this.http.get('/user?where={"username":{"like":"'+ this.username+ '"}}').toPromise();
    if( response.length > 0){
      this.showPassword = true;
    }else{
      console.log("Register");
    }
    
  }

  public toUserName(){
    this.showPassword = false;
  }

}
