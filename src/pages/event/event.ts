import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController, Platform } from 'ionic-angular';
import * as moment from 'moment';

import {
  GoogleMaps,
  GoogleMap,
} from '@ionic-native/google-maps';
import { EditEventPage } from '../edit-event/edit-event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';;
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { ViewTrakingComponent } from '../../components/view-traking/view-traking';
import { TrackingEventManagerComponent } from '../../components/tracking-event-manager/tracking-event-manager';
import { AssistencesComponent } from '../../components/assistences/assistences';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { Geolocation } from '@ionic-native/geolocation';
import { AssistenceComponent } from '../../components/assistence/assistence';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  map: any;
  load: Loading;

  public loadImage = false;

  private tracking: any;

  private index = 0;

  public user: any;
  public event: any;

  public imgUser: string = "";
  public username: string = "";

  public location: any = {
    position: { lat: 51.5033640, lng: -0.12762500 },
    place: {
      placesubAdministrativeArea: "",
      thoroughfare: ""
    },
    change: false
  };

  //Para las assistences
  public players = [];
  public assistences = [];

  //Para mostrar el mapa sin usar el plugin
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingController, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider, public helper: HelpersProvider,
    public photoViewer: PhotoViewer, public modalCtrl: ModalController,
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
    console.log(this.index, this.event);

    //for image user that published events
    let r = new Date().getTime();
    this.imgUser = interceptor.transformUrl("/images/" + r + "/users&thumbnail/" + this.event.user);
  }

  async ngOnInit() {

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
    this.username = userPublisher.username;

    //cargamos google maps si a un no ha cargado
    if (HelpersProvider.me.enableMapsLocation === false)
      await HelpersProvider.me.reloadGoogleplaces();

    //for geoconder location, obtener por nombre de location
    this.location.change = false;
    this.location.useMap = this.event.location.hasOwnProperty("lat") && this.event.location.hasOwnProperty("lng");
    try {

      if (this.location.useMap === true) {
        this.location.position = { lat: this.event.location.lat, lng: this.event.location.lng };
        let places = await this.helper.locationToPlaces(this.location.position);
        if (places === null) return;
        this.location.place = places[0];
        this.location.change = true;
      } else {

        let geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: this.event.location.address }, function (res, status) {

          if (res.length === 0) return;

          res = res[0];
          if (res.geometry) {
            let lat = res.geometry.location.lat();
            let lot = res.geometry.location.lng();
            this.zone.run(function () { this.location.change = true; }.bind(this));
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
  }

  public successLoadImage() {
    this.loadImage = true;
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

    this.load = this.helper.getLoadingStandar();

    let mapOptions: any = {
      center: {
        lat: lat,
        lng: lot
      },
      zoom: 8
    };

    this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

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

    /***
     * Para mostrar direcciones del evento, en el mapa
     */
    let resp: any;
    resp = await (this.geolocation as any).getCurrentPosition();
    console.log("location", resp);
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

    this.load.dismissAll();

  }

  public enableMoveMap(){
    this.map.setOptions({draggable: true});
  }

  public async remove() {

    await this.helper.presentAlertStandar(this.deleteEvent.bind(this));

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

  public viewPhoto(src: string, name: string) {
    console.log(src);
    this.photoViewer.show(src, name, { share: true })
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

    if( EventsSchedulePage.by === "past" ) return;

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
    if( this.event.repeats === true ){
      this.modalCtrl.create(AssistencesComponent, { event: this.event })
      .present();
    }else{
      this.modalCtrl.create(AssistenceComponent, { repeats: false, event: this.event })
      .present();
    }
    

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

}
