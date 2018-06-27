import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
//import { PaymentSubscripcionPage } from '../payment-subscripcion/payment-subscripcion';
import { StatusBar } from '@ionic-native/status-bar';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { Device } from '@ionic-native/device';


@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {
  
  public username="";
  public firstname="";
  public lastname="";
  public email="";
  public password="standar";
  public againpassword="standar";

  public nameteam="";
  public description="";
  public city="";
  public sport="";

  public imageSrc="";
  public image=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    private http: HttpClient, public auth:AuthServiceProvider,
    public statusBar: StatusBar, public device: Device
  ) {
  
  
  
  }

  public changePhoto(){
    
    this.helper.Camera({ width : 200, height: 200, quality: 75 }).then((result)=>{
      if( result ){
        this.imageSrc = result;
      }
    })
    .catch((err)=>{
      console.error(err);
    });

  }

  public success(){
    this.image = true;
  }

  public async save(){

    let invalid = false;

    for(let it of Object.keys(this) ){

      if( Object.prototype.toString.call(this[it]) === "[object String]" && it !== "imageSrc" ){

        if( this[it] === "" ){
          invalid = true;
          break;
        }

      }

    }

    if( invalid === true ){
      let empty = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
      .present();
      return;
    }

    let email:any = await this.http.get("/user/enable/"+ this.email).toPromise();
    if( email.valid === false ){
      let emailM = await this.helper.getWords("EMAILREADY");
      this.alertCtrl.create({ message:  emailM, buttons: ["Ok"]})
      .present();
      return;
    }

    /*if( this.password !== this.againpassword ){
      let emptM = await this.helper.getWords("PASSWORDNOT");
      this.alertCtrl.create({ title: "Error", message: emptM })
      .present();
      return;

    }*/

    let info = this.helper.getDeviceInfo();

    let user:any = {
      "username": this.username,
      "password": this.password,
      "firstName": this.firstname,
      "lastName": this.lastname,
      "email": this.email,
      "newTeam": true,
      "teamName": this.nameteam,
      "description": this.description,
      "sport": this.sport,
      "city": this.city,
      "configuration": { "valid": true }
    };

    for(let n of Object.keys(info)){
      user[n] = info[n];
    }

    /*let newUserTeam = */await this.http.post("/user/team", user).toPromise();

    let call = async function(err:any, user:any){

      if(user){
        this.statusBar.backgroundColorByName("white");
        //this.navCtrl.setRoot(PaymentSubscripcionPage);
        this.navCtrl.setRoot(EventsSchedulePage);
      }else if( err ){

        if( !err.hasOwnProperty("password") ){

          let passwordM = await this.helper.getWords("INVALIDUSERNAMEYPASS")
          this.presentAlert(passwordM);
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

    }.bind(this);

    await this.auth.Login(user.email, call)

  }


}
