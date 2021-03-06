import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { HelpersProvider } from '../../providers/helpers/helpers';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-player-close-event',
  templateUrl: 'player-close-event.html',
})
export class PlayerCloseEventPage {

  public static __name = "PlayerCloseEventPage"


  triggerPLayer: any;
  players: Array<any> = [];
  event: any = { name: "" };
  roles = [];
  role: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public socket: WebSocketsProvider,
    public alertCtrl: AlertController
  ) {
    this.triggerPLayer = this.navParams.get("player");
  }

  async ionViewDidLoad() {

    let load = HelpersProvider.me.getLoadingStandar();
    this.event = await this.http.get("/event/" + this.navParams.get("eventID")).toPromise() as any;
    let events = await this.parserEvents([this.event]);
    this.event = events[0];
    //let date = moment(this.event.parsedDateTime[0] + this.event.parsedDateTime[1] + this.event.Time, "MMMMDDhh:mm a")

    //Para obtener la location del evento
    if (this.event.location.hasOwnProperty("lat") && this.event.location.hasOwnProperty("lng")) {
      this.event.origin = { lat: this.event.location.lat, lng: this.event.location.lng };
    } else {
      this.event.origin = await new Promise(function (resolve, reject) {
        let geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: this.event.location.address }, function (res, status) {

          if (res.length === 0) return reject("not found geoconde search");

          res = res[0];
          if (res.geometry) {
            let lat = res.geometry.location.lat();
            let lng = res.geometry.location.lng();
            resolve({ lat, lng });
          }

        }.bind(this));
      }.bind(this));
    }

    //Para buscar el team actual
    this.roles = MyApp.User.roles;
    this.roles = this.roles.filter(it => { return it.team !== undefined; });
    this.role = this.roles.find(it => {
      return it.team.id === MyApp.User.team;
    })

    //si se encontro el rol y el evento
    //Tiene habilitado buscar player
    if (this.role !== undefined && this.event.hasOwnProperty("searchPlayer") &&
      this.event.searchPlayer === true
    ) {
      this.players = await this.http.get(`/playerclose/${this.role.team.id}/${this.role.team.sport}/${this.event.searchPlayers}/${this.event.origin.lat}/${this.event.origin.lng}/20`).toPromise() as any;
      if (this.triggerPLayer !== undefined) {
        let index = this.players.findIndex(it => it.user.id === this.triggerPLayer.user.id);
        if (index === -1) this.players.push(this.triggerPLayer);
      }
      console.log(this.players);
    }

    this.socket.subscribeWithPush("player-near." + this.event.id, function (player) {
      let index = this.players.findIndex(it => it.user.id === player.user.id);
      if (index === -1) this.players.push(this.triggerPLayer);
      console.log(this.players);
    }.bind(this));

    load.dismissAll();
  }

  ionViewWillUnload() {
    this.socket.unsubscribeWithPush("eventStatus");
  }

  private async parserEvents(events) {

    let th = this;
    ////console.log(size);
    try {

      //preformarting for events
      events = await Promise.all(events.map(async function (it, index) {

        //Para saber si el evento es semanal
        it.weeks = it.repeats === true && it.repeatsDaily === false;

        if (it.weeks === true) {
          let day = th.getDayCercano(it.repeatsDays);
          it.parsedDateTime = [day.format("MMMM"), day.format("DD")];
          ////console.log(it.name, it.parsedDateTime);
        } else {
          let day = moment(it.dateTime);
          it.parsedDateTime = [day.format("MMMM"), day.format("DD")];
        }

        //if (it.repeatsDaily === true) {
        it.Time = moment(it.dateTime).format("hh:mm a");
        //}

        it.dateTime = moment(it.dateTime).format("MM/DD/YYYY hh:mm a");

        return it;
      }));

      //for sort events
      events = events.sort(function (a, b) {
        if (a.repeatsDaily == true) {
          return -1;

        } else if (b.repeatsDaily == true) {
          return 1;

        }

        //obtenemos la fecha de los eventos
        let a1, b1;
        if (a.repeats === true) {
          a1 = th.getDayCercano(a.repeatsDays)
        } else {
          a1 = moment(a.dateTime, "MM/DD/YYYY hh:mm");
        }

        if (b.repeats === true) {
          b1 = th.getDayCercano(b.repeatsDays)
        } else {
          b1 = moment(b.dateTime, "MM/DD/YYYY hh:mm")
        }
        //console.log(a1.format("DD/MM/YYYY"), b1.format("DD/MM/YYYY"));
        if (a1.isBefore(b1)) {            // a comes first
          return -1
        } else if (a1.isAfter(b1)) {     // b comes first
          return 1
        } else {                // equal, so order is irrelevant
          return 0            // note: sort is not necessarily stable in JS
        }

      });

    }
    catch (e) {
      console.error(e);
    }

    return events;

  }

  //Para cuando los eventos son por semana
  //pueden haber varios dias en la semana que el evento ocurre
  //hay que buscar el evento mas cercano al fecha actual
  private getDayCercano(days: any): any {

    let daysNumber = {
      "m": 1,
      "tu": 2,
      "w": 3,
      "th": 4,
      "f": 5,
      "sa": 6,
      "su": 7
    };
    ////console.log(days);
    let daysMoment = [];
    let Days = Object.prototype.toString.call(days) === '[object String]' ? days.split(',') : days;


    for (let day of Days) {
      let newmoment = moment();
      newmoment.day(daysNumber[day]);
      daysMoment.push(newmoment);
    }


    //Para cuando el dia de hoy es mayor que los dias de repeticion del evento
    let ind = 0, day = 0;
    for (let i = 0; i < daysMoment.length; i++) {
      if (daysMoment[i].day() > day) {
        day = daysMoment[i].day();
        ind = i;
      }
    }
    if (moment().day() > daysMoment[ind].day()) {
      let d = daysMoment[0];
      d.add(7, "days");
      return d;
    }


    if (Days.length === 1) {
      let newmoment = moment();
      newmoment.day(daysNumber[Days[0]]);
      return newmoment;
    }

    let cercanoMoment, diasNumber = [], diaNumber = 0;
    for (let i = 0; i < daysMoment.length; i++) {
      diasNumber.push({ diff: daysMoment[i].diff(moment(), "hours"), i: i });
    }

    let diasNumberTemp = [];
    for (let i = 0; i < diasNumber.length; i++) {
      if (diasNumber[i].diff < 0) { } else {
        diasNumberTemp.push(diasNumber[i]);
      }
    }
    diasNumber = diasNumberTemp;

    if (diasNumber.length === 0) {
      let d = daysMoment[0];
      d.add(7, "days");
      return d;
    }

    for (let i = 0; i < diasNumber.length; i++) {
      //console.log(diasNumber[i]);
      if (i === 0) {
        cercanoMoment = daysMoment[diasNumber[i].i];
        diaNumber = diasNumber[i].diff;
      }

      if (diaNumber > diasNumber[i].diff) {
        cercanoMoment = daysMoment[diasNumber[i].i];
        diaNumber = diasNumber[i].diff;
      }

    }

    return cercanoMoment;

  }

  public async request(player) {
    // this.navCtrl.push(ChatOnePersonPage, { user: player.user });
    try {
      let sendM = await HelpersProvider.me.getWords("SENDREQUEST");
      HelpersProvider.me.presentAlertStandar(this.sendRequest.bind(this, player), () => { },
        sendM);
    }
    catch (e) {
      console.error(e);
    }
  }

  public async sendRequest(player) {
    try {
      let request: any = {
        user: player.userlocation.user.id,
        email: player.userlocation.user.email,
        team: MyApp.User.team,
        teamName: this.role.team.name
      };
      request = await this.http.post("/playerfree/request", request).toPromise();
      if (request.hasOwnProperty("msg")) {
        let msg = await HelpersProvider.me.getWords("TEAMREADY");
        this.alertCtrl.create({
          message: msg
        })
          .present();
        return;
      }

      let load = HelpersProvider.me.getLoadingStandar();
      //si se encontro el rol y el evento
      //Tiene habilitado buscar player
      if (this.role !== undefined && this.event.hasOwnProperty("searchPlayer") &&
        this.event.searchPlayer === true
      ) {
        this.players = await this.http.get(`/playerclose/${this.role.team.sport}/${this.event.searchPlayers}/${this.event.origin.lat}/${this.event.origin.lng}/20`).toPromise() as any;
        if (this.triggerPLayer !== undefined) {
          let index = this.players.findIndex(it => it.user.id === this.triggerPLayer.user.id);
          if (index === -1) this.players.push(this.triggerPLayer);
        }
        console.log(this.players);
      }

      load.dismissAll();
    }
    catch (e) {
      console.error(e);
    }
  }

}
