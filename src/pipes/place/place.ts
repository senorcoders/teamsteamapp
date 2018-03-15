import { Pipe, PipeTransform } from '@angular/core';
import { NativeGeocoder, 
  NativeGeocoderReverseResult, 
  NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

/**
 * Generated class for the PlacePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'place',
})
export class PlacePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
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
