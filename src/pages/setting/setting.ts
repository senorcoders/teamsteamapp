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

  public user: {
    language: string,
    notifications: {
      events: boolean,
      chats: boolean,
      tasks: boolean
    }
  }

  constructor() {
    this.team = {
      chatEachPlayer: true
    };
    this.user = {
      language: "en", notifications: {
        events: true,
        chats: true,
        tasks: true
      }
    }
  }

}

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  public setting = new Setting();
  public userRole = "";
  public version = "0.0.9"
  public user = JSON.parse(JSON.stringify(MyApp.User));

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private storage: Storage, private auth: AuthServiceProvider
  ) {

    if (MyApp.User.role !== null && MyApp.User.role !== undefined)
      this.userRole = MyApp.User.role.name;
    else
      this.userRole = "None";
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

      //Cargamos las opciones del usuario
      let user = await this.http.get("/user/" + MyApp.User.id).toPromise() as any;
      user.options = user.options || {};
      this.setting.user = this.loadPropertys(user.options, this.setting.user);
      this.setting.user.language = MyApp.User.options.language;
      console.log(this.setting);
    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  private loadPropertys(object: any, objectOf: any) {
    for (let name of Object.keys(objectOf)) {
      if (Object.prototype.toString.call(objectOf[name]) === "[object Object]") {
        object[name] = object[name] || {};
        objectOf[name] = this.loadPropertys(object[name], objectOf[name]);
      } else {
        if (object[name] !== undefined && object[name] !== null)
          objectOf[name] = object[name];
      }
    }

    return objectOf;
  }

  public async stateChange(part: string) {
    try {
      if (part === "team") {
        let confi = this.setting.team;
        await this.http.put("/teams/" + MyApp.User.team, { configuration: confi }).toPromise() as any;
      } else if (part === "user") {
        await this.http.put("/user/" + MyApp.User.id, { options: this.setting.user }).toPromise() as any;
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

  public async toogleSubscribeTopicPush() {
    try {
      if (HelpersProvider.me.platform.is("cordova")) {
        if (MyApp.User.team !== undefined && MyApp.User.team !== null) {
          if (this.setting.user.notifications.events === false) {
            await MyApp.me.pushObject.unsubscribe(MyApp.User.team);
          } else {
            await MyApp.me.pushObject.subscribe(MyApp.User.team);
          }
        }
      }
      await this.stateChange("user");
    }
    catch (e) {
      console.error(e);
      this.setting.user.notifications.events = !this.setting.user.notifications.events;
      HelpersProvider.me.presentAlertErrorStandar();
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

      this.userRole = MyApp.User.role.name;
      this.user = JSON.parse(JSON.stringify(MyApp.User));

      this.navCtrl.pop();
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
    MyApp.User.role = role;

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
