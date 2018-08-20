import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';


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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
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

}
