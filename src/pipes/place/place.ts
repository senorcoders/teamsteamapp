import { Pipe, PipeTransform } from '@angular/core';
import { HelpersProvider } from '../../providers/helpers/helpers';

@Pipe({
  name: 'place',
})
export class PlacePipe implements PipeTransform {

  //Para obtener el geolocation name apartir de ILatLng
  constructor(){

  }

  async transform(value: any, ...args) {
    let response:string;
    try{
      let obj:any = await HelpersProvider.me.locationToPlaces(value);
      console.log(obj);
      response = obj.locality;
    }catch(e){
      console.error(e);
      response = "";
    }
    return response;
  }
}
