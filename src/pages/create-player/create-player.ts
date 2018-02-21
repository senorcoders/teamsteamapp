import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CreatePlayerDetailsPage } from '../create-player-details/create-player-details';

/**
 * Generated class for the CreatePlayerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-player',
  templateUrl: 'create-player.html',
})
export class CreatePlayerPage {

  public username:string="";
  public firstName:string="";
  public lastName:string="";
  public email:string="";
  public password:string="";
  public passwordCheck:string="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    private camera: Camera, public loading: LoadingController
  ) {
  }

  ionViewDidLoad() {
    
  }

  public async save(){

    let load = this.loading.create({ content: "Saving..." });
    load.present({ disableApp : true });

    if(
      this.firstName == '' &&
      this.lastName == '' &&
      this.email == '' &&
      this.password == '' &&
      this.passwordCheck == ''
    ){
      this.alertCtrl.create({
        title: "Required",
        message: "Empty fields",
        buttons: ["Ok"]
      }).present();
      
      return;
    }

    if(
      this.password !== this.passwordCheck
    ){
      this.alertCtrl.create({
        title: "Invalid",
        message: "Passwords do not match",
        buttons: ["Ok"]
      })
    }

    let user:any = {
          username: this.username,
          firstName: this.firstName,
          lastName: this.lastName,
          password: this.password,
          email: this.email
        };

    this.navCtrl.push(CreatePlayerDetailsPage, {
      user
    });

  }

}
