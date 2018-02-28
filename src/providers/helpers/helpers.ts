import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

/*
  Generated class for the HelpersProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelpersProvider {
  public static lat:string="51.5033640";
  public static lng:string="-0.12762500";

  constructor(public http: HttpClient) {
    console.log('Hello HelpersProvider Provider');
  }

  public static Position(){
    return { lat : HelpersProvider.lat, lng: HelpersProvider.lng };
  }

  public static Platform():boolean{
    let t = new Platform();
    return t.is("android") || t.is("ios");
  }

}
