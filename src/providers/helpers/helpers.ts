import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { Diagnostic } from '@ionic-native/diagnostic';
import { CameraPage } from '../../pages/camera/camera';
import {App} from "ionic-angular";

/*
  Generated class for the HelpersProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelpersProvider {
  public static lat:string="51.5033640";
  public static lng:string="-0.12762500";

  constructor(public http: HttpClient, public diagnostic: Diagnostic,
    public app: App
  ) {
    
  }

  public static Position(){
    return { lat : HelpersProvider.lat, lng: HelpersProvider.lng };
  }

  public static Platform():boolean{
    let t = new Platform();
    return t.is("android") || t.is("ios");
  }

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

  public blobToFile = (theBlob: Blob, fileName:string): File => {
      var b: any = theBlob;
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      b.lastModifiedDate = new Date();
      b.name = fileName;

      //Cast to a File() type
      return <File>theBlob;
  }

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

public Camera(parameters):Promise<string>{
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

}
