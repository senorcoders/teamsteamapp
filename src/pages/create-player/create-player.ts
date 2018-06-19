import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { CreatePlayerDetailsPage } from '../create-player-details/create-player-details';
import { HelpersProvider } from '../../providers/helpers/helpers';

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
  public password:string="standard";
  public passwordCheck:string="standard";

  public imageSrc:string;
  public image:boolean=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
   public loading: LoadingController,
    public helper:HelpersProvider
  ) {
  }

  ionViewDidLoad() {
    
  }

  public async save(){

    if(
      this.firstName == '' ||
      this.lastName == '' ||
      this.email == '' ||
      this.password == '' ||
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
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.email)
    ){
      this.alertCtrl.create({
        title: "Invalid",
        message: "Invalid Email Format",
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
      }).present();
      return;
    }

    let user:any = {
          username: this.username,
          firstName: this.firstName,
          lastName: this.lastName,
          password: this.password,
          email: this.email,
          image: this.imageSrc
        };

    this.navCtrl.push(CreatePlayerDetailsPage, {
      user
    });

  }

  public success(){
    this.image = true;
  }

  public changePhoto(){
    
    let t = this;
    
    this.helper.Camera({ width : 200, height: 200, quality: 75 }).then((result)=>{
      t.imageSrc = result;
    })
    .catch((err)=>{
      console.error(err);
    });

  }

}
