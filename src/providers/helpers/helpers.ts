import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Platform, Loading, LoadingController, ModalController, AlertController, App } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CameraPage } from '../../pages/camera/camera';
import {
  NativeGeocoder,
  NativeGeocoderReverseResult
} from '@ionic-native/native-geocoder';
import { DatePicker, DatePickerOptions } from '@ionic-native/date-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimePickerComponent } from '../../components/date-time-picker/date-time-picker';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { CalendarModal, CalendarResult } from 'ion2-calendar';
import { ImageViewPage } from '../../pages/image-view/image-view';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
import { Geofence } from '@ionic-native/geofence';
import { Storage } from '@ionic/storage';
declare var google: any;
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';


/**
 * este servicio contiene funciones generales que son usadas mas de una ves por las diferentes componentes
 */

@Injectable()
export class HelpersProvider {
  public static lat: string = "51.5033640";
  public static lng: string = "-0.12762500";

  public static me: HelpersProvider;

  public enableMapsLocation = false;

  constructor(public http: HttpClient, public diagnostic: Diagnostic,
    public app: App, public nativeGeocoder: NativeGeocoder,
    public datePicker: DatePicker, private translate: TranslateService,
    private zone: NgZone, private loading: LoadingController,
    private modalCtrl: ModalController, public camera: Camera,
    public platform: Platform, public alertCtrl: AlertController,
    public device: Device, public geofence: Geofence,
    public storage: Storage, public backgroundGeolocation: BackgroundGeolocation
  ) {
    this.init();
  }

  private init() {
    HelpersProvider.me = this;
    if (window.hasOwnProperty("google") === true) {
      HelpersProvider.me.enableMapsLocation = true;
    }
  }

  public async reloadGoogleplaces(sleep?: boolean) {

    sleep = sleep || false;
    if (sleep === true)
      await new Promise(function (resolve) { setTimeout(resolve, 2000) });

    try {

      let script = await this.http.get("https://maps.googleapis.com/maps/api/js?key=AIzaSyAFLgCYDZUvB1CeR3IQDjoIfK-yVkSBm7Q&libraries=places", {
        responseType: 'text'
      }).toPromise();

      let fn = new Function(script);
      fn();

      if (window.hasOwnProperty("google") === true) {
        HelpersProvider.me.enableMapsLocation = true;
      } else {
        await this.reloadGoogleplaces(true);
      }

    }
    catch (e) {
      console.error(e);
      await this.reloadGoogleplaces(true);
    }

  }

  public setLanguage(lang: string) {
    let t = this;
    this.zone.run(function () {
      t.translate.use(lang).subscribe(function () {/*console.log();*/ }, console.error);
    });
  }

  public getWords(key: string | string[]): Promise<any> {
    return this.translate.get(key).toPromise();
  }

  public setLenguagueLocal() {
    /*let lang = this.translate.getBrowserLang();
    this.setLanguage(lang);*/
  }

  //Para devolver la position de ejemplo para pruebas
  public static Position() {
    return { lat: HelpersProvider.lat, lng: HelpersProvider.lng };
  }

  //devuelve true si se esta en la plataforma ios o android
  public static Platform(): boolean {
    let t = new Platform();
    return t.is("android") || t.is("ios");
  }

