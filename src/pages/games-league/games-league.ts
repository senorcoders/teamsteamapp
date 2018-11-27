import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import * as moment from 'moment'
import { MyApp } from '../../app/app.component';
import { EventPage } from '../event/event';


@IonicPage()
@Component({
  selector: 'page-games-league',
  templateUrl: 'games-league.html',
})
export class GamesLeaguePage {

  public events = [];
  public eventsOrigin = [];

  //Para filtrar eventos
  public filter = "all";
  public url = interceptor.url;

  public by = "upcoming";
  public static by = "upcoming";
  public league:any;

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    private helper: HelpersProvider, private http: HttpClient,
    private zone: NgZone
  ) {
    if(this.navParams.get("league") !== undefined && this.navParams.get("league") !== null){
      this.league = this.navParams.get("league");
    }else{
      this.league = MyApp.User.role.league
    }
  }

  async ionViewDidLoad() {
    await this.getEvents();
  }

  private async getEvents() {

    let load = this.helper.getLoadingStandar();

    try {

      let events: any;
      if (Object.prototype.toString.call(this.league) === "[object Object]")
        events = await this.http.get("/league/games/" + this.by + "/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + this.league.id).toPromise();
      else
        events = await this.http.get("/league/games/" + this.by + "/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + this.league).toPromise();

      this.events = await this.parserEvents(events);

      this.eventsOrigin = this.events;

      //Filramos los eventos
      this.filterEvents();

    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  public filterEvents() {
    if (this.filter === "all") {
      this.events = this.eventsOrigin;
      return;
    }

    this.events = this.eventsOrigin.filter(function (it) {
      return it.type === this.filter;
    }.bind(this));

  }

  public loadImage(e) {
    e.loadImage = true;
  }

  private async parserEvents(events) {

    let user = MyApp.User, th = this;
    try {

      //preformarting for events
      events = await Promise.all(events.map(async function (it, index) {

        //Para saber si el evento es semanal
        it.weeks = it.repeats === true && it.repeatsDaily === false;

        if (it.weeks === true) {
          let day = th.getDayCercano(it.repeatsDays);
          let moth = await HelpersProvider.me.getWords(day.format("MMM").toUpperCase());
          it.parsedDateTime = [moth, day.format("DD")];
        } else {
          let day = moment(it.dateTime);
          let moth = await HelpersProvider.me.getWords(day.format("MMM").toUpperCase());
          it.parsedDateTime = [moth, day.format("DD")];
        }

        //if (it.repeatsDaily === true) {
        it.Time = moment(it.dateTime).format("hh:mm a");
        //}

        it.dateTime = moment(it.dateTime).format("MM/DD/YYYY hh:mm a");
        it.loadImage = false;
        let ramdon = new Date().getTime();
        it.imageSrc = interceptor.transformUrl('/images/' + ramdon + '/events/' + it.id + "-thumbnail");

        //Para obtener los likes y comments
        let likesUp = 0, likeUp = false, likesDown = 0, likeDown = false;
        for (var t of it.likes) {
          if (t.like === true) {
            likesUp += 1;
            if (t.user === user.id) {
              likeUp = true;
            }
          } else {
            likesDown += 1;
            if (t.user === user.id) {
              likeDown = true;
            }
          }
        }
        it.likesUp = likesUp;
        it.likesDown = likesDown;
        it.likeUp = likeUp;
        it.likeDown = likeDown;

        it.tracking = await th.http.get("/traking/query/" + MyApp.User.id + "/" + it.id).toPromise();

        let counts = await th.getTrackings(it);

        it.countYes = counts.countYes;
        it.countNo = counts.countNo;
        it.countMaybe = counts.countMaybe;

        it.loadImage = false;

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

  //Para obtener los tracking de event
  private async getTrackings(event) {

    let countYes = 0, countNo = 0, countMaybe = 0;
    try {
      let trackings: any = await this.http.get("/trackingevent/event/" + event.id).toPromise();

      await Promise.all(trackings.map(async function (item) {

        if (item.info == 'yes')
          countYes += 1;
        else if (item.info == 'no')
          countNo += 1;
        else
          countMaybe += 1;

        return item;
      }));

    }
    catch (e) {
      console.error(e);
    }

    return { countYes, countNo, countMaybe };
  }

  public inViews(e) {
    return e.views.findIndex(it => {
      return it.user === MyApp.User.id;
    }) === -1;
  }

  public goEvent(event: any) {

    let index = this.events.findIndex(function (el) { return el.id === event.id });
    if (index === -1) return;
    this.navCtrl.push(EventPage, {
      event,
      user: MyApp.User,
      index,
      inLeagueGames: true
    })
  }

  public byS(b) {
    let t = this;
    this.zone.run(function () {
      t.by = b;
      GamesLeaguePage.by = b;
      t.getEvents();
    })
  }

}
