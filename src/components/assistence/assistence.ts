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

  constructor(public viewCtrl: ViewController, public navParams: NavParams,
    public http: HttpClient
  ) {
    this.event = this.navParams.get("event");
    
    if (this.navParams.get("assistence") !== undefined) {
      this.assistence = this.navParams.get("assistence");
      console.log(this.assistence);
    }

  }

  async ionViewDidLoad() {
    try {
      if (!this.assistence.hasOwnProperty("id")) {
        this.players = await this.http.get('/players?where={"team":"' + MyApp.User.team + '"}').toPromise() as any;
        this.factorize();
      }else{
        this.players = this.assistence.players;
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  private factorize() {
    this.players = this.players.map(function (it) {

      if (this.assistence.hasOwnProperty("id")) {
        let assistence = this.assistence.players.find(function (id) { return id.id === it.id; });
        if (assistence !== undefined) {
          it.status = assistence.status;
          it.late = assistence.late;
        }
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
      }else{
        await this.http.put("/assistenceevents/"+ this.assistence.id, this.assistence).toPromise();
      }
      
    }
    catch (e) {
      console.error(e);
    }

  }

  public async asingLate(player) {
    try {

      player.late = !player.late;

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
          this.assistence.players[index].late = player.late;
        }

      }

      if (!this.assistence.hasOwnProperty("id")) {
        this.assistence.dateTime = new Date().toISOString();
        this.assistence.event = this.event.id
        this.assistence = await this.http.post("/assistenceevents", this.assistence).toPromise();
      }else{
        await this.http.put("/assistenceevents/"+ this.assistence.id, this.assistence).toPromise();
      }
      
    }
    catch (e) {
      console.error(e);
    }

  }

}
