import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Platform, Loading, LoadingController, ModalController, AlertController } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CameraPage } from '../../pages/camera/camera';
import { App } from "ionic-angular";
import {
  NativeGeocoder,
  NativeGeocoderReverseResult
} from '@ionic-native/native-geocoder';
import { DatePicker, DatePickerOptions } from '@ionic-native/date-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimePickerComponent } from '../../components/date-time-picker/date-time-picker';
import { Camera } from '@ionic-native/camera';
import { Page } from 'ionic-angular/navigation/nav-util';
import { Device } from '@ionic-native/device';


/**
 * este servicio contiene funciones generales que son usadas mas de una por las diferentes componentes
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
    public device: Device
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

      let script = await this.http.get("https://maps.googleapis.com/maps/api/js?key=AIzaSyAFLgCYDZUvB1CeR3IQDjoIfK-yVkSBm7Q&libraries=places",{
       responseType: 'text' 
      }).toPromise();
      
      let fn = new Function(script);
      fn();

      if( window.hasOwnProperty("google") === true ){
        HelpersProvider.me.enableMapsLocation = true;
      }else{
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

  public getWords(key: string): Promise<string> {
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
  public Camera(parameters: { width?, height?, quality?, resolve?, reject?}): Promise<string> {
    var t = this;
    parameters.width = parameters.width || 300;
    parameters.height = parameters.height || 300;
    parameters.quality = parameters.quality || 100;

    return new Promise(async function (resolve, reject) {

      parameters.resolve = resolve;
      parameters.reject = reject;

      if (!t.platform.is("cordova")) {
        return t.pickFileBrowser(resolve, reject);
      }

      t.diagnostic.isCameraAuthorized().then(async (authorized) => {
        if (authorized) {
          await t.app.getActiveNavs()[0].push(CameraPage, parameters);
        } else {
          t.diagnostic.requestCameraAuthorization().then(async (status) => {
            if (status == t.diagnostic.permissionStatus.GRANTED) {
              await t.app.getActiveNavs()[0].push(CameraPage, parameters);
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
      let obj: NativeGeocoderReverseResult = await this.nativeGeocoder.reverseGeocode(value.lat, value.lng);
      console.log(obj);
      response = obj;
    } catch (e) {
      console.error(e);
      response = null;
    }
    return response;
  }

  //Para mostrar un picker native de date time y que se mas rapdio al seleccionar

  public nativeDatePicker(options?: DatePickerOptions): Promise<Date> {

    options = options || {
      date: new Date(),
      mode: 'datetime',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    };
    options.androidTheme = options.androidTheme || this.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT;

    return this.datePicker.show(options);
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
    <img src="./assets/imgs/loading.gif">
    ` });
    present = present || true;
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

  public async toPages(root: Page, pages: Array<{ page: Page, data: any }>, data?) {
    data = data || {};
    let nav = this.app.getActiveNavs()[0];
    await nav.setRoot(root, data);
    for (let page of pages) {
      await nav.push(page.page, page.data);
    }
  }

  public async presentAlertStandar(acept: Function, cancel?: Function) {

    cancel = cancel || new Function();
    let si = await this.getWords("YES"), no = await this.getWords("NO"),
      msg = await this.getWords("MESSAGEALERT");
    let alert = this.alertCtrl.create({
      title: msg,
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

  public getDeviceInfo() {
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

}
