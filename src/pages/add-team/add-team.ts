import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { TeamsProfilePage } from '../teams-profile/teams-profile';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

@IonicPage()
@Component({
  selector: 'page-add-team',
  templateUrl: 'add-team.html',
})
export class AddTeamPage {

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

    if (this.name === "" || this.sport === "" || this.description === ""
      || this.city === "") {
      let requiredM = await this.helper.getWords("REQUIRED"),
        emptyFields = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: emptyFields })
        .present();
      return;
    }

    let savingM = await this.helper.getWords("SAVING"),
      undexM = await this.helper.getWords("ERORUNEXC");

    let load = this.loadingCtrl.create({ content: savingM });
    load.present({ disableApp: true });

    try {
      let newTeam: any = await this.http.post("/teams", {
        name: this.name, userID: MyApp.User.id,
        description: this.description, city: this.city, sport: this.sport, configuration: { valid: true }
      }).toPromise();

      let newRole:any = await this.http.post("/roles", {
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
      this.navCtrl.setRoot(TeamsProfilePage, { menu: true });
    }
    catch (e) {
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

  public async updateAction() {

    if (this.name === "" || this.sport === "" || this.description === ""
      || this.city === "") {
      let requiredM = await this.helper.getWords("REQUIRED"),
        emptyFields = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: emptyFields })
        .present();
      return;
    }

    let updatingM = await this.helper.getWords("UPDATING"),
      undexM = await this.helper.getWords("ERORUNEXC");

    let load = this.loadingCtrl.create({ content: updatingM });
    load.present({ disableApp: true });

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

      this.navCtrl.setRoot(TeamsProfilePage);
    }
    catch (e) {
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

}
