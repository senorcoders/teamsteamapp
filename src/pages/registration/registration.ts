import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { HelpersProvider, Field } from '../../providers/helpers/helpers';
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
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

  public static __name = "RegistrationPage"


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

  public selectNew = "team";

  //Para crear ligas
  public imageLeague = false;
  public nameLeague = "";
  public descriptionLeague = "";
  public usersOwners = [];
  public teamsSelect = [];
  public imageSrcLeague = "";

  public userValid = false;
  public teamValid = false;
  public leagueValid = false;

  public sports = [];

  public nohave = false;
  public emailVerification = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider,
    public statusBar: StatusBar, public device: Device,
    public modalCtrl: ModalController, public geolocation: Geolocation,
    public ngZone: NgZone, public storage: Storage
  ) {
    this.selectNew = "team";
  }

  async ionViewDidLoad() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      this.sports = await this.http.get("/sports").toPromise() as any[];
      if (this.helper.enableMapsLocation === false)
        await this.helper.reloadGoogleplaces();
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
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

  validEmail(email) {
    return !this.helper.validEmail(email);
  }

  public async save() {
    let load = this.helper.getLoadingStandar();
    await this.saveAction();
    load.dismiss();
  }

  public async saveAction() {

    try {

      this.userValid = true;
      let valid = this.helper.validadorFields(this, [
        { value: this.username, type: "text", nameMessage: "Username" },
        { value: this.firstname, type: "text", nameMessage: "FIRSTNAME" },
        { value: this.lastname, type: "text", nameMessage: "LASTNAME" },
        { value: this.email, type: "text", nameMessage: "Email" },
      ]);
      if (valid.valid === false) {
        return;
      }

      if (this.selectNew === "team") {
        this.teamValid = true;
        valid = this.helper.validadorFields(this, [
          { value: this.nameteam, type: "text", nameMessage: "NAMEOFTEAM" },
          { value: this.city, type: "text", nameMessage: "CITY" },
          { value: this.sport, type: "text", nameMessage: "SPORT" },
        ]);
        if (valid.valid === false) {
          return;
        }
      } else if (this.selectNew === "ownerLeague") {
        this.leagueValid = true;
        valid = this.helper.validadorFields(this, [
          { value: this.nameLeague, type: "text", nameMessage: "LEAGUE.NAMEOF" }
        ]);
        if (valid.valid === false) {
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

      let res = await this.http.put("/user-enable-username", { username: this.username }).toPromise() as { valid: boolean };
      if (res.valid === false) {
        let resM = await this.helper.getWords("USERNAMEREADY");
        this.alertCtrl.create({ message: resM, buttons: ["Ok"] })
          .present();
        return;
      }


      let info = this.helper.getDeviceInfo();
      let user: any;
      if (this.selectNew === "team") {
        user = {
          username: this.username,
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
        if (this.nohave === true) {
          user.emailVerification = this.emailVerification;
        }
      } else if (this.selectNew === "agentFree") {
        user = {
          user: {
            username: this.username,
            "password": this.password,
            "firstName": this.firstname,
            "lastName": this.lastname,
            "email": this.email,
            locations: this.locations,
            freeAgent: true,
            "configuration": { "valid": true },
          }
        };
        if (this.nohave === true) {
          user.user.emailVerification = this.emailVerification;
        }
      } else {
        user = {
          username: this.username,
          "password": this.password,
          "firstName": this.firstname,
          "lastName": this.lastname,
          "email": this.email,
        };
      }

      for (let n of Object.keys(info)) {
        user[n] = info[n];
      }

      if (this.selectNew === "team") {
        user = await this.http.post("/user/team", user).toPromise();
        user = user.user;
      } else if (this.selectNew === "agentFree") {
        user = await this.http.post("/user/free", user).toPromise();
      } else {
        user = await this.http.post("/user-registration", user).toPromise();
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
            this.storage.set('firstTime', true);
            this.storage.set('firstTimeRoster', true);
            this.ngZone.run(() => this.navCtrl.setRoot(TabsPage));
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
        await this.auth.LoginWithUsername(user.username, call);
      else if (this.selectNew === "agentFree")
        await this.auth.LoginWithUsername(user.user.username, call);
      else
        await this.auth.LoginWithUsername(user.username, call);

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
