import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { EditFamilyPage } from '../edit-family/edit-family';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { RosterPage } from '../roster/roster';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { DatePicker } from '@ionic-native/date-picker';
import { MyApp } from '../../app/app.component';

/**
 * para editar un player
 */

@IonicPage()
@Component({
  selector: 'page-member-roster',
  templateUrl: 'member-roster.html',
})
export class MemberRosterPage {

  public static __name = "MemberRosterPage"

  public load: Loading;

  public player: any;

  public save: boolean = true;

  public contacts: Array<any> = [];
  public nameContact: string = "";
  public infoContact: string = "";
  public idContact: string;
  public typeContact: string = "";

  public imageSrc: string;
  public image: boolean = false;

  public updateImageCallback: any;
  public index: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    public loading: LoadingController, public auth: AuthServiceProvider,
    private helper: HelpersProvider, public datePicker: DatePicker
  ) {

    this.player = this.navParams.get("player");
    this.updateImageCallback = this.navParams.get("updateImage");
    this.index = this.navParams.get("index");

    this.player.birthDayParsed = moment(this.player.birthDay).format("DD MMM YYYY");

    if (this.player.positions !== undefined) {
      if (Object.prototype.toString.call(this.player.positions) != '[object String]') {
        this.player.positions = this.player.positions.join(",");
      }
    } else {
      this.player.positions = "";
    }

    this.imageSrc = interceptor.transformUrl("/userprofile/images/" + this.player.user.id + "/" + MyApp.User.team);

    console.log(this.player);
  }

  //al iniciar cargamos los contactos del player
  async ngOnInit() {
    let cts: any;
    cts = await this.http.get("/contacts/user/" + this.player.user.id).toPromise();
    this.contacts = cts;
    console.log(this.contacts);
  }

  public setDate() {
    this.datePicker.show({
      date: new Date(),
      mode: "date",
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(function (date) {
      this.player.birthDay = moment(date);
      this.player.birthDayParsed = moment(this.player.birthDay).format("DD MMM YYYY");
    }.bind(this));
  }

  public success() {
    this.image = true;
  }

  public editContact(contact) {
    this.nameContact = contact.name;
    this.infoContact = contact.info;
    this.idContact = contact.id;
    this.typeContact = contact._type;

    this.save = false;
  }

  public async addContact() {
    if (this.nameContact == "" || this.infoContact == "" || this.typeContact == "") {
      let empty = await this.helper.getWords("EMPTYFIELDS"),
        required = await this.helper.getWords("REQUIRED");
      this.alertCtrl.create({
        title: required + "!",
        subTitle: empty,
        buttons: ["OK"]
      }).present();
      return;
    }

    var res = await this.http.post("/contacts", {
      name: this.nameContact,
      info: this.infoContact,
      _type: this.typeContact,
      user: this.player.user.id
    }).toPromise();

    this.contacts.push(res);

    this.cleanIputContact();
  }

  public async updateContact() {
    await this.http.put("/contacts/" + this.idContact, {
      name: this.nameContact,
      _type: this.typeContact,
      info: this.infoContact
    }).toPromise();

    let cts: any;
    cts = await this.http.get("/contacts/user/" + this.player.user.id).toPromise();
    this.contacts = cts;

    this.save = true;

    this.cleanIputContact();
  }

  public async removeContact(id: string) {
    await this.http.delete("/contacts/" + id).toPromise();

    let cts: any;
    cts = await this.http.get("/contacts/user/" + this.player.user.id).toPromise();
    this.contacts = cts;

  }

  private cleanIputContact() {
    this.nameContact = "";
    this.infoContact = "";
    this.typeContact = "";
    this.idContact = "";
  }

  public changePhoto() {
    let t = this;

    this.helper.Camera({ width: 170, height: 170, quality: 90 }, true).then((result) => {
      t.updatePhoto(result);
    })
      .catch((err) => {
        console.error(err);
      });

  }

  //la foto se actualiza en el momento de haber sido cambiada
  private async updatePhoto(base64Image) {

    this.imageSrc = "./assets/imgs/avatar.gif"

    let load = HelpersProvider.me.getLoadingStandar();

    try {
      await this.http.post("/userprofile/images", {
        id: this.player.user.id,
        image: base64Image,
        team: MyApp.User.team
      }).toPromise();
    } catch (e) {

      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title: "Error",
        message: "Fail to saved"
      }).present();

      return;
    }

    load.dismiss();

    this.imageSrc = base64Image;

    this.updateImageCallback(this.index, base64Image);

  }

  private async update() {
    //se copea el objeto de player sin referencia
    let player = JSON.parse(JSON.stringify(this.player));
    player.positions = player.positions.split(",");
    delete player.user;
    delete player.image;

    let user = this.player.user;
    let load = this.helper.getLoadingStandar();
    try {
      await this.http.put("/players/" + this.player.id, player).toPromise();
      await this.http.put("/user/" + this.player.user.id, user).toPromise();
    } catch (e) {

      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title: "Error",
        message: "Fail to saved"
      }).present();

      return;
    }

    load.dismiss();

    this.navCtrl.pop();
  }

  public goEditFamily() {
    this.navCtrl.push(EditFamilyPage, {
      player: this.player
    });
  }


  public async answerDelete() {
    let msgM = await HelpersProvider.me.getWords(["DELETE", "PLAYER"]);
    console.log(msgM);
    HelpersProvider.me.presentAlertStandar(this.deletePlayer.bind(this), function () {

    }, msgM["DELETE"] + " " + msgM["PLAYER"]);
  }

  public async deletePlayer() {
    let t = this, load = HelpersProvider.me.getLoadingStandar();
    try {

      await this.http.delete("/players/" + this.player.user.id + "/" + MyApp.User.team, { responseType: "text" }).toPromise();

      if (t.image === true) {
        await this.http.delete(`/userprofile/${this.player.user.id}/${MyApp.User.team}`, { responseType: "text" }).toPromise();
      }

    }
    catch (e) {
      console.error(e);
      await HelpersProvider.me.presentAlertErrorStandar()
    }

    load.dismiss();
    this.navCtrl.setRoot(RosterPage);
  }

}
