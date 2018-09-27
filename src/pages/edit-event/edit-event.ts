import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import moment from 'moment';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { EventPage } from '../event/event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';


declare var google: any;
@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage {
  private team: string;

  map: any;
  marker: any;
  //Para mostrar el mapa sin usar el plugin
  directionsDisplay = new google.maps.DirectionsRenderer;

  public event: any;
  public eventOriginal: any;
  private updateEvent: boolean = false;

  public callbackUpdate: Function;

  public location: any = {
    position: {},
    place: {},
    change: false
  };

  public locationChange = false;

  load: Loading;
  public image: boolean = false;
  private imageUpdate = false;
  public imageSrc: string = "";

  //var for inputs location
  public locationLink: string;
  public locationDetail: string;

  //var for inputs event
  public name: string = "";
  public type: string;
  public repeats: boolean = false;
  public repeatsDays: Array<any> = [];
  public repeatsDaily: boolean = false;
  public date: string = "";
  public time: string = "";
  public timeEnd = "";
  public attendeceTracking: boolean = false;
  public notifyTeam: boolean = false;
  public optionalInfo: string = "";
  public description: string = "";
  public address = '';
  public dateEnd = "";

  //index of event to update
  public index = 0;

  public percentageNotification = 100;
  public searchPlayer = false;
  public searchPlayers = [];

  public league = false;

  //Para notificar del evento 15 minutos antes
  public timeNoti = 15;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public geolocation: Geolocation,
    public alertCtrl: AlertController, public loading: LoadingController,
    private auth: AuthServiceProvider, private http: HttpClient,
    private helper: HelpersProvider, public modalCtrl: ModalController
  ) {

    this.event = this.navParams.get("event");
    this.index = this.navParams.get("index");
    console.log(this.index);

    //for remove reference
    this.eventOriginal = JSON.parse(JSON.stringify(this.navParams.get("event")));

    console.log(this.event);
    this.locationLink = this.event.location.link || "";
    this.locationDetail = this.event.location.detail || "";
    this.address = this.event.location.address || "";


    this.name = this.event.name;
    this.type = this.event.type || "";
    this.repeats = this.event.repeats;
    this.repeatsDays = this.event.repeatsDays.split(",") || [];
    this.repeatsDaily = this.event.repeatsDaily;
    this.date = moment(this.event.dateTime, "MM/DD/YYYY hh:mm a").format("DD MMM YYYY");
    this.time = this.event.Time;
    this.attendeceTracking = this.event.attendeceTracking;
    this.optionalInfo = this.event.optionalInfo;
    this.description = this.event.description;
    this.team = this.event.team;
    this.imageSrc = this.event.imageSrc;
    this.dateEnd = this.event.dateEnd || "";
    this.dateEnd = this.dateEnd !== "" ? moment(this.dateEnd).format("DD MMM YYYY") : '';
    this.timeEnd = this.event.dateTimeEnd || "";
    this.percentageNotification = this.event.percentageNotification || 100;
    this.searchPlayer = this.event.searchPlayer || false;
    if (this.searchPlayer === true) {
      this.searchPlayers = this.event.searchPlayers.split(",");
    }
    if (this.timeEnd !== "") {
      this.timeEnd = moment(this.timeEnd).format("hh:mm a");
    }

    //Calculamos los minutos en que se envia la notification
    if (this.event.dateTimeNotification !== undefined && this.event.dateTimeNotification !== null) {
      let dateTime = moment(this.event.dateTime, "MM/DD/YYYY hh:mm a"),
      dateTimeNotification = moment(this.event.dateTimeNotification);
      let diff = moment.duration( dateTime.diff(dateTimeNotification) );
      this.timeNoti = diff.minutes();
    }

    //Para saber si el usuario tiene el rol de dueño de liga
    this.league = MyApp.User.role.name === "OwnerLeague";
  }

  async ionViewDidLoad() {

    let origin: any, load = this.helper.getLoadingStandar();
    if (this.event.location.hasOwnProperty('lat') && this.event.location.hasOwnProperty('lng')) {
      this.location.position.lat = this.event.location.lat;
      this.location.position.lng = this.event.location.lng;
      origin = { lat: this.event.location.lat, lng: this.event.location.lng };
      this.locationChange = true;
      let places = await this.helper.locationToPlaces(this.location.position);
      if (places !== null)
        this.location.place = places;
    } else {
      /***
     * Para mostrar la ubicacion actual
     */
      let resp: any;
      resp = await (this.geolocation as any).getCurrentPosition();

      origin = { lat: resp.coords.latitude, lng: resp.coords.longitude };
    }



    let mapOptions: any = {
      center: origin,
      zoom: 8
    };

    this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    this.directionsDisplay.setMap(this.map);

    //Agregar un marker a mi position
    this.marker = new google.maps.Marker({
      position: origin,
      map: this.map
    });

    this.map.addListener('click', function (event) {
      // 3 seconds after the center of the map has changed, pan back to the
      // marker.
      this.marker.setPosition(event.latLng);
      this.locationChange = true;
    }.bind(this));

    load.dismissAll();

  }

  public addPlayerSearch() {
    this.searchPlayers.push("");
  }

  public removePlayerSearch(index) {
    if (this.searchPlayers.length === 1) {
      this.searchPlayers = [];
    } else {
      this.searchPlayers.splice(index, 1);
    }
  }

  public trackByIndex(index: number) {
    return index;
  }

  public selectDay(key: string) {

    let index = this.repeatsDays.findIndex(function (el) { return el === key });
    console.log(index, key);
    if (index === -1)
      this.repeatsDays.push(key);
    else {

      if (this.repeatsDays.length === 1)
        this.repeatsDays = [];
      else
        this.repeatsDays.splice(index, 1);

    }

  }

  public setDate() {
    this.helper.nativeDatePicker()
      .then(date => {
        this.date = moment(date).format("DD MMM YYYY");
      })
  }

  public setDateEnd() {
    this.helper.nativeDatePicker()
      .then(date => {
        this.dateEnd = moment(date).format("DD MMM YYYY");
      })
  }

  public setTime() {
    this.helper.pickerDateTime(true)
      .then(date => {
        console.log(moment(date, "hh:mm a").format("DD/MM/YYYY hh:mm a"));
        this.time = date;
      });
  }

  public setTimeEnd() {
    this.helper.pickerDateTime(true)
      .then(date => {
        this.timeEnd = date;
      })
  }

  public getSelectDays(key: string) {
    return -1 !== this.repeatsDays.findIndex(function (el) { return el === key });
  }

  public showDaysRepeats(): boolean {
    return this.repeats === true && this.repeatsDaily === false;
  }

  public loadPlace() {
    // let modal = this.modalCtrl.create(GoogleMapsComponent);
    // let t = this;
    // modal.onDidDismiss(async function (data: any) {
    //   if (data) {
    //     t.location.position = data;
    //     let places = await t.helper.locationToPlaces(t.location.position);
    //     t.location.place = places[0];
    //     t.location.change = true;
    //   }
    // });
    // modal.present();
  }

  //#region for change photo
  public success() {
    this.image = true;
  }

  public changePhoto() {

    this.helper.Camera({ width: 200, height: 200, quality: 80 }).then((base64Image) => {

      if (base64Image === undefined)
        return;

      this.imageSrc = base64Image;
      document.getElementById("imgT").setAttribute("src", base64Image);
      this.imageUpdate = true;
    })
      .catch((err) => {
        console.error(err);
      });

  }

  ionViewWillUnload() {
    if (this.updateEvent === false) {
      this.navCtrl.push(EventPage, {
        event: this.eventOriginal,
        user: this.auth.User()
      });
    }
  }


  public async update() {

    this.load = this.helper.getLoadingStandar();

    let requiredM = await this.helper.getWords("REQUIRED"),
      AddressOrMap = await this.helper.getWords("ADDRESSORDATE");

    if (this.location.placesubAdministrativeArea === "" && this.address === '') {
      this.alertCtrl.create({ title: requiredM, message: AddressOrMap, buttons: ["Ok"] }).present();
      this.load.dismiss();
      return;
    }

    //Para validar el campo de jugadores a buscar
    if (this.searchPlayer === true) {
      this.searchPlayers = this.searchPlayers.filter(it => {
        return it !== "";
      });
      if (this.searchPlayers.join("") === "") {
        let msg = await this.helper.getWords("NEWEVENT.ADDPOSITION");
        this.alertCtrl.create({ message: msg, buttons: ["Ok"] }).present();
        this.load.dismiss();
        return;
      }
    }
    let searchPlayers = this.searchPlayers.join(",");

    //create el object fo send to location event
    let locate: any;
    if (this.locationChange === false) {
      locate = {};
    } else {
      locate = this.location.position;
      let l = this.marker.getPosition();
      locate = { lat: l.lat(), lng: l.lng() };
    }

    locate.address = this.address;
    locate.link = this.locationLink || "";
    locate.detail = this.locationDetail || "";

    console.log(locate);

    //Check if the fields required is ok
    let isRequired = await this.helper.getWords("ISREQUIRED");
    let nameM = await this.helper.getWords("NAME"),
      timeM = await this.helper.getWords("TIME");

    if (this.name === '') {
      this.load.dismiss();
      this.alertCtrl.create({
        title: requiredM,
        message: nameM + " " + isRequired,
        buttons: ["Ok"]
      }).present();

      return;
    }

    if (this.time === '') {
      this.load.dismiss();
      this.alertCtrl.create({
        title: requiredM,
        message: timeM + " " + isRequired,
        buttons: ["Ok"]
      }).present();

      return;
    }

    if (this.percentageNotification > 100) {
      this.percentageNotification = 100;
    }
    if (this.percentageNotification < 0) {
      this.percentageNotification = 0;
    }

    let event: any = {
      name: this.name,
      type: this.type,
      attendeceTracking: this.attendeceTracking,
      optionalInfo: this.optionalInfo,
      description: this.description,
      repeats: this.repeats,
      repeatsDaily: this.repeatsDaily,
      repeatsDays: this.repeatsDays.join(","),
      location: locate,
      searchPlayer: this.searchPlayer
    };
    if (this.league === true) {
      if (Object.prototype.toString.call(this.league) === "[object Object]")
        event.league = MyApp.User.role.league.id;
      else
        event.league = MyApp.User.role.league;
    } else {
      event.team = this.team;
      event.percentageNotification = this.percentageNotification;
    }
    if (event.searchPlayer === true) {
      event.searchPlayers = searchPlayers;
    }
    if (this.repeats === true && this.dateEnd !== "") {
      event.dateEnd = moment(this.dateEnd, "DD MMM YYYY").toISOString();
    }
    if (this.timeEnd !== '') {
      event.dateTimeEnd = moment(this.timeEnd, "hh:mm a").toISOString()
    }

    //si es por semana entonces hay que chequear que este seleccionado almenos un dia
    let dayM = await this.helper.getWords("DAY");

    if (this.repeatsDaily === false && this.repeats === true) {

      if (this.repeatsDays.length === 0) {
        this.load.dismiss();
        this.alertCtrl.create({ title: requiredM, message: dayM + " " + isRequired }).present();
        return;
      } else {
        event.dateTime = moment(this.time, "hh:mm a").toISOString();
      }

    } else if (this.repeats === false) {

      let dateM = await this.helper.getWords("DATE");
      if (this.date == '') {
        this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: dateM + " " + isRequired,
          buttons: ["Ok"]
        }).present();

        return;
      }

      event.dateTime = moment(this.date + " " + this.time, "DD MMM YYYY hh:mm a").toISOString();
    } else {
      event.dateTime = moment(this.time, "hh:mm a").toISOString()
    }
    console.log(event);
    //Para calcular el momento en que se avisa que un evento esta cerca de iniciar
    let dateTimeNotification = moment(event.dateTime);
    dateTimeNotification.subtract(Number(this.timeNoti), "minutes");
    event.dateTimeNotification = dateTimeNotification.toISOString();

    let valid = true;

    try {

      await this.http.put("/event/" + this.event.id, event).toPromise();

      if (this.imageUpdate === true)
        await this.http.post("/images/events", { id: this.event.id, image: this.imageSrc }).toPromise();


    }
    catch (e) {
      console.error(e);
      valid = false;
    }

    let unexp = await this.helper.getWords("ERORUNEXC");
    if (valid === false) {
      this.load.dismiss();
      this.alertCtrl.create({
        title: "Error",
        message: unexp,
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.load.dismiss();

    await this.navCtrl.pop();
    EventsSchedulePage.openEvent = { valid: true, index: this.index };
    this.navCtrl.setRoot(EventsSchedulePage);
  }


}
