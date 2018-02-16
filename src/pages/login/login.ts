import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';

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

  public firstname:string="";
  public lastname:string="";
  public email:string="";
  public remember:boolean;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public authService: AuthServiceProvider,
    private ngZone: NgZone
  ) {
    
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
    console.log(this.firstname)
    if( this.firstname == '' || this.lastname == '' || this.email==''  ){
      this.presentAlert("There's empty fields");
    }else{
      let t = this;
     this.authService.Login(this.firstname, this.lastname, function(err, user){
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

}
