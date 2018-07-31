import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-event-team-join',
  templateUrl: 'event-team-join.html',
})
export class EventTeamJoinPage {

  public event: any;
  public team: any;
  public loadImage = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public alertCtrl: AlertController
  ) {
    let e = this.navParams.get("event");
    this.event = e.event;
    this.team = e.event.team;
    let size = HelpersProvider.me.getSizeImage().text;
    let ramdon = new Date().getTime();
    this.event.imgSrc = interceptor.transformUrl('/images/' + ramdon + '/events/' + this.event.id + size);
  }

  ionViewDidLoad() {

  }

  public loadImageSuccess() {
    this.loadImage = false;
  }

  public async joinTeam() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let user = { firstName: MyApp.User.firstName, lastName: MyApp.User.lastName, email: MyApp.User.email };
      let request: any = { acept: false, idUser: "", user: user, role: "Player", freeAgent: true };
      let team: any = await this.http.get("/teams/" + this.team.id).toPromise();
      if (!team.hasOwnProperty("request")) {
        team.request = [];
      }
      team.request.push(request);
      let requests = team.request;

      request = await this.http.post("/team/request", { id: this.team.id, request: requests, email: user.email, fullName: user.firstName + " " + user.lastName }).toPromise();
      if (request === "user found") {
        let msg = await HelpersProvider.me.getWords("TEAMREADY");
        this.alertCtrl.create({
          message: msg
        })
          .present();
      }

      console.log(request);
    }
    catch (e) {
      console.error(e);
    }
    load.dismissAll();
  }

}
