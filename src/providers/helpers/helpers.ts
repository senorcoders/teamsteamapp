import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Platform, Loading, LoadingController, ModalController, AlertController, App } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CameraPage } from '../../pages/camera/camera';
import { DatePicker, DatePickerOptions } from '@ionic-native/date-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimePickerComponent } from '../../components/date-time-picker/date-time-picker';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { CalendarModal, CalendarResult } from 'ion2-calendar';
import { ImageViewPage } from '../../pages/image-view/image-view';
import { MyApp } from '../../app/app.component';
import * as moment from 'moment';
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
    public app: App, public datePicker: DatePicker, private translate: TranslateService,
    private zone: NgZone, private loading: LoadingController,
    private modalCtrl: ModalController, public camera: Camera,
    public platform: Platform, public alertCtrl: AlertController,
    public device: Device, public storage: Storage, public backgroundGeolocation: BackgroundGeolocation
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

      // let script = await this.http.get("https://maps.googleapis.com/maps/api/js?key=AIzaSyAFLgCYDZUvB1CeR3IQDjoIfK-yVkSBm7Q&libraries=places", {
      //   responseType: 'jsonp' as any,
      // }).toPromise();

      // let fn = new Function(script);
      // fn();
      let script = document.createElement("script");
      let key = "AIzaSyAFLgCYDZUvB1CeR3IQDjoIfK-yVkSBm7Q";
      script.setAttribute("src", `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`);
      document.body.appendChild(script);

      setTimeout(async function () {
        if (window.hasOwnProperty("google") === true) {
          HelpersProvider.me.enableMapsLocation = true;
        } else {
          await this.reloadGoogleplaces(true);
        }
      }.bind(this), 500);

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


  //convertir un blob un tipo de archivo para escritura
  public blobToFile = (theBlob: Blob, fileName: string): File => {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
  }

  public base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
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
          params.navigator = true;
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
        console.log(files);
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

  public pickFile(types: string): Promise<File[]> {

    return new Promise(function (resolve, reject) {
      this.pickFileInput(resolve, reject, types);
    }.bind(this));

  }

  private pickFileInput(resolve, reject, types) {
    try {

      let pick = document.createElement("input");
      pick.setAttribute("type", "file");
      pick.setAttribute("accept", types);
      document.body.appendChild(pick);

      let handleFile = function (e: any) {
        var files = e.target.files;
        resolve(files);
        document.body.removeChild(pick);
      }

      pick.addEventListener('change', handleFile, false);

      pick.click();
    }
    catch (e) {
      reject(e);
    }
  }

  public async locationToPlaces(value) {
    let response: any;
    try {
      if (this.enableMapsLocation === false)
        await this.reloadGoogleplaces();

      let geocoder = new google.maps.Geocoder();

      let obj: any = await new Promise(function (resolve) {
        geocoder.geocode({ 'location': { lat: value.lat, lng: value.lng } }, function (results, status) {
          if (status === 'OK') {
            if (results[0]) {
              return resolve(results[0]);
            }
          }

          resolve(null);
        });
      });
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
        } console.log(date);
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
    <img src="./assets/imgs/loader_sports.gif">
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
        await this.backgroundGeolocation.stop();
        return;
      }

      await this.setGeofencesForIOS();

    }
    catch (e) {
      console.error(e);
    }
  }


  //#region geofences for ios
  private async setGeofencesForIOS() {
    try {
      if (await this.backgroundGeolocation.isLocationEnabled() === 0) {
        let required = await this.getWords("REQUIRED"),
          enableSetting = await this.getWords("ENABLEGEOLOCATION");
        this.alertCtrl.create({
          title: required, message: enableSetting,
          buttons: [{
            text: "Ok", handler: function () {
              setTimeout(this.setGeofencesForIOS.bind(this), (30 * 1000));
              this.backgroundGeolocation.showLocationSettings();
            }.bind(this)
          }]
        })
          .present();
      }
      const config: BackgroundGeolocationConfig = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 20,
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        url: interceptor.transformUrl("/geofence"),
        httpHeaders: {
          "id": MyApp.User.id + "." + MyApp.User.team
        }
      };

      this.executeBackgroudGeolocation(config);

    }
    catch (e) {
      console.error(e);
    }
  }

  public executeBackgroudGeolocation(config: BackgroundGeolocationConfig) {

    config.debug = false;

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

  public async stopGeofences() {
    await this.backgroundGeolocation.stop();
  }
  //#endregion

}
