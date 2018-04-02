import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';


@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  /*transform(value: string, ...args) {
    let segundos = Math.abs(moment().diff(moment(value), 'seconds')), //obtiene el tiempo en segundos
    parsedTime = '', 
    minutes = Math.abs(moment().diff(moment(value), 'minutes')),
    hours = Math.abs(moment().diff(moment(value), 'hours')),
    days = Math.abs(moment().diff(moment(value), 'days')),
    weeks = Math.abs(moment().diff(moment(value), 'weeks')),
    months = Math.abs(moment().diff(moment(value), 'months')),
    years = Math.abs(moment().diff(moment(value), 'years'));

    console.log(segundos, minutes, hours, days);

    if( segundos <= 60 ){
        return "Just Now";

    }else if( minutes == 1 ){
        parsedTime = minutes+ " Minute";

    }else if( minutes > 1 && minutes < 60 ){
        parsedTime = minutes+ " Minutes";

    }else if( hours >= 1 && hours < 24){

      if( hours == 1 ){
        parsedTime = hours+ " Hour";
      }else{
        parsedTime = hours+ " Hours";
      }

    }else if( days > 1 && days < 7 ){
      
      if(days == 1){
        parsedTime = days+ " Day";
      }else{
        parsedTime = days+ " Days";
      }
      
    }else if( weeks > 1 && months < 1 ){
      
      if(weeks == 1){
        parsedTime = weeks+ " Week";
      }else{
        parsedTime = weeks+ " Weeks";
      }
      
    }else if( months > 1 && months < 12 ){
      
      if(days == 1){
        parsedTime = months+ " Month";
      }else{
        parsedTime = months+ " Months";
      }
      
    }else if( years > 1 ){
      
      if(days == 1){
        parsedTime = years+ " Year";
      }else{
        parsedTime = years+ " Years";
      }
      
    }

    return parsedTime+ " Ago";
  }*/

  transform(value: string, ...args){
    return distanceInWordsToNow(new Date(value), {addSuffix: true});
  }
}
