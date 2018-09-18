import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { Storage } from '@ionic/storage';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


class Setting {

  public team: {
    chatEachPlayer: boolean
  };

  constructor() {
    this.team = {
      chatEachPlayer: true
    };
  }

}

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  public setting: Setting;
  public userRole = "";
  public version = "0.0.8"

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private storage: Storage, private auth: AuthServiceProvider
  ) {
    this.setting = new Setting();
    this.userRole = MyApp.User.role.name;
  }

  async ionViewDidLoad() {

    let load = HelpersProvider.me.getLoadingStandar();

    try {

      //Para cuando el usuario es manager
      if (this.userRole === "Manager") {
        let team = await this.http.get("/teams/" + MyApp.User.team).toPromise() as any;
        if (team.configuration !== undefined) {
          let confi = team.configuration;
          if (confi.hasOwnProperty("chatEachPlayer") === true)
            this.setting.team.chatEachPlayer = confi.chatEachPlayer;
        }
      }

    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  public async stateChange(e, part: string, id: string) {
    try {
      if (part === "team") {
        let confi = this.setting.team;
        await this.http.put("/teams/" + MyApp.User.team, { configuration: confi }).toPromise() as any;
      }
    }
    catch (e) {
      console.error(e);
      // if(Object.prototype.toString.call(this.setting.team[id])==="[object Boolean]"){
      //   this.setting.team[id] = !this.setting.team[id];
      // } 
      await HelpersProvider.me.presentAlertErrorStandar();
    }
  }

  public async removeAccount() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      if (MyApp.User.role.name === "Manager") {

        await this.http.delete("/roles/" + MyApp.User.role.id).toPromise();
      } else if (MyApp.User.role.name === "Player") {

        let player: any[];
        if (Object.prototype.toString.call(MyApp.User.role.team) === "[object String]") {
          player = await this.http.get(`/players?where={"user":"${MyApp.User.id}","team":"${MyApp.User.role.team}"}`).toPromise() as any[];
        } else {
          player = await this.http.get(`/players?where={"user":"${MyApp.User.id}","team":"${MyApp.User.role.team.id}"}`).toPromise() as any[];
        }
        if (player.length === 1) {
          await this.http.delete("/roles/" + MyApp.User.role.id).toPromise();
          await this.http.delete("/players/" + player[0].id).toPromise();
        }

      } else if (MyApp.User.role.name === "Family") {

        let familys: any[];
        if (Object.prototype.toString.call(MyApp.User.role.team) === "[object String]") {
          familys = await this.http.get(`/family?where={"user":"${MyApp.User.id}","team":"${MyApp.User.role.team}"}`).toPromise() as any[];
        } else {
          familys = await this.http.get(`/family?where={"user":"${MyApp.User.id}","team":"${MyApp.User.role.team.id}"}`).toPromise() as any[];
        }
        for (let family of familys) {
          await this.http.delete("/family/" + family.id).toPromise();
        }
        await this.http.delete("/roles/" + MyApp.User.role.id).toPromise();
      }

      //Actualizar el user en la base de datos local
      let index = MyApp.User.roles.findIndex(it => {
        return it.id === MyApp.User.role.id;
      });
      if (index !== -1) {
        if (MyApp.User.roles.length === 1) {
          MyApp.User.roles = [];
        } else {
          MyApp.User.roles.splice(index, 1);
        }
        await this.storage.set("user", MyApp.User);
      }

      //Delete role en la base de datos local
      delete MyApp.User.role;
      await this.storage.remove("role");

      await this.changeRol();
    }
    catch (e) {
      console.error(e);
      await HelpersProvider.me.presentAlertErrorStandar();
    }

    load.dismiss();
  }

  private async changeRol() {
    let role: any;
    if (MyApp.User.roles.length === 0) return;

    role = MyApp.User.roles[0];

    if (role.name !== "FreeAgent" && role.name !== "OwnerLeague") {
      try {
        await this.auth.setTimeZoneTeam();
        await HelpersProvider.me.setGeofences(200);
      }
      catch (e) {
        console.error(e);
      }
    } else {

      try {
        await HelpersProvider.me.stopGeofences();
      }
      catch (e) {
        console.error(e);
      }
    }

    await this.auth.updateRole(role);
  }
}
