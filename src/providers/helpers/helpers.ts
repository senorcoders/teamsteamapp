import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Platform, Loading, LoadingController } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CameraPage } from '../../pages/camera/camera';
import {App} from "ionic-angular";
import { NativeGeocoder, 
  NativeGeocoderReverseResult, 
  NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';
import { DatePicker, DatePickerOptions } from '@ionic-native/date-picker';
import { TranslateService } from '@ngx-translate/core';


/**
 * este servicio contiene funciones generales que son usadas mas de una por las diferentes componentes
 */

@Injectable()
export class HelpersProvider {
  public static lat:string="51.5033640";
  public static lng:string="-0.12762500";

  constructor(public http: HttpClient, public diagnostic: Diagnostic,
    public app: App, public nativeGeocoder:NativeGeocoder,
    public datePicker: DatePicker, private translate: TranslateService,
    private zone:NgZone, private loading: LoadingController
  ) {
    //console.log(this);
  }

  public setLanguage(lang:string){
    let t = this;
    this.zone.run(function(){
      t.translate.use(lang);
    });
  }

  public getWords(key:string):Promise<string>{
    return this.translate.get(key).toPromise();
  }

  public setLenguagueLocal(){
    let lang = this.translate.getBrowserLang();
    this.setLanguage(lang);
  }

  //Para devolver la position de ejemplo para pruebas
  public static Position(){
    return { lat : HelpersProvider.lat, lng: HelpersProvider.lng };
  }

  //devuelve true si se esta en la plataforma ios o android
  public static Platform():boolean{
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
  public blobToFile = (theBlob: Blob, fileName:string): File => {
      var b: any = theBlob;
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      b.lastModifiedDate = new Date();
      b.name = fileName;

      //Cast to a File() type
      return <File>theBlob;
  }

  //convertir una image a base 64 url
  public fileToBase64(file):Promise<string> {
    return new Promise(function(resolve, reject){

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
public PerformanceImage(base64:string):Promise<string>{
  let t = this;
  return new Promise(async function(resolve, reject){
    let response:any;
    try{
      response  = await t.http.post("/performance", {
        data : base64
      }, { responseType: "text" }).toPromise();
      //response.filename = interceptor.url+ response.filename;
      //response.filename = response.filename;
      resolve(response);
    }catch(e){
      console.error(e);
      reject(e);
    }
  });
}

//Para tomar un url de imagen y convertirlo a base 64
public urlTobase64(url):Promise<string> {
  let t = this;
  return new Promise(function(resolve, reject){

    var reader = new FileReader();
    let link = url.replace(interceptor.url, "");

    console.log(link, reader);

    let header = new HttpHeaders();
    header.append('Content-Type','image/jpeg');

    t.http.get(link, { responseType: 'blob' }).toPromise().then(function(image:any){
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
    .catch(function(err){
      reject(err);
    });
    

  });
}

//Para abrir la camera desde cualquier component
public Camera(parameters: {width?, height?, quality?, resolve?, reject?}):Promise<string>{
  var t = this;
  parameters.width = parameters.width || 300;
  parameters.height = parameters.height || 300;
  parameters.quality = parameters.quality || 50;

  return new Promise(async function(resolve, reject){

    parameters.resolve = resolve;
    parameters.reject = reject;

    t.diagnostic.isCameraAuthorized().then(async (authorized) => {
      if(authorized){
        await t.app.getActiveNavs()[0].push(CameraPage, parameters);
      }else {

        t.diagnostic.requestCameraAuthorization().then(async (status) => {
            if(status == t.diagnostic.permissionStatus.GRANTED){
              await t.app.getActiveNavs()[0].push(CameraPage, parameters);
            }else {
              reject({ message : "permiss denied" });
            }
          })

        }
      })
    });
  }



  public async locationToPlaces(value){
  let response:NativeGeocoderReverseResult;
    try{
      let obj:NativeGeocoderReverseResult = await this.nativeGeocoder.reverseGeocode(value.lat, value.lng);
      console.log(obj);
      response = obj;
    }catch(e){
      console.error(e);
      response = null;
    }
    return response;
}

//Para mostrar un picker native de date time y que se mas rapdio al seleccionar

public nativeDatePicker(options?:DatePickerOptions):Promise<Date>{

  options = options || {
    date: new Date(),
    mode: 'datetime',
    androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
  };
  options.androidTheme = options.androidTheme || this.datePicker.ANDROID_THEMES.THEME_HOLO_LIGHT;

  return this.datePicker.show(options);
}

//Para validar email
public validEmail(email:string):boolean{
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email);
}

//para obtener el tamaño adecuado segun la tamaño del dispositivo
public getSizeImage():{text:string, width:number, height:number}{

  let sizes = [ 
    {text : "@250x200", width: 250, height: 200},
    {text : "@450x350", width: 450, height: 350},
    {text: "@700x600", width: 700, height: 600 }
  ];

  let width = window.innerWidth;

  if( sizes[0].width <= width && width < sizes[1].width ){

    return sizes[0];
  }else if( sizes[1].width <= width && width < sizes[2].width ){

    return sizes[1];
  }
  
  return sizes[2]


}

  public getLoadingStandar(present?:boolean):Loading{
    let load = this.loading.create({ spinner: 'show', content: `<img src="./assets/imgs/loading.gif" />` });
    present = present || true;
    if( present === true ){
      load.present({ disableApp: true });
    }

    return load;

  }

}
