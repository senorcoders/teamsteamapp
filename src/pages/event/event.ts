import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController, Platform } from 'ionic-angular';
import * as moment from 'moment';


import { EditEventPage } from '../edit-event/edit-event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { ViewTrakingComponent } from '../../components/view-traking/view-traking';
import { TrackingEventManagerComponent } from '../../components/tracking-event-manager/tracking-event-manager';
import { AssistencesComponent } from '../../components/assistences/assistences';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { Geolocation } from '@ionic-native/geolocation';
import { AssistenceComponent } from '../../components/assistence/assistence';
import { PlayerCloseEventPage } from '../player-close-event/player-close-event';
import { ImagesEventPage } from '../images-event/images-event';
import { MyTaskPage } from '../my-task/my-task';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  public static __name = "EventPage"

  map: any;
  load: Loading;

  public loadImage = false;

  private tracking: any;

  private index = 0;

  public user: any;
  public event: any;

  public imgUser: string = "";
  public name: string = "";

  public location: any = {
    position: { lat: 51.5033640, lng: -0.12762500 },
    place: {},
    change: false
  };

  //Para las assistences
  public players = [];
  public assistences = [];

  public numTasks=0;

  //Para mostrar el mapa sin usar el plugin
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;

  public enablePlayerClose = false;
  public idEventPlayerClose: number;

  public league = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingController, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider, public helper: HelpersProvider,
    public modalCtrl: ModalController,
    private zone: NgZone, public platform: Platform,
    public socket: WebSocketsProvider, public geolocation: Geolocation
  ) {
    //this.init();
    let e = this.navParams.get("event");
    this.user = MyApp.User;

    if (!e.hasOwnProperty("comments")) {
      e.comments = [];
    }

    if (!e.location.hasOwnProperty("address")) {
      e.location.address = [];
    }

    this.event = e;
    this.index = this.navParams.get("index");

    //Para saber si se tiene que motras la opcion para ver jugadores cercanos a un evento
    this.checkEnablePlayerClose();
    this.idEventPlayerClose = setInterval(this.checkEnablePlayerClose.bind(this), 1000 * 60);

    //for image user that published events
    this.imgUser = interceptor.transformUrl("/userprofile/images/" + this.event.user.id + "/" + MyApp.User.team);

    //Para saber si el usuario tiene el rol de dueño de liga
    this.league = MyApp.User.role.name === "OwnerLeague";

    //Para ver si tiene tareas pendientes el usuario
    this.event.tasks = this.event.tasks || [];
    if(this.league===false){
      this.numTasks = this.event.tasks.filter(it=>{
        return it.for === MyApp.User.id && it.completad === false;
      }).length;
    }
  }

  async ionViewDidLoad() {

    //para obtener los trackings del evento
    try {
      this.tracking = await this.http.get("/traking/query/" + MyApp.User.id + "/" + this.event.id).toPromise();
      //console.log(this.tracking);
    }
    catch (e) {
      console.error(e);
    }

    console.log(this.event);
    let idUser: string;
    if (Object.prototype.toString.call(this.event.user) === '[object String]') {
      idUser = this.event.user
    } else {
      idUser = this.event.user.id;
    }

    let userPublisher: any = await this.http.get("/user/" + idUser).toPromise();
    this.name = userPublisher.firstName+ " "+ userPublisher.lastName;

    //for geoconder location, obtener por nombre de location
    this.location.useMap = this.event.location.hasOwnProperty("lat") && this.event.location.hasOwnProperty("lng");
    try {

      if (this.location.useMap === true) {
        this.location.position = { lat: this.event.location.lat, lng: this.event.location.lng };
        let places = await this.helper.locationToPlaces(this.location.position);
        if (places === null) return;
        this.location.place = places;
      } else {

        let geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: this.event.location.address }, function (res, status) {

          if (res.length === 0) return;

          res = res[0];
          if (res.geometry) {
            let lat = res.geometry.location.lat();
            let lot = res.geometry.location.lng();
            this.loadMap = this.loadMap.bind(this);
            this.loadMap(lat, lot);
          }

        }.bind(this));

      }

    }
    catch (e) {
      console.error(e);
    }

    if (moment(this.event.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true).isValid()) {
      this.event.dateTime = moment(this.event.dateTime).format("MM/DD/YYYY hh:mm a");
    }

    this.event.parsedTime = moment(this.event.dateTime, "MM/DD/YYYY hh:mm a").format("Do MMMM YYYY hh:mm a");

    this.event.link = '';
    if (this.event.location.hasOwnProperty('link')) {

      if (!this.event.location.link.includes("http") || !this.event.location.link.includes("https")) {
        this.event.link = "http://" + this.event.location.link;
      } else
        this.event.link = this.event.location.link

    }


    if (this.location.useMap === true) {
      this.loadMap(this.event.location.lat, this.event.location.lng);
    }

    let counts = await this.getTrackings(this.event);

    this.event.countYes = counts.countYes;
    this.event.countNo = counts.countNo;
    this.event.countMaybe = counts.countMaybe;
  }

  ionViewWillEnter() {
    this.socket.subscribeWithPush("eventStatus", function () { }, function (event) {
      this.event.status = event.status;
    }.bind(this));
  }

  ionViewWillUnload() {
    this.socket.unsubscribeWithPush("eventStatus");
    clearInterval(this.idEventPlayerClose);
  }

  public hiddenEditRemove() {
    if (this.user.role.name !== "Manager" && this.league !== true)
      return true;

    return false;
  }

  public successLoadImage() {
    this.loadImage = true;
  }

  public toTasks(){
    this.navCtrl.push(MyTaskPage);
  }

  public checkEnablePlayerClose() {
    let dateEvent = moment(this.event.parsedDateTime[0] + "/" + this.event.parsedDateTime[1] + this.event.Time, "MMMM/DDhh:mm a");
    let date = moment(this.event.parsedDateTime[0] + "/" + this.event.parsedDateTime[1] + this.event.Time, "MMMM/DDhh:mm a");
    date.subtract(30, "minutes");
    let now = moment();
    // console.log(
    //   now.format("DD/MM/YYYY hh:mm:ss a"),
    //   date.format("DD/MM/YYYY hh:mm:ss a"),
    //   dateEvent.format("DD/MM/YYYY hh:mm:ss a"),
    //   now.isAfter(date),
    //   now.isBefore(dateEvent),
    //   this.user.role.name
    // );

    if (EventsSchedulePage.by !== "past") {
      this.enablePlayerClose = true;
    }
    console.log(this.enablePlayerClose);
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

  async loadMap(lat, lot) {

    //this.load = this.helper.getLoadingStandar();

    let mapOptions: any = {
      center: {
        lat: lat,
        lng: lot
      },
      zoom: 8
    };

    this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    this.map.setOptions({ draggable: false });


    this.directionsDisplay.setMap(this.map);

    let image = {
      url: './assets/imgs/icon-marker.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(24, 24),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(0, 8)
    };

    new google.maps.Marker({
      animation: 'DROP',
      position: {
        lat: lat,
        lng: lot
      },
      map: this.map,
      icon: image
    });

    google.maps.event.addListenerOnce(this.map, 'idle', function () {
      this.location.change = true;
    }.bind(this));

    /***
     * Para mostrar direcciones del evento, en el mapa
     */
    let resp: any;
    resp = await (this.geolocation as any).getCurrentPosition();
    let origin = { lat: resp.coords.latitude, lng: resp.coords.longitude };

    //Para la route en uato
    this.directionsService.route({
      origin,
      destination: mapOptions.center,
      travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
      }
    });

    //this.load.dismissAll();

  }

  public enableMoveMap() {
    this.map.setOptions({ draggable: true });
  }

  public async presentAlertStandar(acept: Function, cancel?: Function, concatMessage?: string) {

    cancel = cancel || new Function();
  
    let si = await this.helper.getWords("YES"), no = await this.helper.getWords("NO");
    let til = await this.helper.getWords("DELETEEVENT");
    let alert = this.alertCtrl.create({
      title: til,
      buttons: [
        {
          text: no,
          role: 'cancel',
          handler: () => cancel()
        },
        {
          text: si,
          handler: () => acept()
        }
      ]
    });
    alert.present();
  }

  public async remove() {

    await this.presentAlertStandar(this.deleteEvent.bind(this));

  }

  private async deleteEvent() {

    let valid = true;
    let load = this.helper.getLoadingStandar();
    try {
      await this.http.delete("/event/" + this.event.id).toPromise();
      await this.http.delete("/images/events/" + this.event.id).toPromise();
    }
    catch (e) {
      console.error(e);
      valid = false;
      await this.helper.presentAlertErrorStandar();
    }

    if (valid === false)
      return;

    load.dismiss();
    this.navCtrl.setRoot(EventsSchedulePage);
  }

  private async editEvent() {
    let t = this;
    this.navCtrl.pop({ animation: "ios-transition" }, function () {
      t.navCtrl.push(EditEventPage, {
        event: t.event,
        index: t.index
      }, { animation: "ios-transition" });
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
      //console.log(li);
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

    //console.log(like);

    if (event.likeUp === true && likeUp === true) {
      /*let li = */await this.http.delete("/likes/" + like.id).toPromise();
      event.likeUp = false;
      if (event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);
      //console.log(event.likes);
      await this.countLikes(event);
      return;

    } else if (event.likeDown === true && likeUp === false) {
      /*let li = */await this.http.delete("/likes/" + like.id).toPromise();
      event.likeDown = false;
      if (event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);

      //console.log(event.likes);
      await this.countLikes(event);
      return;
    }

    if (event.likeUp === false && likeUp === true && event.likeDown === true) {
      /*let li = */await this.http.put("/likes/" + like.id, like).toPromise();
      //console.log(li);
      event.likeDown = false;
      event.likeUp = true;
      event.likes[index].like = likeUp;
      await this.countLikes(event);

    } else if (event.likeUp === true && likeUp === false && event.likeDown === false) {
      /*let li = */await this.http.put("/likes/" + like.id, like).toPromise();
      //console.log(li);
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

  public async viewTraking(e) {
    let view = this.modalCtrl.create(ViewTrakingComponent, { e });
    view.present();
  }

  public viewTrakingEvent() {
    this.modalCtrl.create(TrackingEventManagerComponent, { e: this.event }).present();
  }

  //asigna una respuesta al evento si no esta creada se crea
  async asingResponse(response) {
    
    if (EventsSchedulePage.by === "past") return;

    let guardar = this.tracking.user !== undefined;
    try {
      let newTrack: any;
      if (guardar === false) {
        newTrack = await this.http.post("/trackingevent", { user: MyApp.User.id, event: this.event.id, info: response })
          .toPromise();
        this.tracking = newTrack;
      } else {
        newTrack = await this.http.put("/trackingevent/" + this.tracking.id, { info: response }).toPromise();
        this.tracking = newTrack;
      }
      console.log(guardar);

      let counts = await this.getTrackings(this.event);

      this.event.countYes = counts.countYes;
      this.event.countNo = counts.countNo;
      this.event.countMaybe = counts.countMaybe;

    }
    catch (e) {
      console.error(e);
    }
  }

  public async toAssistence() {
    if (this.event.repeats === true) {
      this.modalCtrl.create(AssistencesComponent, { event: this.event })
        .present();
    } else {
      this.modalCtrl.create(AssistenceComponent, { repeats: false, event: this.event })
        .present();
    }


  }

  public toPlayerClose() {
    this.navCtrl.push(PlayerCloseEventPage, { eventID: this.event.id });
  }

  public async asignStatus(status) {
    try {

      if (MyApp.User.role.name !== "Manager") return;

      this.zone.runOutsideAngular(async function () {

        let msg: any = await this.http.put("/event/status", { id: this.event.id, status }).toPromise();

        this.zone.run(function () {
          if (msg.hasOwnProperty("msg") === true) {
            this.event.status = status;
          }
          console.log(this.event);
        }.bind(this));


      }.bind(this));
    }
    catch (e) {
      console.error(e);
    }
  }

  public toImages() {
    this.navCtrl.push(ImagesEventPage, { event: this.event });
  }

}
