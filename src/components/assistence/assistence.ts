import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';


@Component({
  selector: 'assistence',
  templateUrl: 'assistence.html'
})
export class AssistenceComponent {

  public players: Array<any> = [];
  public assistence: any = {};
  public event: any = {};
  public search = "";
  public now = new Date();

  constructor(public viewCtrl: ViewController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.event = this.navParams.get("event");
    if (this.navParams.get("assistence") !== undefined) {
      this.assistence = this.navParams.get("assistence");
    }

  }

  async ionViewDidLoad() {
    try {
      this.players = await this.http.get('/players?where={"team":"' + MyApp.User.team + '"}').toPromise() as any;

      this.players = this.players.map(function (it) {

        if (this.assistence.hasOwnProperty("id")) {
          let assistence = this.assistence.players.find(function (id) { return id.id === it.id; });
          if (assistence !== undefined) {
            it.status = assistence.status;
            it.late = assistence.late;
          }
        }else{
          it.status = "";
          it.late = "";
        }

        return it;
      }.bind(this));

    }
    catch (e) {
      console.error(e);
    }
  }

  public async byPass() { }

  public isHidden(player) {

    if (this.search === "")
      return false;

    let hidden = true;
    if (player.user.username.toLowerCase().includes(this.search.toLowerCase())) {
      hidden = false;
    }

    return hidden;

  }

  public async asingStatus(status) {
    try {

      if (!this.assistence.hasOwnProperty("id")) {
        this.assistence = await this.http.post("/assistenceevents", {
          dateTime: new Date().toISOString(),
          players: [],
          event: this.event.id
        });
      }
    }
    catch (e) {
      console.error(e);
    }

  }

}
