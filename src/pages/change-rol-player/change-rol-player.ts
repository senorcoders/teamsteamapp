import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { RosterPage } from '../roster/roster';


@IonicPage()
@Component({
  selector: 'page-change-rol-player',
  templateUrl: 'change-rol-player.html',
})
export class ChangeRolPlayerPage {

  public rol = "Manager";
  public player: any = {};
  public players = [];
  public familyEmail = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.player = this.navParams.get("player");
  }

  async ionViewDidLoad() {
    let players = await HelpersProvider.me.http.get(`/roles?where={"team":"${MyApp.User.team}","name":"Player"}`).toPromise() as any[];
    this.players = players.filter(function (item) {
      return item.user !== undefined;
    }).filter(function (play) {
      return this.player.user.id !== play.user.id;
    }.bind(this))
  }

  public async changeRol() {

    let load = HelpersProvider.me.getLoadingStandar();
    try {

      //Primero obtenemos el rol
      let roles = await HelpersProvider.me.http.get(`/roles?where={"user":"${this.player.user.id}","team":"${MyApp.User.team}","name":"Player"}`).toPromise() as any[];
      if (roles.length === 1) {
        let role = roles[0];
        if (this.rol === "Manager") {
          await HelpersProvider.me.http.put(`/roles/${role.id}`, { name: "Manager" }).toPromise();
        } else if (this.rol === "Family") {

          if (this.familyEmail.length === 0) {
            load.dismiss();
            return HelpersProvider.me.alertCtrl.create({
              message: await HelpersProvider.me.getWords("CHANGEROL.SELECTFAMILY"),
              buttons: ["Ok"]
            }).present();
          }

          await HelpersProvider.me.http.put(`/roles/${role.id}`, { name: "Family" }).toPromise();
          for (let fam of this.familyEmail) {
            let family = {
              user: this.player.user.id,
              child: fam,
              private: true,
              receiveEmail: true,
              team: MyApp.User.team
            };

            await HelpersProvider.me.http.post("/family", family).toPromise();
          }
        }

        let players = await HelpersProvider.me.http.get(`/players?where={"user":"${this.player.user.id}","team":"${MyApp.User.team}"}`).toPromise() as any[];
        for (let play of players) {
          await HelpersProvider.me.http.delete("/players/" + play.id).toPromise();
        }
        load.dismiss();
        this.navCtrl.setRoot(RosterPage);
      } else
        throw new Error("not found Rol");

    }
    catch (e) {
      load.dismiss();
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }
  }

}
