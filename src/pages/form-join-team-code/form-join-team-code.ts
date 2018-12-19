import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { AgentFreePage } from '../agent-free/agent-free';
import { MyApp } from '../../app/app.component';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { StatusBar } from '@ionic-native/status-bar';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { TabsPage } from '../tabs/tabs';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-form-join-team-code',
  templateUrl: 'form-join-team-code.html',
})
export class FormJoinTeamCodePage {

  public static __name = "FormJoinTeamCodePage"

  public username = "";
  public firstName = "";
  public lastName = "";
  public email = "";
  public role = "";
  public players: Array<any> = [];
  private team: any = {};
  private code = "";
  public playersSelects = [];
  public relationships: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, private http: HttpClient,
    public viewCtrl: ViewController, private auth: AuthServiceProvider,
    public statusBar: StatusBar, public ngZone: NgZone,
    public menuCtrl: MenuController, private storage: Storage
  ) {
    this.team = this.navParams.get("team");
    this.code = this.navParams.get("code");
  }

  async ionViewDidLoad() {
    try {
      let ps: Array<any> = await this.http.get("/players/team/" + this.team.id).toPromise() as any;
      this.players = ps.filter(function (it) { return it.hasOwnProperty("user") });
    }
    catch (e) {
      console.error(e);
    }
  }

  public getEmail(id): String {
    let player = this.players.find(function (it) { return it.id === id; })
    if (player === undefined) { return ""; }
    return player.user.email;
  }

  public async join() {

    let load = HelpersProvider.me.getLoadingStandar(false);
    try {
      if (this.username === "" || this.firstName == "" || this.lastName === "" || this.email == "" || this.role == "") {
        let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
          unex = await HelpersProvider.me.getWords("EMPTYFIELDS");
        this.alertCtrl.create({ title: requiredM, message: unex })
          .present();
        return;
      }

      let lengthR = 0;
      for (let n of Object.keys(this.relationships)) {
        if (this.relationships[n] !== "") {
          lengthR += 1;
        }
      }

      if (this.role === "Family" && (this.playersSelects.length === 0 ||
        this.playersSelects.length !== lengthR)
      ) {
        let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
          unex = await HelpersProvider.me.getWords("EMPTYFIELDS");
        this.alertCtrl.create({ title: requiredM, message: unex })
          .present();
        return;
      }

      let i = 0;
      let playersSelects = this.playersSelects.map(function (it) {
        let p = { id: it, relationship: this.relationships[i] };
        i += 1;
        return p;
      }.bind(this));


      let user: any;
      if (this.role === "Family") {
        user = {
          username: this.username, firstName: this.firstName, lastName: this.lastName,
          email: this.email, players: playersSelects, role: this.role
        };
      } else {
        user = { username: this.username, firstName: this.firstName, lastName: this.lastName, email: this.email, role: this.role };
      }

      let res = { user, code: this.code, team: this.team.id, info: HelpersProvider.me.getDeviceInfo() };
      load.present();

      let msg = await this.http.post("/team-add/code", res).toPromise() as { msg: boolean };
      if (msg.msg === true) {
        let call = async function (err, user) {

          if (user) {
            this.menuCtrl.swipeEnable(true);
            this.statusBar.overlaysWebView(false);
            this.statusBar.backgroundColorByHexString("#fe324d");
            if (MyApp.User.hasOwnProperty("team")) {
              this.storage.set('firstTime', true);
              this.storage.set('firstTimeRoster', true);
              // this.ngZone.run(() => this.navCtrl.setRoot(TabsPage));
              this.ngZone.run(() => this.navCtrl.setRoot(TabsPage));
            } else {
              this.ngZone.run(() => this.navCtrl.setRoot(AgentFreePage));
            }
          } else if (err) {

            let notConectionMSG = await this.helper.getWords("ERRORCONECTION");
            this.alertCtrl.create({
              title: "Error",
              message: notConectionMSG,
              buttons: ["Ok"]
            }).present();
          }

        }.bind(this);

        await this.auth.LoginWithUsername(user.username, call);

      } else {
        HelpersProvider.me.presentAlertErrorStandar();
      }
    }
    catch (e) {
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }
    finally {
      load.dismiss();
    }

  }

}
