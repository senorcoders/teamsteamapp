import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
import moment from 'moment';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { MyApp } from '../../app/app.component';
import { EventCreatedComponent } from '../../components/event-created/event-created';
import { Geolocation } from '@ionic-native/geolocation';
import { TabsPage } from '../tabs/tabs';

declare var google: any;

@IonicPage()
@Component({
  selector: 'page-new-event',
  templateUrl: 'new-event.html',
})
export class NewEventPage {

  public static __name = "NewEventPage"

  private team: any;
  map: any;
  marker: any;

  load: Loading;
  public image: boolean = false;
  public imageSrc: string = "";

  public location: any = {
    position: { lat: 51.5033640, lng: -0.12762500 },
    place: {
      subAdministrativeArea: "",
      thoroughfare: ""
    },
    change: false
  };

  //var for inputs location
  public locationLink: string;
  public locationDetail: string;

  //var for inputs event
  public name: string = "";
  public type: string = "practice";
  public repeats: boolean = false;
  public repeatsDaily: boolean = false;
  public repeatsDays: Array<any> = [];
  public date: string = "";
  public time: string = "";
  public timeEnd: string = "";
  public attendeceTracking: boolean = false;
  public optionalInfo: string = "";
  public description: string = "";
  public address = "";
  public dateEnd = "";
  public notificationInCreate = true;

  //for max date and min date asing in date time picker
  public minDate: string;
  public maxDate: string;

  //Para mostrar el mapa sin usar el plugin
  directionsDisplay = new google.maps.DirectionsRenderer;

  public percentageNotification = 100;
  public searchPlayer = false;
  public searchPlayers = [];

  public league = false;

  //Para notificar del evento 15 minutos antes
  public timeNoti = 15;

  @ViewChild('addressInput') addresComponet: ElementRef;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public loading: LoadingController,
    private auth: AuthServiceProvider, private http: HttpClient,
    private helper: HelpersProvider, public modalCtrl: ModalController,
    public geolocation: Geolocation
  ) {
    this.team = this.navParams.get("team");
    this.maxDate = moment().add(2, "year").format("YYYY");
    this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");

    //Para saber si el usuario tiene el rol de dueño de liga
    this.league = MyApp.User.role.name === "OwnerLeague";
  }

  async ionViewDidLoad() {

    // let load = HelpersProvider.me.getLoadingStandar();
    //cargamos google maps si a un no ha cargado
    if (HelpersProvider.me.enableMapsLocation === false)
      await HelpersProvider.me.reloadGoogleplaces();

    /***********
     * Para mostrar sugerencias en el input de direccion
     */
    let input = (this.addresComponet as any).getNativeElement().getElementsByTagName("input")[0];
    new google.maps.places.Autocomplete(input, {});

    /***
     * Para mostrar la ubicacion actual
     */
    let resp: any;
    resp = await (this.geolocation as any).getCurrentPosition();

    let origin = { lat: resp.coords.latitude, lng: resp.coords.longitude };

    let mapOptions: any = {
      center: origin,
      zoom: 8,
      scrollWheelZoom: false
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
      this.location.change = true;
      console.log(this.marker.getPosition());
    }.bind(this));

    // load.dismissAll();

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

  public getSelectDays(key: string) {
    return -1 !== this.repeatsDays.findIndex(function (el) { return el === key });
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

  public showDaysRepeats(): boolean {
    return this.repeats === true && this.repeatsDaily === false;
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
        this.time = date;
      })
  }

  public setTimeEnd() {
    this.helper.pickerDateTime(true)
      .then(date => {
        this.timeEnd = date;
      })
  }

  //#region for change photo
  public success() {
    this.image = true;
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

  public async changePhoto() {
    let t = this, message = '';

    try {
      message = await this.helper.getWords("ERORUNEXC");

      this.helper.Camera({ width: 200, height: 200, quality: 80 }).then((result) => {
        if (result) {
          t.imageSrc = result;
        }
      })
        .catch((err) => {
          console.error(err);
          t.alertCtrl.create({
            title: "Error",
            message: message,
            buttons: ["Ok"]
          }).present();
        });

    }
    catch (e) {
      console.error(e);
    }

  }

  public async save() {

    this.load = this.helper.getLoadingStandar();

    let requiredM = await this.helper.getWords("REQUIRED"),
      AddressOrMap = await this.helper.getWords("ADDRESSORDATE");

    let address = (this.addresComponet as any).getNativeElement().getElementsByTagName("input")[0].value;
    if (this.location.change === false && address === '') {
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
    if (this.location.change === false) {
      locate = {};
    } else {
      let l = this.marker.getPosition();
      locate = { lat: l.lat(), lng: l.lng() };
    }

    locate.address = address;
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
      optionalInfo: this.optionalInfo,
      description: this.description,
      user: MyApp.User.id,
      repeats: this.repeats,
      repeatsDaily: this.repeatsDaily,
      repeatsDays: this.repeatsDays.join(","),
      location: locate,
      searchPlayer: this.searchPlayer
    };
    if (this.league === true) {
      if (Object.prototype.toString.call(MyApp.User.role.league) === "[object Object]")
        event.league = MyApp.User.role.league.id;
      else
        event.league = MyApp.User.role.league;
    } else {
      event.team = this.team;
      event.percentageNotification = this.percentageNotification;
      event.notificationInCreate = this.notificationInCreate;
    }
    if (event.searchPlayer === true) {
      event.searchPlayers = searchPlayers;
    }
    if (this.repeats === true && this.dateEnd !== "") {
      event.dateEnd = moment(this.dateEnd, "DD MMM YYYY").toISOString();
    }
    if (this.timeEnd !== '') {
      event.dateTimeEnd = moment(this.timeEnd, "hh:mm a").toISOString();
    }
    console.log(event);

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
      event.dateTime = moment(this.time, "hh:mm a").toISOString();
    }

    //Para calcular el momento en que se avisa que un evento esta cerca de iniciar
    let dateTimeNotification = moment(event.dateTime);
    dateTimeNotification.subtract(Number(this.timeNoti), "minutes");
    event.dateTimeNotification = dateTimeNotification.toISOString();

    let valid = true;
    let newEvent: any;
    try {
      newEvent = await this.http.post("/event", {
        event
      }).toPromise();
      console.log(newEvent);

      if (this.imageSrc !== '') {
        await this.http.post("/images/events", { id: newEvent.id, image: this.imageSrc }).toPromise();
      }
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

    await this.load.dismiss();
    this.navCtrl.setRoot(TabsPage);
    // this.navCtrl.setRoot(EventsSchedulePage);
    this.navCtrl.push(EventCreatedComponent, { event: newEvent });

  }

}
