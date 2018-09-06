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
import { SelectOwnerLeaguePage } from '../select-owner-league/select-owner-league';
import { AddTeamsLeagueComponent } from '../../components/add-teams-league/add-teams-league';


@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

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

  public selectNew = "team";

  //Para crear ligas
  public imageLeague = false;
  public nameLeague = "";
  public descriptionLeague = "";
  public usersOwners = [];
  public teamsSelect = [];
  public imageSrcLeague = "";

  public userValid=false;
  public teamValid=false;
  public leagueValid=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider,
    public statusBar: StatusBar, public device: Device,
    public modalCtrl: ModalController, public geolocation: Geolocation,
    public ngZone: NgZone
  ) {
    this.selectNew = "team";
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

  //#region for create league
  public changePhotoLeague() {

    this.helper.Camera({ width: 200, height: 200, quality: 75 }).then((result) => {
      if (result) {
        this.imageSrcLeague = result;
      }
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public addOwners() {
    let add = this.modalCtrl.create(SelectOwnerLeaguePage);
    add.present();
    add.onDidDismiss(function (user) {
      if (user) {
        let index = this.usersOwners.findIndex(it => {
          return it.id === user.id;
        });
        console.log(user, this.usersOwners, index);
        if (index === -1) {
          this.usersOwners.push(user);
        }
      }
    }.bind(this))
  }

  public removeOwner(i: number) {
    if (this.usersOwners.length === 1) {
      this.usersOwners = [];
    } else {
      this.usersOwners.splice(i, 1);
    }
  }

  public addTeams() {
    let m = this.modalCtrl.create(AddTeamsLeagueComponent, { teamsSelect: this.teamsSelect });
    m.present();
    m.onDidDismiss(function (data: Array<any>) {
      if (data) {
        this.teamsSelect = data;
      }
    }.bind(this))
  }

  public loadImage(team) {
    team.loadImage = true;
  }

  public removeTeam(index) {
    if (this.teamsSelect.length === 1) {
      this.teamsSelect = [];
    } else {
      this.teamsSelect.splice(index, 1)
    }
  }

  //#endregion

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

  public successLeague() {
    this.imageLeague = true;
  }

  validEmail(){
    return !this.helper.validEmail(this.email);
  }

  public async save(){
    let load = this.helper.getLoadingStandar();
    await this.saveAction();
    load.dismiss();
  }
  public async saveAction() {
    
    try {

      this.userValid = true;

      if (
        this.firstname === "" ||
        this.lastname === "" ||
        this.email === ""
      ) {
        let empty = await this.helper.getWords("EMPTYFIELDS");
        this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
          .present();
        return;
      }

      if (this.selectNew === "team") {
        this.teamValid = true;
        if (
          this.nameteam === "" ||
          this.city === "" ||
          this.sport === ""
        ) {
          let empty = await this.helper.getWords("EMPTYFIELDS");
          this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
            .present();
          return;
        }
      } else if (this.selectNew === "ownerLeague") {
        this.leagueValid=true;
        if (
          this.nameLeague == ''
        ) {
          let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
            emptyM = await HelpersProvider.me.getWords("EMPTYFIELDS");
          this.alertCtrl.create({
            title: requiredM,
            message: emptyM,
            buttons: ["Ok"]
          }).present();

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
      if (this.selectNew === "team") {
        user = {
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
      } else if (this.selectNew === "agentFree") {
        user = {
          user: {
            "password": this.password,
            "firstName": this.firstname,
            "lastName": this.lastname,
            "email": this.email,
            locations: this.locations,
            freeAgent: true,
            "configuration": { "valid": true },
          }
        };
      } else {
        user = {
          "password": this.password,
          "firstName": this.firstname,
          "lastName": this.lastname,
          "email": this.email,
        };
      }

      for (let n of Object.keys(info)) {
        user[n] = info[n];
      }

      if (this.selectNew === "team")
        await this.http.post("/user/team", user).toPromise();
      else if (this.selectNew === "agentFree")
        await this.http.post("/user/free", user).toPromise();
      else {
        user = await this.http.post("/user", user).toPromise();
        this.usersOwners.push(user);
        let users: any[] = [];
        for (let us of this.usersOwners) {
          let index = users.findIndex(it => {
            return us.id === it.id;
          });
          if (index === -1) {
            users.push(us);
          }
        }
        let league = {
          name: this.nameLeague,
          description: this.descriptionLeague,
          teams: this.teamsSelect,
          owners: users
        };
        await this.http.post("/league/new", league).toPromise();

        if (this.imageSrcLeague !== "") {
          await this.http.post("/images/leagues", {
            id: user.id,
            image: this.imageSrc
          }).toPromise();
        }
      }

      let call = async function (err, user) {

        if (user) {
          this.statusBar.overlaysWebView(false);
          this.statusBar.backgroundColorByHexString("#fe324d");
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
  
      if (this.selectNew === "team")
        await this.auth.Login(user.email, call);
      else if (this.selectNew === "agentFree")
        await this.auth.Login(user.user.email, call);
      else
        await this.auth.Login(user.email, call);

    }
    catch (e) {
      console.error(e);
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


}
