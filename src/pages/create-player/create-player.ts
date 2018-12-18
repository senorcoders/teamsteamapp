import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { RosterPage } from '../roster/roster';
import { DatePicker } from '@ionic-native/date-picker';

@IonicPage()
@Component({
  selector: 'page-create-player',
  templateUrl: 'create-player.html',
})
export class CreatePlayerPage {

  public static __name = "CreatePlayerPage"

  // public username: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public password: string = "standard";

  public emailType = "player";

  public imageSrc: string;
  public image: boolean = false;

  public save: boolean = true;

  public user: any;
  public team: any;

  public birthDay: string = "";
  public gender: string = "";
  public yerseyNumber: string = "";
  public positions: string = "";
  public contacts: Array<any> = [];
  public nonPlayer: boolean = false;
  public managerAccess: boolean = false;

  public indexContact: number = 0;
  public nameContact: string = "";
  public infoContact: string = "";
  public typeContact: string = "email";

  public players = [];
  public playersSelects = [];
  public relationships = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    public loading: LoadingController, public helper: HelpersProvider,
    public datePicker: DatePicker
  ) {
    this.players = this.navParams.get("players");
  }

  ionViewDidLoad() {
    //let user:any = MyApp.User;
    if (this.navParams.get("team") === undefined) {
      let res = this.http.get("/teams/" + MyApp.User.team).toPromise();
      this.team = res;
    } else {
      this.team = this.navParams.get("team");
    }
    this.birthDay = moment().format("DD MMM YYYY");
  }

  public setDate() {
    this.datePicker.show({
      date: new Date(),
      mode: "date",
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(function (date) {
      this.birthDay = moment(date).format("DD MMM YYYY");
    }.bind(this))
  }

  public addContact() {

    if (
      this.nameContact == '' ||
      this.infoContact == ''
    ) {
      this.alertCtrl.create({
        title: "Required",
        message: "Empty fields",
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.contacts.push({
      name: this.nameContact,
      info: this.infoContact,
      type: this.typeContact
    });

    this.clearFieldsContact();

  }

  public editContact(contact: any, index: number) {
    this.indexContact = index;
    this.nameContact = contact.name;
    this.infoContact = contact.info;
    this.typeContact = contact.type;
    this.save = false;
  }

  public updateContact() {
    this.contacts[this.indexContact] = {
      name: this.nameContact,
      info: this.infoContact,
      type: this.typeContact
    };

    this.save = true;

    this.clearFieldsContact();
  }

  public removeContact(index: number) {
    if (this.contacts.length === 1)
      this.contacts = [];
    else
      this.contacts.splice(index, 1)
  }

  public clearFieldsContact() {
    this.nameContact = "";
    this.infoContact = "";
    this.typeContact = "email";
  }

  public async checkendEmail() {
    let res = await this.http.get("/user/enable/" + this.email).toPromise() as any;
    return !res.valid;
  }

  public async saveAction() {

    let load = HelpersProvider.me.getLoadingStandar();
    if (
      this.firstName == '' ||
      this.lastName == '' ||
      this.email == ''
    ) {

      load.dismiss();
      let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
        emptyM = await HelpersProvider.me.getWords("EMPTYFIELDS");
      this.alertCtrl.create({
        title: requiredM,
        message: emptyM,
        buttons: ["Ok"]
      }).present();

      return;
    }

    if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.email.toLowerCase())
    ) {

      load.dismiss();
      let emailERM = await HelpersProvider.me.getWords("EMAILINVALID");
      this.alertCtrl.create({
        title: "Error",
        message: emailERM,
        buttons: ["Ok"]
      }).present();
      return;
    }

    //si el correo es de jugador Comprobamos si ya existe el correo
    //si ya existe le avisamos al usuario
    if (this.emailType === "player") {
      if (await this.checkendEmail() === true) {
        return this.alertCtrl.create({
          message: await this.helper.getWords("PLAYEREXISTS"),
          buttons: [{ text: "No", handler: function () { load.dismiss() } }, {
            text: "Ok",
            handler: function () { this.savePlayer.bind(this)(load) }.bind(this)
          }]
        })
          .present();
      }
    }

    if (this.nonPlayer === false && this.managerAccess === false) {
      this.savePlayer.bind(this)(load);
    } else if (this.nonPlayer === true) {
      this.saveFamily.bind(this)(load);
    } else {
      this.saveManager.bind(this)(load);
    }


  }

  private async savePlayer(load: Loading) {

    let user: any = {
      // username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      email: this.email.toLowerCase(),
      image: this.imageSrc,
      emailType: this.emailType
    };

    let positions: Array<any> = this.positions.split(",");

    let player: any = {
      team: MyApp.User.team,
      birthDay: moment(this.birthDay, "DD MMM YYYY").toISOString(),
      yerseyNumber: this.yerseyNumber,
      gender: this.gender,
      nonPlayer: this.nonPlayer,
      managerAccess: this.managerAccess,
      positions: positions
    };
    if (this.navParams.get("team") !== undefined) {
      player.team = this.team.id;
    }

    try {

      user.contacts = this.contacts;
      user = await this.http.post("/user/player", { user, player }).toPromise();
      this.saveImage(user);

      load.dismiss();
      if (this.emailType === "family") {
        this.alertCtrl.create({
          message: await this.helper.getWords("DETAILSPLAYERCHECKEMAIL"),
          buttons: ["Ok"]
        })
          .present();
      }

      if (this.navParams.get("team") !== undefined) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.setRoot(RosterPage);
      }

    } catch (e) {
      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title: "Error",
        buttons: ["Ok"]
      }).present();
    }
  }

  public getEmail(id): String {
    let player = this.players.find(function (it) { return it.id === id; })
    if (player === undefined) { return ""; }
    return player.user.email;
  }

  private async saveFamily(load) {
    try {

      if (this.playersSelects.length === 0 ||
        this.playersSelects.length !== this.relationships.filter(it => it !== "").length
      ) {
        load.dismiss();
        let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
          emptyM = await HelpersProvider.me.getWords("EMPTYFIELDS");
        this.alertCtrl.create({
          title: requiredM,
          message: emptyM,
          buttons: ["Ok"]
        }).present();

        return;
      }

      let i = 0;
      let family = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email.toLowerCase(),
        emailType: this.emailType,
        team: MyApp.User.team,
        familys: this.playersSelects.map(function (it) {
          let p = { id: it, relationship: this.relationships[i] };
          i += 1;
          return p;
        }.bind(this))
      };
      let user = await this.http.post("/user/family", family).toPromise();
      this.saveImage(user);

      if (this.navParams.get("team") !== undefined) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.setRoot(RosterPage);
      }
    }
    catch (e) {
      console.error(e);
      this.helper.presentAlertErrorStandar();
    }

    load.dismiss();
  }

  private async saveManager(load) {
    try {
      let manager = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email.toLowerCase(),
        team: MyApp.User.team
      };
      let user = await this.http.post("/user/manager", manager).toPromise();
      this.saveImage(user);

      if (this.navParams.get("team") !== undefined) {
        this.navCtrl.pop();
      } else {
        this.navCtrl.setRoot(RosterPage);
      }
    }
    catch (e) {
      console.error(e);
      this.helper.presentAlertErrorStandar();
    }

    load.dismiss();
  }

  private async saveImage(user) {
    if (user.hasOwnProperty('image') && this.imageSrc !== '') {
      await this.http.post("/userprofile/images", {
        id: user.id,
        image: this.imageSrc,
        team: MyApp.User.team
      }).toPromise();
    }
  }

  public success() {
    this.image = true;
  }

  public changePhoto() {

    let t = this;

    this.helper.Camera({ width: 170, height: 170, quality: 90 }, true).then((result) => {
      t.imageSrc = result;
    })
      .catch((err) => {
        console.error(err);
      });

  }

}