  //para convertir url base 64 a blob
  public dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/jpg'
    });
  }

  //convertir un blob un tipo de archivo para escritura
  public blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  //convertir una image a base 64 url
  public fileToBase64(file): Promise<string> {
    return new Promise(function (resolve, reject) {

      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };

    });
  }

  //usa el endpoint del server para volver mas liviana una imagen
  public PerformanceImage(base64: string): Promise<string> {
    let t = this;
    return new Promise(async function (resolve, reject) {
      let response: any;
      try {
        response = await t.http.post("/performance", {
          data: base64
        }, { responseType: "text" }).toPromise();
        //response.filename = interceptor.url+ response.filename;
        //response.filename = response.filename;
        resolve(response);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  //Para tomar un url de imagen y convertirlo a base 64
  public urlTobase64(url): Promise<string> {
    let t = this;
    return new Promise(function (resolve, reject) {

      var reader = new FileReader();
      let link = url.replace(interceptor.url, "");

      console.log(link, reader);

      let header = new HttpHeaders();
      header.append('Content-Type', 'image/jpeg');

      t.http.get(link, { responseType: 'blob' }).toPromise().then(function (image: any) {
        console.log(image);
        reader.readAsDataURL(image);
        reader.onload = function () {
          console.log(reader);
          resolve(reader.result);
        };
        reader.onerror = function (error) {
          reject(error);
        };
      })
        .catch(function (err) {
          reject(err);
        });


    });
  }

  //Para abrir la camera desde cualquier component
  public Camera(parameters: { width?, height?, quality?, resolve?, reject?}, resize?: boolean): Promise<string> {
    var t = this;
    let params: any = {};
    params.width = parameters.width || 300;
    params.height = parameters.height || 300;
    params.quality = parameters.quality || 100;
    params.resize = resize || null;

    return new Promise(async function (resolve, reject) {

      params.resolve = resolve;
      params.reject = reject;

      if (!t.platform.is("cordova")) {
        return t.pickFileBrowser(async function (dataUrl) {
          params.image = dataUrl;
          await t.app.getActiveNavs()[0].push(ImageViewPage, params);
        }, reject);
      }

      t.diagnostic.isCameraAuthorized().then(async (authorized) => {
        if (authorized) {
          await t.app.getActiveNavs()[0].push(CameraPage, params);
        } else {
          t.diagnostic.requestCameraAuthorization().then(async (status) => {
            if (status == t.diagnostic.permissionStatus.GRANTED) {
              await t.app.getActiveNavs()[0].push(CameraPage, params);
            } else {
              reject({ message: "permiss denied" });
            }
          });
        }
      })
    });
  }

  private pickFileBrowser(resolve, reject) {

    try {

      let pick = document.createElement("input");
      pick.setAttribute("type", "file");

      document.body.appendChild(pick);

      let handleFile = function (e: any) {

        var files = e.target.files, f = files[0];
        var reader = new FileReader();

        reader.onload = function (e) {

          let target: any = e.target;
          let data = target.result;
          resolve(data);
          document.body.removeChild(pick);
        };

        reader.readAsDataURL(f);
      }

      pick.addEventListener('change', handleFile, false);

      pick.click();
    }
    catch (e) {
      reject(e);
    }

  }

  public async locationToPlaces(value) {
    let response: NativeGeocoderReverseResult;
    try {
      let obj: any = await this.nativeGeocoder.reverseGeocode(value.lat, value.lng);
      console.log(obj);
      response = obj;
    } catch (e) {
      console.error(e);
      response = null;
    }
    return response;
  }

  //Para mostrar un picker native de date time y que se mas rapdio al seleccionar

  // public nativeDatePicker(options?: DatePickerOptions): Promise<Date> {

  //   options = options || {
  //     date: new Date(),
  //     mode: 'date',
  //     androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
  //   };
  //   options.androidTheme = options.androidTheme || this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK;

  //   return this.datePicker.show(options);
  // }
  public nativeDatePicker(): Promise<Date> {

    let options = {
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    return new Promise(function (resolve, reject) {

      myCalendar.onDidDismiss((date: CalendarResult, type: string) => {
        if (date === null) {
          return;
        }console.log(date);
        resolve(date.dateObj);
      })

    })
  }

  //Para validar email
  public validEmail(email: string): boolean {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email);
  }

  //para obtener el tamaño adecuado segun la tamaño del dispositivo
  public getSizeImage(): { text: string, width: number, height: number } {

    let sizes = [
      { text: "@250x200", width: 250, height: 200 },
      { text: "@450x350", width: 450, height: 350 },
      { text: "@700x600", width: 700, height: 600 }
    ];

    let width = window.innerWidth;

    if (sizes[0].width <= width && width < sizes[1].width) {

      return sizes[0];
    } else if (sizes[1].width <= width && width < sizes[2].width) {

      return sizes[1];
    }

    return sizes[2]


  }

  public getLoadingStandar(present?: boolean): Loading {
    let load = this.loading.create({
      spinner: 'hide', content: `
    <img src="./assets/imgs/balls.gif">
    ` });
    if (present === undefined)
      present = true;
    console.log(present);
    if (present === true) {
      load.present({ disableApp: true });
    }

    return load;

  }

  public async pickerDateTime(doceHoras: boolean): Promise<any> {
    let time = this.modalCtrl.create(DateTimePickerComponent, { doceHoras })
    time.present();
    return new Promise(function (resolve, reject) {
      time.onDidDismiss(function (date) {
        if (date !== undefined)
          resolve(date);
        else
          reject("not hour");
      })
    });

  }

  public async toPages(root: any, pages: Array<{ page: any, data: any }>, data?) {
    data = data || {};
    let nav = this.app.getActiveNavs()[0];
    await nav.setRoot(root, data);
    for (let page of pages) {
      await nav.push(page.page, page.data);
    }
  }

  public async presentAlertStandar(acept: Function, cancel?: Function, concatMessage?: string) {

    cancel = cancel || new Function();
    concatMessage = concatMessage || "";
    if (concatMessage !== "") {
      concatMessage += ", ";
    }
    let si = await this.getWords("YES"), no = await this.getWords("NO"),
      msg = await this.getWords("MESSAGEALERT");
    let alert = this.alertCtrl.create({
      title: concatMessage + msg,
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

  public async presentAlertErrorStandar() {
    let msgUnrer = await this.getWords("ERRORUNEX");
    this.alertCtrl.create({
      title: "Error",
      message: msgUnrer,
      buttons: ["Ok"]
    }).present();
  }

  public getDeviceInfo(): {
    uuid: string,
    model: string,
    platform: string,
    versionOS: string
  } {
    let data;
    if (this.platform.is("cordova")) {
      data = {
        uuid: this.device.uuid,
        model: this.device.model,
        platform: this.device.platform,
        versionOS: this.device.version
      };
    } else {
      data = {
        uuid: "zxy6352",
        model: "Navigator",
        platform: "N",
        versionOS: "3.0.1"
      };
    }

    return data;
  }

  public async setGeofences(radius: number, events?: any) {
    try {

      if (MyApp.User.role.name === "Manager") {
        if (this.platform.is("android")) {
          await this.geofence.removeAll();
          return;
        } else if (this.platform.is("ios")) {
          await this.backgroundGeolocation.stop();
          return;
        }
      }

      if (this.platform.is("ios")) {
        await this.setGeofencesForIOS();
        return;
      }else if (this.platform.is("android")) {
        //Se usa el metodo en ios para los jugadores
        //cercanos a un evento que puedan jugar
        await this.setGeofencesForIOS();
      }

      events = events || false;
      await this.geofence.initialize();
      let es: any = await this.geofence.getWatched();

      if (Object.prototype.toString.call(es) === "[object String]") {
        es = JSON.parse(es);
        console.log(es);
      }

      if (events === false)
        events = await this.http.get("/event/team/upcoming/" + moment().format("MM-DD-YYYY-hh:mm") + "/" + MyApp.User.team).toPromise();

      let hayUnoNuevo = false;
      for (let event of events) {
        let index = es.findIndex(function (it) {
          let idEvent = it.id.split(".")[1];
          return idEvent === event.id;
        });
        if (index === -1) {
          hayUnoNuevo = true;
          break;
        }
      }
      console.log("hay uno nuevo", hayUnoNuevo);
      if (hayUnoNuevo === false)
        return;


      events = await this.parserEvents(events);

      await this.setGeofencesForAndroid(events, radius);

    }
    catch (e) {
      console.error(e);
    }
  }

  //#region Para obtener los eventos de geofences
  private async parserEvents(events) {

    let user = MyApp.User, th = this;
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
  //#endregion

  //#region geofences for android
  public async setGeofencesForAndroid(events: Array<any>, radius: number) {
    try {

      //Eliminar los anteriores geofence
      await this.geofence.removeAll();

      let cercaMsg = await this.getWords("NEARTO");
      let index = 0;
      for (let event of events) {
        await this.addGeofenceForAndroid(event, cercaMsg, index, radius);
        index += 1;
      }

    }
    catch (e) {
      console.error(e);
    }
  }


  private async addGeofenceForAndroid(event: any, cerca, index: number, radius: number) {

    /***
     * Para obtener mi position
     */
    let origin: any
    if (event.location.hasOwnProperty("lng") && event.location.hasOwnProperty("lat"))
      origin = { lat: event.location.lat, lng: event.location.lng };
    else {

      //cargamos google maps si a un no ha cargado
      if (HelpersProvider.me.enableMapsLocation === false)
        await HelpersProvider.me.reloadGoogleplaces();

      await new Promise(function (resolve) {
        let geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: event.location.address }, function (res, status) {

          if (res.length === 0) return;

          res = res[0];
          if (res.geometry) {
            let lat = res.geometry.location.lat();
            let lng = res.geometry.location.lng();
            origin = { lat, lng };
          }
          resolve();
        }.bind(this));
      }.bind(this));
    }

    let typeMsg = await this.getWords("NEWEVENT.TYPES." + event.type.toUpperCase());

    //Para obtener la fecha que inicia el evento
    let date: moment.Moment;
    if (event.repeatsDaily === true) {
      date = moment(event.Time, "hh:mm a");
    } else {
      date = moment(event.parsedDateTime[0] + "/" + event.parsedDateTime[1], "MMMM/DD")
    }

    //options describing geofence
    let id = MyApp.User.id;
    id += "." + event.id + "." + MyApp.User.team + "." + date.format("MM-DD-YYYY-hh:mm:ssa");
    let fence = {
      id, //any unique ID
      latitude: origin.lat, //center of geofence radius
      longitude: origin.lng,
      radius, //radius to edge of geofence in meters
      transitionType: 1, //see 'Transition Types' below
      notification: { //notification settings
        id: index, //any unique ID
        title: event.name, //notification title
        text: cerca + " " + typeMsg + " " + event.name, //notification body
        openAppOnClick: true //open app when notification is tapped
      }
    }

    console.log(fence);

    this.geofence.addOrUpdate(fence).then(
      () => console.log('Geofence added'),
      (err) => console.log('Geofence failed to add')
    );

    this.geofence.onNotificationClicked().subscribe(function (data) {
      console.log("notification", data);
    });

    this.geofence.onTransitionReceived().subscribe(function (data) {
      console.log("transition", data);
    });
  }
  //#endregion


  //#region geofences for ios
  private async setGeofencesForIOS() {
    try {
      const config: BackgroundGeolocationConfig = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 20,
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        url: interceptor.transformUrl("/geofence"),
        httpHeaders: {
          "platform-ios": "true",  //esto se usa para identificar el tipo de geofence, en android se envia ig
          "id": MyApp.User.id+ "."+ MyApp.User.team
        }
      };

      this.executeBackgroudGeolocation(config);

    }
    catch (e) {
      console.error(e);
    }
  }

  public executeBackgroudGeolocation(config: BackgroundGeolocationConfig) {
    
    config.debug = true;

    this.backgroundGeolocation.configure(config)
      .subscribe(function (location: BackgroundGeolocationResponse) {

        console.log("location background", location);

        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        this.backgroundGeolocation.finish(); // FOR IOS ONLY

      }.bind(this));

    // start recording location
    this.backgroundGeolocation.start();
  }

  public async executeGeofencesIOS(myPosition) {
    let events: Array<any> = await this.storage.get("geofences");
    if (Object.prototype.toString.call(events) !== '[object Array]') {
      return;
    }

    let rad: { radius: number } = await this.storage.get("radius");
    for (let event of events) {
      let distance = this.getDistanceBetweenPoints(event.origin, myPosition);
      console.log(distance);
      if (distance <= rad.radius) {
        let headers = new HttpHeaders();
        headers = headers.append("dateTime", moment().toISOString());
        await this.http.post("/geofence", [event], { headers, responseType: "text" }).toPromise();
      }
    }

  }

  private getDistanceBetweenPoints(coord1, coord2) {

    let earthRadius = {
      miles: 3958.8,
      km: 6371,
      meters: 6371071.03
    };

    let R = earthRadius['meters'];
    let lat1 = coord1.lat;
    let lon1 = coord1.lng;
    let lat2 = coord2.lat;
    let lon2 = coord2.lng;

    let dLat = this.toRad((lat2 - lat1));
    let dLon = this.toRad((lon2 - lon1));
    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;

    if (isNaN(d)) {
      return 0
    } else {
      return Number(d.toFixed(2));

    }

  }

  private toRad(x) {
    return x * Math.PI / 180;
  }

  //#endregion

}
