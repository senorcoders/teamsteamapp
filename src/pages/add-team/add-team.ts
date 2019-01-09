import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ViewProfilePage } from '../view-profile/view-profile';

@IonicPage()
@Component({
  selector: 'page-add-team',
  templateUrl: 'add-team.html',
})
export class AddTeamPage {

  public static __name = "AddTeamPage"

  public name = "";
  public image = false;
  public imageSrc = "";
  public sport = "";
  public description = "";
  public city = "";

  //Para cuando se va actualizar un team
  public update = false;
  public team: any;
  public updateImage = false;

  public sports = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public loadingCtrl: LoadingController,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    public auth: AuthServiceProvider
  ) {

    let role = this.navParams.get("role");

    if (role !== undefined) {
      this.team = role.team;
      this.name = this.team.name;
      this.sport = this.team.sport;
      this.description = this.team.description;
      this.city = this.team.city;
      let ramdon = new Date().getTime();
      this.imageSrc = interceptor.transformUrl("/images/" + ramdon + "/teams/" + this.team.id);
      this.update = true;
    }

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

  public async success() {
    this.image = true;
  }

  public changePhoto() {

    this.helper.Camera({ width: 200, height: 200, quality: 75 }).then((result) => {
      if (result) {
        this.imageSrc = result;
        this.updateImage = true;
      }
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public async save() {

    let valid = this.helper.validadorFields(this, [
      { value: this.name, type: "text", nameMessage: "NAMEOFTEAM" },
      { value: this.city, type: "text", nameMessage: "CITY" },
      { value: this.sport, type: "text", nameMessage: "SPORT" },
    ]);
    if (valid.valid === false) {
      return;
    }

    let undexM = await this.helper.getWords("ERORUNEXC");

    let load = HelpersProvider.me.getLoadingStandar();

    try {
      let newTeam: any = await this.http.post("/teams", {
        name: this.name, description: this.description, city: this.city, sport: this.sport, configuration: { valid: true }
      }).toPromise();

      let newRole: any = await this.http.post("/roles", {
        name: "Manager",
        user: MyApp.User.id,
        team: newTeam.id
      }).toPromise();
      newRole.team = newTeam;

      if (this.imageSrc !== "")
        await this.http.post("/images/teams", { id: newTeam.id, image: this.imageSrc }).toPromise();

      MyApp.User.roles.push(newRole);
      await this.auth.updateUser(MyApp.User);

      console.log(newTeam);
      load.dismiss();
      this.navCtrl.setRoot(ViewProfilePage, { menu: true });
    }
    catch (e) {
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

  public async updateAction() {

    let valid = this.helper.validadorFields(this, [
      { value: this.name, type: "text", nameMessage: "NAMEOFTEAM" },
      { value: this.city, type: "text", nameMessage: "CITY" },
      { value: this.sport, type: "text", nameMessage: "SPORT" },
    ]);
    if (valid.valid === false) {
      return;
    }

    let undexM = await this.helper.getWords("ERORUNEXC");

    let load = HelpersProvider.me.getLoadingStandar();

    try {
      let newTeam: any = await this.http.put("/teams/" + this.team.id, {
        name: this.name, description: this.description,
        sport: this.sport, city: this.city
      }).toPromise();

      if (this.updateImage === true)
        await this.http.post("/images/teams", { id: newTeam.id, image: this.imageSrc }).toPromise();

      console.log(newTeam);
      load.dismiss();

      if (this.update === true) {
        this.navCtrl.pop();
        return;
      }

      this.navCtrl.setRoot(ViewProfilePage);
    }
    catch (e) {
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

}
