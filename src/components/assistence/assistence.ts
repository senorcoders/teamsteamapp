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
  public assistence: any = { players: [] };
  public event: any = {};
  public search = "";
  public now = new Date();
  public repeats = true;

  constructor(public viewCtrl: ViewController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.event = this.navParams.get("event");
    this.repeats = this.navParams.get("repeats");
    if (this.repeats === true) {
      if (this.navParams.get("assistence") !== undefined)
        this.assistence = this.navParams.get("assistence")
    }

  }

  async ionViewDidLoad() {
    try {
      if (this.repeats === false) {
        let assistence: any = await this.http.get("/assistence/" + this.event.id).toPromise()
        if (assistence.length !== 0) {
          this.assistence = assistence[0];
        }
      }

      this.players = await this.http.get('/players?where={"team":"' + MyApp.User.team + '"}').toPromise() as any;
      this.factorize();
    }
    catch (e) {
      console.error(e);
    }
  }

  private factorize() {
    this.players = this.players.map(function (it) {

      let assistence = this.assistence.players.find(function (id) { return id.id === it.id; });
      if (assistence !== undefined) {
        it.status = assistence.status;
        it.late = assistence.late;
      } else {
        it.status = "";
        it.late = false;
      }

      return it;
    }.bind(this));
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

  public async asingStatus(player, status) {
    try {

      if (player.status === status)
        player.status = "";
      else
        player.status = status;

      if (player.status === "not")
        player.late = false;

      if (player.status === "") {
        if (player.late === true)
          player.late = false;
      }

      if (this.assistence.players.length === 0) {
        this.assistence.players.push({
          id: player.id,
          status: player.status,
          late: player.late
        });
      } else {
        let index = this.assistence.players.findIndex(function (it) { return it.id === player.id; });
        if (index === -1) {
          this.assistence.players.push({
            id: player.id,
            status: player.status,
            late: player.late
          });
        } else {
          this.assistence.players[index].status = player.status;
          this.assistence.players[index].late = player.late;
        }

      }

      if (!this.assistence.hasOwnProperty("id")) {
        this.assistence.dateTime = new Date().toISOString();
        this.assistence.event = this.event.id
        this.assistence = await this.http.post("/assistenceevents", this.assistence).toPromise();
      } else {
        await this.http.put("/assistenceevents/" + this.assistence.id, this.assistence).toPromise();
      }

    }
    catch (e) {
      console.error(e);
    }

  }

  public async asingLate(player) {
    try {

      player.late = !player.late;
      if (player.late === true) {
        player.status = "yes";
      }

      if (this.assistence.players.length === 0) {
        this.assistence.players.push({
          id: player.id,
          status: player.status,
          late: player.late
        });
      } else {
        let index = this.assistence.players.findIndex(function (it) { return it.id === player.id; });
        if (index === -1) {
          this.assistence.players.push({
            id: player.id,
            status: player.status,
            late: player.late
          });
        } else {
          this.assistence.players[index].status = player.status;
          this.assistence.players[index].late = player.late;
        }

      }

      if (!this.assistence.hasOwnProperty("id")) {
        this.assistence.dateTime = new Date().toISOString();
        this.assistence.event = this.event.id
        this.assistence = await this.http.post("/assistenceevents", this.assistence).toPromise();
      } else {
        await this.http.put("/assistenceevents/" + this.assistence.id, this.assistence).toPromise();
      }

    }
    catch (e) {
      console.error(e);
    }

  }

}
