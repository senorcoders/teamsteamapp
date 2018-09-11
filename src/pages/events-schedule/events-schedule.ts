import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, ModalController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { EventPage } from '../event/event';
import { NewEventPage } from '../new-event/new-event';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { CommentsComponent } from '../../components/comments/comments';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { ImagesEventPage } from '../images-event/images-event';
import { ImageViewerController } from 'ionic-img-viewer';

@IonicPage()
@Component({
  selector: 'page-events-schedule',
  templateUrl: 'events-schedule.html',
})
export class EventsSchedulePage {

  @ViewChild("addEventButton") addEventButton: ElementRef;
  public user: any = {
    role: {
      name: ""
    }
  };

  public static openEvent = { valid: false, index: 0 };

  public team: any;

  public events: Array<any> = [];
  public eventsOrigin = [];
  public event0 = false;

  public by: string = "upcoming";
  public static by: string = "upcoming";
  public league = false;

  //Para filtrar eventos
  public filter = "all";
  public url = interceptor.url;

  public allImages = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public auth: AuthServiceProvider, private sockets: WebSocketsProvider,
    public http: HttpClient, public modalCtrl: ModalController,
    public alertCtrl: AlertController, public helper: HelpersProvider,
    public popoverCtrl: PopoverController, public zone: NgZone,
    public locationAccuracy: LocationAccuracy, public geolocation: Geolocation,
    private imageViewerCtrl: ImageViewerController
  ) {

    if (this.navParams.get("notification") === undefined)
      MyApp.initNotifcations();

    this.locationAccuracy.canRequest().then((canRequest: boolean) => {

      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
          () => {
            //permiss success
          },
          error => console.log('Error requesting location permissions', error)
        );
      }

    });

    //Para saber si el usuario tiene el rol de dueño de liga
    this.league = MyApp.User.role.name === "OwnerLeague";
  }

  public presentImage(myImage) {
    let img = new Image();
    let src = myImage.target.src;
    src = src.split("?").shift()+ "?middle=true";
    img.setAttribute("src", src);
    const imageViewer = this.imageViewerCtrl.create(img);
    imageViewer.present();
  }

  //#region not geofence
  async ngOnInit() {

    //cargamos google maps si a un no ha cargado
    if (HelpersProvider.me.enableMapsLocation === false)
      await HelpersProvider.me.reloadGoogleplaces();

    await this.getEvents();
    console.log(this.events);

    if (EventsSchedulePage.openEvent.valid === true) {
      this.goEvent(this.events[EventsSchedulePage.openEvent.index]);
      EventsSchedulePage.openEvent = { valid: false, index: 0 };
    }
  }

  public addButtonHidden() {
    if (this.user.role.name !== "Manager" && this.user.role.name !== "OwnerLeague")
      return true;

    return false;
  }

  private async getEvents() {

    let load = this.helper.getLoadingStandar();

    try {
      this.user = MyApp.User;
      this.team = this.user.team;

      let events: any;
      if (this.league === true) {
        if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]")
          events = await this.http.get("/event/league/" + this.by + "/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + MyApp.User.role.league.id).toPromise();
        else
          events = await this.http.get("/event/league/" + this.by + "/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + MyApp.User.role.league).toPromise();
      } else {
        events = await this.http.get("/event/team/" + this.by + "/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + this.team).toPromise();
      }
      this.helper.setGeofences(200, events);
      this.events = await this.parserEvents(events);

      this.eventsOrigin = this.events;

      //this.events = this.events.reverse();
      if (this.events.length === 0 && this.by === "upcoming")
        this.event0 = true;
      else if (this.by === "past")
        this.event0 = false;
      else
        this.event0 = false;

      //Filramos los eventos
      this.filterEvents();

      //Obtenemos todas las imagenes
      let imgs = [];
      for (let e of this.eventsOrigin) {
        let is = e.images || [];
        imgs = imgs.concat(is);
      }
      this.allImages = imgs;

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
    ////console.log(size);
    try {

      //preformarting for events
      events = await Promise.all(events.map(async function (it, index) {

        //Para saber si el evento es semanal
        it.weeks = it.repeats === true && it.repeatsDaily === false;

        if (it.weeks === true) {
          let day = th.getDayCercano(it.repeatsDays);
          let moth = await HelpersProvider.me.getWords(day.format("MMM").toUpperCase());
          it.parsedDateTime = [moth, day.format("DD")];
          ////console.log(it.name, it.parsedDateTime);
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
        it.imageSrc = interceptor.transformUrl('/images/' + ramdon + '/events/' + it.id+ "-thumbnail");

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

  //Para obtener los tracking de event
  private async getTrackings(event) {

    let countYes = 0, countNo = 0, countMaybe = 0;
    try {
      let trackings: any = await this.http.get("/trackingevent/event/" + event.id).toPromise();

      //console.log(trackings);
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

  //asigna una respuesta al evento si no esta creada se crea
  async asingResponse(event, response) {

    if (this.by === "past") return;

    let guardar = event.tracking.user !== undefined;
    try {
      let newTrack: any;
      if (guardar === false) {
        newTrack = await this.http.post("/trackingevent", { user: MyApp.User.id, event: event.id, info: response })
          .toPromise();
      } else {
        newTrack = await this.http.put("/trackingevent/" + event.tracking.id, { info: response }).toPromise();
      }

      let counts = await this.getTrackings(event);

      let index = this.events.findIndex(function (e) { return e.id === event.id; });
      ////console.log(index, this.events);
      this.events[index].countYes = counts.countYes;
      this.events[index].countNo = counts.countNo;
      this.events[index].countMaybe = counts.countMaybe;
      this.events[index].tracking = newTrack;

    }
    catch (e) {
      console.error(e);
    }
  }

  ionViewWillEnter() {

    let t = this;
    //nos subscribimos con push
    this.sockets.subscribeWithPush('event', function (data) {

      //console.log("new event ", event);

      //Para obtener los datos de mejor manera es recargar la lista de eventos
      //Sobre todo porque hay que iterar sobre ellos para calcular orden y parsear propiedades
      t.zone.run(function () { t.getEvents(); });

    }, function (data) {
      //console.log("actualizamos el evento", data);
      //Para obtener los datos de manera fiel es mejor recargargar la lista de eventos
      //Sobre todo porque hay que iterar sobre ellos para calcular orden y parsear propiedades
      t.zone.run(function () {

        let index = t.events.findIndex(function (el) { return el.id === data.id });
        if (index === -1) return;
        let event = t.events[index];
        for (let name in event) {
          event[name] = data[name];
        }
        t.events[index] = event;

      });

    }, function (data) {
      //console.log("eliminamos el evento", data);
      //obtenemos la posicion que tiene en el array para despues eliminarlo
      let index = t.events.findIndex(function (el) { return el.id === data.id });
      if (index !== -1) {
        if (this.events.length === 0)
          this.events = [];
        else {
          this.events.splice(index, 1)
        }

      }

    });

    this.sockets.subscribeWithPush("comment", function (data) {

      ////console.log("new comment", data)
      //Para actualizar cuando un commentario nuevo es realizado
      //obtenemos la posicion que tiene en el array para despues eliminarlo
      t.zone.run(function () {

        let index = t.events.findIndex(function (el) { return el.id === data.event });
        ////console.log(index);
        if (index !== -1) {
          let event = t.events[index];
          event.comments.push(data);
          t.events[index] = event;
        }

      })

    });
  }

  ionViewWillUnload() {
    //console.log("unsubscribe");
    this.sockets.unsubscribeWithPush('event');
    this.sockets.unsubscribeWithPush("comment");
  }

  public goEvent(event: any) {

    let index = this.events.findIndex(function (el) { return el.id === event.id });
    //console.log(index);
    if (index === -1) return;
    this.navCtrl.push(EventPage, {
      event,
      user: this.user,
      index
    })
  }

  public async addEvent() {
    this.navCtrl.push(NewEventPage, {
      team: this.team
    });
  }

  public successImage(e) {
    e.element.removeAttribute("hidden");
  }

  public byS(b) {
    let t = this;
    this.zone.run(function () {
      t.by = b;
      EventsSchedulePage.by = b;
      t.getEvents();
    })
  }

  public async like(event, likeUp) {

    //si no ha dado like en ninguno
    if (event.likeUp === false && event.likeDown === false) {
      let like: any = { user: this.user.id, event: event.id, dateTime: moment().toISOString() };
      if (likeUp === true) {
        like.like = true
      } else {
        like.like = false;
      }

      let li = await this.http.post("/likes/", like).toPromise();
      ////console.log(li);
      event.likeUp = likeUp;
      event.likeDown = !likeUp;
      event.likes.push(li);
      await this.countLikes(event);
      return;
    }

    //Para cuando ya se ha dado click en cualquiera de los botones
    let idUser = this.user.id;
    let index = event.likes.findIndex(function (elem) { return elem.user === idUser });
    let like = event.likes[index];

    ////console.log(like);

    if (event.likeUp === true && likeUp === true) {
      /*let li = */ await this.http.delete("/likes/" + like.id).toPromise();
      event.likeUp = false;
      if (event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);
      ////console.log(event.likes);
      await this.countLikes(event);
      return;

    } else if (event.likeDown === true && likeUp === false) {
      /*let li = */ await this.http.delete("/likes/" + like.id).toPromise();
      event.likeDown = false;
      if (event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);

      ////console.log(event.likes);
      await this.countLikes(event);
      return;
    }

    if (event.likeUp === false && likeUp === true && event.likeDown === true) {
      /*let li = */ await this.http.put("/likes/" + like.id, like).toPromise();
      ////console.log(li);
      event.likeDown = false;
      event.likeUp = true;
      event.likes[index].like = likeUp;
      await this.countLikes(event);

    } else if (event.likeUp === true && likeUp === false && event.likeDown === false) {
      /*let li = */ await this.http.put("/likes/" + like.id, like).toPromise();
      ////console.log(li);
      event.likeDown = true;
      event.likeUp = false;
      event.likes[index].like = likeUp;
      await this.countLikes(event);
    }

  }

  private async countLikes(event): Promise<Object> {
    //let user = this.user;
    return new Promise(function (resolve, reject) {
      let likesUp = 0, likesDown = 0;
      for (var t of event.likes) {
        if (t.like === true) {
          likesUp += 1;
        } else {
          likesDown += 1;
        }
      }
      event.likesUp = likesUp;
      event.likesDown = likesDown;
      resolve(true);
    });
  }

  public async viewComment(e) {
    let view = this.modalCtrl.create(CommentsComponent, { e });
    view.present();
  }

  //#endregion

  public toImages(event) {
    this.navCtrl.push(ImagesEventPage, { event: event });
  }

}
