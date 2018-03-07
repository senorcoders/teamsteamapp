import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Generated class for the RelativeTimePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    let minutes = moment().diff(moment(value),'minutes'), parsedTime = '';

    if(minutes < 60 ){

      if( minutes < 1 ){
        return "Just Now";
      }else if( minutes == 1 ){
        parsedTime = minutes+ " Minute";
      }else{
        parsedTime = minutes+ " Minutes";
      }

    }else if( minutes > 60 && minutes < 1440){

      if( minutes < 120 ){
        parsedTime = moment(minutes, "mm").format("HH:mm")+ " Hour";
      }else{
        parsedTime = moment(minutes, "mm").format("HH:mm")+ " Hours";
      }

    }else if( minutes > 1440 ){
      
      if(minutes < (1440*2)){
        parsedTime = minutes+ " Day";
      }else{
        parsedTime = minutes+ " Days";
      }
      
    }

    return parsedTime+ " Ago";
  }
}
