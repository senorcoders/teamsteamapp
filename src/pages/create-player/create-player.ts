import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CreatePlayerDetailsPage } from '../create-player-details/create-player-details';
import { HelpersProvider } from '../../providers/helpers/helpers';

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

  public imageSrc:string;
  public image:boolean=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    private camera: Camera, public loading: LoadingController,
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
    const options: CameraOptions = {
      quality: 100,
      sourceType : 0,
      destinationType: this.camera.DestinationType.NATIVE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    let fnt = this;

    this.alertCtrl.create({ title : "Source", message : "Select a source",
    buttons : [{
      text : "Library",
      handler : function(){
        fnt.getPhoto(options);
      }
    }, {
      text : "Camera",
      handler: function(){
        options.sourceType  = 1;
        fnt.getPhoto(options);
      }
    }] }).present();

  }

  private getPhoto(options:any){
    let t = this;
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      //console.log(imageData);
      t.helper.PerformanceImage(imageData)
      .then(function(r){
        t.imageSrc = 'data:image/jpeg;base64,'+ r;
        //t.load.dismiss();
      })
      .catch(function(e){
        console.error(e);
      });

     }, (err) => {
      console.error(err);
     });
  }

}
