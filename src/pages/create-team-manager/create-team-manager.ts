import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-create-team-manager',
  templateUrl: 'create-team-manager.html',
})
export class CreateTeamManagerPage {

  public team: any = {};

  //for user
  public newUser = true;
  // public username: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public password: string = "standard";
  public passwordCheck: string = "standard";
  public imageSrcUser = "";

  //Para cuando no es para un nuevo usuario
  public emailUser = "";

  //for team
  public name = "";
  public image = false;
  public imageSrcTeam = "";
  public sport = "";
  public description = "";
  public city = "";
  public updateImage = false;

  constructor(public viewCtrl: ViewController, public navCtrl: NavController,
    public navParams: NavParams, public helper: HelpersProvider,
    public alertCtrl: AlertController, public http: HttpClient,
    public loadingCtrl: LoadingController
  ) {
  }

  public changePhotoUser() {

    let t = this;

    this.helper.Camera({ width: 170, height: 170, quality: 90 }, true).then((result) => {
      t.imageSrcUser = result;
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public changePhoto() {

    this.helper.Camera({ width: 200, height: 200, quality: 75 }).then((result) => {
      if (result) {
        this.imageSrcTeam = result;
        this.updateImage = true;
      }
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public success() {
    this.updateImage = true;
  }

  public successImageUser() {
    this.image = false;
  }

  private async getUser() {
    if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.emailUser)
    ) {

      let emailERM = await HelpersProvider.me.getWords("EMAILINVALID");
      this.alertCtrl.create({
        title: "Error",
        message: emailERM,
        buttons: ["Ok"]
      }).present();
      return;
    }

    let load = HelpersProvider.me.getLoadingStandar();
    let enableEmail = await this.http.get(`/user/enable/${this.emailUser}`).toPromise() as any;
    if (enableEmail.valid === false) {
      let user = await this.http.get(`/user?where={"email":"${this.emailUser}"}`).toPromise() as any;
      if (user.length > 0) {
        user = user[0];
        await this.saveTeam(user, load);
      } else {
        load.dismiss();
        let USERNOTFOUND = await HelpersProvider.me.getWords("LEAGUE.ERROR.USERNOTFOUND");
        this.alertCtrl.create({
          title: "Error",
          message: USERNOTFOUND,
          buttons: ["Ok"]
        }).present();
      }
    } else {
      load.dismiss();
      let USERNOTFOUND = await HelpersProvider.me.getWords("LEAGUE.ERROR.USERNOTFOUND");
      this.alertCtrl.create({
        title: "Error",
        message: USERNOTFOUND,
        buttons: ["Ok"]
      }).present();
    }

  }

  private async saveUser() {

    if (
      this.firstName == '' ||
      this.lastName == '' ||
      this.email == '' ||
      this.password == '' ||
      this.passwordCheck == ''
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

    if (
      !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(this.email)
    ) {

      let emailERM = await HelpersProvider.me.getWords("EMAILINVALID");
      this.alertCtrl.create({
        title: "Error",
        message: emailERM,
        buttons: ["Ok"]
      }).present();
      return;
    }

    //Para validar los campos del equipo
    if (this.name === "" || this.sport === "" || this.city === "") {
      let requiredM = await this.helper.getWords("REQUIRED"),
        emptyFields = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: emptyFields })
        .present();
      return;
    }

    let user: any = {
      // username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      email: this.email
    };

    let load = HelpersProvider.me.getLoadingStandar();

    try {

      user = await this.http.post("/user", user).toPromise() as any;

      this.saveTeam(user, load);

    } catch (e) {

      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title: "Error",
        buttons: ["Ok"]
      }).present();
    }

  }

  private async saveTeam(user: any, load: Loading) {

    let undexM = await this.helper.getWords("ERORUNEXC");

    try {
      let newTeam: any = await this.http.post("/teams", {
        name: this.name, description: this.description, city: this.city, sport: this.sport, configuration: { valid: true }
      }).toPromise();

      let newRole: any = await this.http.post("/roles", {
        name: "Manager",
        user: user.id,
        team: newTeam.id
      }).toPromise();
      newRole.team = newTeam;

      //Para guardar la imagen del user para ese equipo
      if (this.imageSrcUser !== "") {
        await this.http.post("/userprofile/images", {
          id: user.id,
          image: this.imageSrcUser,
          team: newTeam.id
        }).toPromise();
      }

      if (this.imageSrcTeam !== "")
        await this.http.post("/images/teams", { id: newTeam.id, image: this.imageSrcTeam }).toPromise();

      load.dismiss();
      this.viewCtrl.dismiss(newTeam);
    }
    catch (e) {
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

  public async saveAction() {
    if (this.newUser == true) {
      await this.saveUser();
    } else {
      await this.getUser();
    }
  }

}
