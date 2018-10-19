import { Component, ViewChild, NgZone } from '@angular/core';
import { ViewController, NavParams, Slides } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';


@Component({
  selector: 'slide-assistences-event',
  templateUrl: 'slide-assistences-event.html'
})
export class SlideAssistencesEventComponent {

  public static __name = "SlideAssistencesEventComponent"

  @ViewChild('slides') slides: Slides;
  public players: Array<any> = [];
  public assistences: Array<any> = [];
  public event: any = {};
  public search = "";
  public now = new Date();
  public enableAll = false;

  constructor(
    public viewCtrl: ViewController, public navParams: NavParams,
    public http: HttpClient, public alertCtrl: AlertController,
    public zone: NgZone
  ) {

    this.event = this.navParams.get("event");
    this.players = this.navParams.get("players");
    this.assistences = this.navParams.get("assistences");
    console.log(this.event);

  }

  public render(){
    return `hola que tal`;
  }

  // async ngAfterViewInit() {
  //   try {
  //     this.players = await this.http.get('/players?where={"team":"' + MyApp.User.team + '"}').toPromise() as any;
  //     this.players = this.players.filter(function (it) {
  //       return it.hasOwnProperty("user") && Object.prototype.toString.call(it.user) === '[object Object]';
  //     });

  //     await this.checkRepeatsEventsGETAttendence();

  //   }
  //   catch (e) {
  //     console.error(e);
  //   }
  // }

  // public async checkRepeatsEventsGETAttendence() {
  //   try {
  //     //Para los eventos que no se repiten
  //     if (this.event.repeats === false) {

  //       let assistence: any;
  //       let isDespues = moment().isAfter(moment(this.event.dateTime, "MM/DD/YYYY hh:mm a"));
  //       if (isDespues === true) {
  //         assistence = await this.http.get("/assistenceevents?where={'event':'" + this.event.id + "'}").toPromise() as any;

  //         if (assistence.length === 0) {
  //           assistence = {
  //             dateTime: moment().toISOString(),
  //             event: this.event.id,
  //             players: this.players.map(function (it) { return { id: it.id, status: "", late: false } })
  //           };
  //           assistence = await this.http.post("/assistenceevents", assistence).toPromise() as any;
  //           this.assistences.push(assistence);
  //         } else {
  //           this.assistences = this.assistences.concat(assistence);
  //           this.assistences = this.assistences.concat(assistence);
  //         }

  //       } else {

  //       }

  //     }

  //     // this.slides.freeMode = true;
  //     // this.slides.update();
  //     console.log("Cargado data");
  //   }
  //   catch (e) {
  //     console.error(e);
  //   }
  // }

  ionViewDidLoad(){
    console.log(this.assistences);
    this.slides.freeMode = true;
    this.slides.update();
    console.log(this.slides, this);
  }

  // private factorize() {
  //   this.players = this.players.map(function (it) {

  //     if (this.assistence.hasOwnProperty("id")) {
  //       let assistence = this.assistence.players.find(function (id) { return id.id === it.id; });
  //       if (assistence !== undefined) {
  //         it.status = assistence.status;
  //         it.late = assistence.late;
  //       }
  //     } else {
  //       it.status = "";
  //       it.late = false;
  //     }

  //     return it;
  //   }.bind(this));
  // }

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

  public async enableAssitence(assistence): Promise<boolean> {
    let valid = true;
    if (this.enableAll === false) valid = false;

    if (valid === false) {
      let msg = await HelpersProvider.me.getWords("ASSISTENCEEVENT.NOTSTARTED");
      let title = await HelpersProvider.me.getWords("ASSISTENCEEVENT.NOTREADY");
      this.alertCtrl.create({ title, message: msg, buttons: ["Ok"] })
        .present();
    }

    return valid;
  }

  public async asingStatus(assistence, player, status) {
    try {

      if (await this.enableAssitence(assistence) === false) return;

    }
    catch (e) {
      console.error(e);
    }
  }

  // public async asingStatus(player, status) {
  //   try {

  //     if (player.status === status)
  //       player.status = "";
  //     else
  //       player.status = status;

  //     if (this.assistence.players.length === 0) {
  //       this.assistence.players.push({
  //         id: player.id,
  //         status: player.status,
  //         late: player.late
  //       });
  //     } else {
  //       let index = this.assistence.players.findIndex(function (it) { return it.id === player.id; });
  //       if (index === -1) {
  //         this.assistence.players.push({
  //           id: player.id,
  //           status: player.status,
  //           late: player.late
  //         });
  //       } else {
  //         this.assistence.players[index].status = player.status;
  //         this.assistence.players[index].late = player.late;
  //       }

  //     }

  //     if (!this.assistence.hasOwnProperty("id")) {
  //       this.assistence.dateTime = new Date().toISOString();
  //       this.assistence.event = this.event.id
  //       this.assistence = await this.http.post("/assistenceevents", this.assistence).toPromise();
  //     } else {
  //       await this.http.put("/assistenceevents/" + this.assistence.id, this.assistence).toPromise();
  //     }

  //   }
  //   catch (e) {
  //     console.error(e);
  //   }

  // }

  // public async asingLate(player) {
  //   try {

  //     player.late = !player.late;

  //     if (this.assistence.players.length === 0) {
  //       this.assistence.players.push({
  //         id: player.id,
  //         status: player.status,
  //         late: player.late
  //       });
  //     } else {
  //       let index = this.assistence.players.findIndex(function (it) { return it.id === player.id; });
  //       if (index === -1) {
  //         this.assistence.players.push({
  //           id: player.id,
  //           status: player.status,
  //           late: player.late
  //         });
  //       } else {
  //         this.assistence.players[index].late = player.late;
  //       }

  //     }

  //     if (!this.assistence.hasOwnProperty("id")) {
  //       this.assistence.dateTime = new Date().toISOString();
  //       this.assistence.event = this.event.id
  //       this.assistence = await this.http.post("/assistenceevents", this.assistence).toPromise();
  //     } else {
  //       await this.http.put("/assistenceevents/" + this.assistence.id, this.assistence).toPromise();
  //     }

  //   }
  //   catch (e) {
  //     console.error(e);
  //   }

  // }

}
