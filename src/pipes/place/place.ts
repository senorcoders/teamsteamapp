import { Pipe, PipeTransform } from '@angular/core';
import { NativeGeocoder, 
  NativeGeocoderReverseResult, 
  NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

@Pipe({
  name: 'place',
})
export class PlacePipe implements PipeTransform {

  //Para obtener el geolocation name apartir de ILatLng
  constructor(public nativeGeocoder:NativeGeocoder){}
  async transform(value: any, ...args) {
    let response:string;
    try{
      let obj:NativeGeocoderReverseResult = await this.nativeGeocoder.reverseGeocode(value.lat, value.lng);
      console.log(obj);
      response = obj.locality;
    }catch(e){
      console.error(e);
      response = "";
    }
    return response;
  }
}
