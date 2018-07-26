import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
//import { PaymentSubscripcionPage } from '../payment-subscripcion/payment-subscripcion';
import { StatusBar } from '@ionic-native/status-bar';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { Device } from '@ionic-native/device';
import { AddLocationUserFreeComponent } from '../../components/add-location-user-free/add-location-user-free';
import { Geolocation } from '@ionic-native/geolocation';
import { AgentFreePage } from '../agent-free/agent-free';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

  public username = "";
  public firstname = "";
  public lastname = "";
  public email = "";
  public password = "standar";
  public againpassword = "standar";

  public nameteam = "";
  public description = "";
  public city = "";
  public sport = "";

  public imageSrc = "";
  public image = false;

  public free = true;
  public level = "";
  public locations = [];
  public myPosition: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider,
    public statusBar: StatusBar, public device: Device,
    public modalCtrl: ModalController, public geolocation: Geolocation,
    public ngZone: NgZone
  ) {

  }

  public async getWord(key) {
    return HelpersProvider.me.getWords(key);
  }

  public changePhoto() {

    this.helper.Camera({ width: 200, height: 200, quality: 75 }).then((result) => {
      if (result) {
        this.imageSrc = result;
      }
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public success() {
    this.image = true;
  }

  public async addLocation() {
    /***
     * Para mostrar la position actual
     */
    if (this.myPosition === null || this.myPosition === undefined) {
      let load = HelpersProvider.me.getLoadingStandar();
      let resp: any;
      resp = await (this.geolocation as any).getCurrentPosition();
      console.log("location", resp);
      this.myPosition = { lat: resp.coords.latitude, lng: resp.coords.longitude };
      load.dismissAll();
    }

    let addLocation = this.modalCtrl.create(AddLocationUserFreeComponent, { origin: this.myPosition });
    addLocation.onDidDismiss(function (data) {
      if (data) {
        this.locations.push(data);
      }
    }.bind(this))
    addLocation.present();
  }

  public async editLocation(loc, index) {
    let addLocation = this.modalCtrl.create(AddLocationUserFreeComponent, { loc, origin: this.myPosition });
    addLocation.onDidDismiss(function (data) {
      if (data) {
        this.locations[index] = data;
      }
    }.bind(this))
    addLocation.present();
  }

  public removeLocation(loc, index) {
    if (this.locations.length === 1) {
      this.locations = [];
    } else if (this.locations.length > 1) {
      this.locations.splice(index, 1);
    }
  }

  public async save() {

    if (
      this.username === "" ||
      this.firstname === "" ||
      this.lastname === "" ||
      this.email === ""
    ) {
      let empty = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
        .present();
      return;
    }

    if (this.free === false) {
      if (
        this.nameteam === "" ||
        this.description === "" ||
        this.city === "" ||
        this.sport === ""
      ) {
        let empty = await this.helper.getWords("EMPTYFIELDS");
        this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
          .present();
        return;
      }
    } else {
      if (
        this.locations.length === 0
      ) {
        let empty = await this.helper.getWords("ADDPLACES");
        this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
          .present();
        return;
      }
    }

    let email: any = await this.http.get("/user/enable/" + this.email).toPromise();
    if (email.valid === false) {
      let emailM = await this.helper.getWords("EMAILREADY");
      this.alertCtrl.create({ message: emailM, buttons: ["Ok"] })
        .present();
      return;
    }


    let info = this.helper.getDeviceInfo();

    let user: any;
    if (this.free === false) {
      user = {
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
    } else {
      user = {
        user: {
          "username": this.username,
          "password": this.password,
          "firstName": this.firstname,
          "lastName": this.lastname,
          "email": this.email,
          locations: this.locations,
          freeAgent: true,
          "configuration": { "valid": true },
        }
      };
    }

    for (let n of Object.keys(info)) {
      user[n] = info[n];
    }

    if (this.free === false)
      await this.http.post("/user/team", user).toPromise();
    else
      await this.http.post("/user/free", user).toPromise()

    let call = async function (err, user) {

      if (user) {
        this.statusBar.overlaysWebView(false);
        this.statusBar.backgroundColorByName("white");
        if (MyApp.User.hasOwnProperty("team")) {
          this.ngZone.run(() => this.navCtrl.setRoot(EventsSchedulePage));
        } else {
          this.ngZone.run(() => this.navCtrl.setRoot(AgentFreePage));
        }
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
        let notConectionMSG = await this.helper.getWords("ERRORCONECTION");
        this.alertCtrl.create({
          title: "Error",
          message: notConectionMSG,
          buttons: ["Ok"]
        }).present();
      }

    }.bind(this)

    if (this.free === false)
      await this.auth.Login(user.email, call);
    else
      await this.auth.Login(user.user.email, call);
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


}
