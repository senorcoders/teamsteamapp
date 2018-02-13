import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

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

  public username:string="";
  public password:string="";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public alertCtrl:AlertController,
    public authService: AuthServiceProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  public Login(){
    console.log(this.username)
    if( this.username == '' || this.password == '' ){
      this.presentAlert("There's empty fields");
    }else{
      
      this.authService.Login(this.username, this.password, function(err, user){
          if(user){
            
          }else{
            this.presentAlert("Invalid email or password");
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
