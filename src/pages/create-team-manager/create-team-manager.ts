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

  public static __name = "CreateTeamManagerPage"

  public team: any = {};

  //for user
  public newUser = true;
  // public username: string = "";
  public username: string = "";
  public firstName: string = "";
  public lastName: string = "";
  public email: string = "";
  public password: string = "standard";
  public passwordCheck: string = "standard";
  public imageSrcUser = "";

  //Para cuando no es para un nuevo usuario
  public username_ = "";

  //for team
  public name = "";
  public image = false;
  public imageSrcTeam = "";
  public sport = "";
  public description = "";
  public city = "";
  public updateImage = false;

  public sports = [];

  constructor(public viewCtrl: ViewController, public navCtrl: NavController,
    public navParams: NavParams, public helper: HelpersProvider,
    public alertCtrl: AlertController, public http: HttpClient,
    public loadingCtrl: LoadingController
  ) {
  }

  async ionViewDidLoad() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      this.sports = await this.http.get("/sports").toPromise() as any[];
    }
    catch (e) {
      console.error(e);
    }
    load.dismiss();
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
    let valid = this.helper.validadorFields(this, [
      { value: this.username_, type: "text", nameMessage: "Username" }
    ]);
    if (valid.valid === false) {
      return;
    }

    let load = HelpersProvider.me.getLoadingStandar();
    let user = await this.http.get(`/user?where={"username":"${this.username_}"}`).toPromise() as any;
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

  }

  private async saveUser() {

    let valid = this.helper.validadorFields(this, [
      { value: this.username, type: "text", nameMessage: "Username" },
      { value: this.firstName, type: "text", nameMessage: "FIRSTNAME" },
      { value: this.lastName, type: "text", nameMessage: "LASTNAME" },
      { value: this.email, type: "email", nameMessage: "Email" },
      { value: this.name, type: "text", nameMessage: "NAMEOFTEAM" },
      { value: this.city, type: "text", nameMessage: "CITY" },
      { value: this.sport, type: "text", nameMessage: "SPORT" },
    ]);
    if (valid.valid === false) {
      return;
    }

    let user: any = {
      username: this.username,
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
