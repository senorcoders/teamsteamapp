import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
//import { CreatePlayerDetailsPage } from '../create-player-details/create-player-details';
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

  // public username: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public password: string = "standard";
  public passwordCheck: string = "standard";

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


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    public loading: LoadingController, public helper: HelpersProvider,
    public datePicker: DatePicker
  ) {
  }

  ionViewDidLoad() {
    //let user:any = MyApp.User;
    if (this.navParams.get("team") === undefined) {
      let res = this.http.get("/teams/" + MyApp.User.team).toPromise();
      this.team = res;
    }else{
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

  public async saveAction() {

    let load = HelpersProvider.me.getLoadingStandar();
    if (
      this.firstName == '' ||
      this.lastName == '' ||
      this.email == '' ||
      this.password == '' ||
      this.passwordCheck == ''
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


    this.user = {
      // username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      email: this.email.toLowerCase(),
      image: this.imageSrc
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
    if (this.navParams.get("team") !== undefined){
      player.team = this.team.id;
    }

    try {

      this.user.contacts = this.contacts;
      let user: any = await this.http.post("/user/player", { user: this.user, player: player }).toPromise();


      if (this.user.hasOwnProperty('image') && this.user.image != '') {
        await this.http.post("/images/users", {
          id: user.id,
          image: this.user.image
        }).toPromise();
      }


      load.dismiss();
      if (this.navParams.get("team") !== undefined){
        this.navCtrl.pop();
      }else{
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
