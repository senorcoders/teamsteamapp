import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController, ActionSheetController } from 'ionic-angular';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { FormJoinTeamPage } from '../form-join-team/form-join-team';
import { LoginPage } from '../login/login';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { FormJoinTeamCodePage } from '../form-join-team-code/form-join-team-code';


@IonicPage()
@Component({
  selector: 'page-view-team',
  templateUrl: 'view-team.html',
})
export class ViewTeamPage {

  public static __name = "ViewTeamPage"


  public team: any = {};
  public image = false;
  public request: any = { acept: false, idUser: "" };
  public requestReady = false;
  public players: Array<any> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private modalCtrl: ModalController,
    public alertCtrl: AlertController, public actionSheet: ActionSheetController
  ) {

    this.team = this.navParams.get("team");
    let ramdon = new Date().getTime();
    this.team.imageSrc = interceptor.transformUrl("/images/" + ramdon + "/teams/" + this.team.id);
    console.log(this.team);

    if (MyApp.hasOwnProperty("User") && MyApp.User.hasOwnProperty("id")) {

      if (this.team.hasOwnProperty("request")) {
        for (let r of this.team.request) {
          if (r.idUser === MyApp.User.id) {
            this.request = r;
            this.requestReady = true;
            break;
          }
        }
      }

    }

  }

  async ngOnInit() {
    try {
      let ps: any = await this.http.get("/players/team/" + this.team.id).toPromise();
      this.players = ps;
    }
    catch (e) {
      console.error(e);
    }
  }

  public enableRequest() {
    if (this.team.hasOwnProperty("ready") || this.requestReady === true)
      return true;
  }


  public success() {
    this.image = true;
  }

  public async questionUse() {
    this.actionSheet.create({
      title: await HelpersProvider.me.getWords("METHODJOIN"),
      buttons: [
        {
          text: await HelpersProvider.me.getWords("USECODETEAM"),
          handler: this.joinTeamCodeVeriy.bind(this),
        },
        {
          text: await HelpersProvider.me.getWords("USEREQUEST"),
          handler: this.sendRequest.bind(this)
        }
      ]
    })
      .present();
  }

  private async joinTeamCodeVeriy() {
    this.alertCtrl.create({
      message: await HelpersProvider.me.getWords("ENTERCODE"),
      inputs: [
        { name: "code", placeholder: await HelpersProvider.me.getWords("CODE") }
      ],
      buttons: [
        { text: await HelpersProvider.me.getWords("CANCEL") },
        {
          text: await HelpersProvider.me.getWords("ENTER"),
          handler: this.validCode.bind(this)
        }
      ]
    })
    .present();
  }

  private async validCode(data){
    try{
      let code  = await HelpersProvider.me.http.get(`/team-code/${data.code}/${this.team.id}`).toPromise() as any[];
      if(code.length===1){
        this.joinTeamCode(data.code, code[0]);
      }else{
        let eqiv = this.alertCtrl.create({
          message: await HelpersProvider.me.getWords("CODEINCORRECT"),
          buttons: ["Ok"]
        });
        eqiv.present();
        eqiv.onDidDismiss(this.joinTeamCodeVeriy.bind(this))
      }
    }
    catch(e){
      console.error(e);
    }
  }

  private joinTeamCode(code, team){
    this.navCtrl.push(FormJoinTeamCodePage, {code, team});
  }

  public async sendRequest() {

    if (MyApp.hasOwnProperty("User") && MyApp.User.hasOwnProperty("id")) {

      let requests = [];
      if (this.team.hasOwnProperty("request")) {
        for (let r of this.team.request) {
          requests.push(r);
        }
      }

      requests.push({ acept: false, idUser: MyApp.User.id, role: MyApp.User.role.name });

      let request: any = await this.http.put("/teams/" + this.team.id, { request: requests }).toPromise();

      console.log(request);
      this.request = { acept: false, idUser: MyApp.User.id };
      this.requestReady = true;

    } else {

      let m = this.modalCtrl.create(FormJoinTeamPage, { team: this.team });
      m.present();
      m.onDidDismiss(async function (user) {

        if (user === undefined || user === null)
          return;

        let requests = [];
        if (this.team.hasOwnProperty("request")) {
          for (let r of this.team.request) {
            requests.push(r);
          }
        }

        let role = user.role;
        delete user.role;

        requests.push({ acept: false, idUser: "", user: user, role });

        let request: any = await this.http.post("/team/request", { id: this.team.id, request: requests, email: user.email, fullName: user.firstName + " " + user.lastName }).toPromise();
        if (request === "user found") {
          let msg = await HelpersProvider.me.getWords("TEAMREADY");
          this.alertCtrl.create({
            message: msg
          })
            .present();
        }
        console.log(request);
        this.request = { acept: false, idUser: "", user: user };
        this.requestReady = true;

        setTimeout(function () { this.navCtrl.setRoot(LoginPage); }.bind(this), 700);

      }.bind(this));

    }

  }


}
