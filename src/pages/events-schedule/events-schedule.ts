import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { EventPage } from '../event/event';
import { NewEventPage } from '../new-event/new-event';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ImageLoaderConfig, ImageLoader } from 'ionic-image-loader';
import { MyApp } from '../../app/app.component';
import { CameraPage } from '../camera/camera';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * Generated class for the EventsSchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-events-schedule',
  templateUrl: 'events-schedule.html',
})
export class EventsSchedulePage {

  @ViewChild("addEventButton") addEventButton: ElementRef;
  public user:any= {
    role : {
      name: ""
    }
  };

  public team:any;

  public events:Array<any>=[];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth: AuthServiceProvider,
    public http: HttpClient,
    public alertCtrl: AlertController, private imageLoaderConfig: ImageLoaderConfig,
    private imageLoader: ImageLoader, public helper:HelpersProvider
  ) {
    MyApp.initNotifcations();
  }

  async ngOnInit(){
    this.user = await this.auth.User();
    
    if( this.user.role.name != "Manager"){
      this.addEventButton.nativeElement.style.display = "none";
    }
    
    let url;
    if( this.user.role.name === "Player"){
      url = "/team/player/"+ this.user.id;
    }else if( this.user.role.name === "Manager" ){
      url = "/team/manager/"+ this.user.id;
    }else if( this.user.role.name === "Family" ){
      url = "/team/family/"+ this.user.id;
    }
    
    var res = await this.http.get(url).toPromise();

    this.team = res;

    let events:any;

    if( this.team.hasOwnProperty('team') ){
      events = await this.http.get("/event/team/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team.team).toPromise();
    }else if( Object.prototype.toString.call(this.team) === '[object Array]'){
      events = await this.http.get("/event/team/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team[0].team).toPromise();
    }
    console.log(events);
    this.events = events;

    //preformarting for events
    this.events = await Promise.all(this.events.map(async function(it, index){
      
      it.showDateTime = true;
      it.parsedDateTime = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("Do MMMM YYYY hh:mm");
      
      if( it.repeat == 'daily' ){
        it.showDateTime = false;
      }
      
      it.dateTime = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("MM/DD/YYYY hh:mm");
      it.loadImage = false;
      let ramdon = new Date().getTime();
      it.imageSrc = interceptor.url+ '/images/'+ ramdon+ '/events/'+ it.id;
      console.log(it.imageSrc);
      return it;
    }));

    //for sort events
    this.events = this.events.sort(function(a, b){
      if( a.repeats == 'daily'){
        return 1;

      }else if( b.repeats == 'daily' ){
        return -1;

      }else if( a.repeats == "weekly" && b.repeats == 'no-repeat' ){
        let d1 = moment().day(a.repeatsOption), d2 = moment(b.dateTime, "MM/DD/YYYY hh:mm");
        if (d1.isBefore(d2)) {            // a comes first
          return 1
        } else if (d1.isAfter(d2)) {     // b comes first
            return -1
        } else {                // equal, so order is irrelevant
            return 0            // note: sort is not necessarily stable in JS
        }

      }else if( a.repeats == "no-repeat" && b.repeats == 'weekly' ){
        let d1 = moment(a.dateTime, "MM/DD/YYYY hh:mm"), d2 = moment().days(b.repeatsOption);
        if (d1.isBefore(d2)) {            // a comes first
          return 1
        } else if (d1.isAfter(d2)) {     // b comes first
            return -1
        } else {                // equal, so order is irrelevant
            return 0            // note: sort is not necessarily stable in JS
        }
        
      }else if( a.repeats == "weekly" && b.repeats == 'daily' ){
        let d1 = moment().day(a.repeatsOption), d2 = moment();
        if (d1.isBefore(d2)) {            // a comes first
          return 1
        } else if (d1.isAfter(d2)) {     // b comes first
            return -1
        } else {                // equal, so order is irrelevant
            return 0            // note: sort is not necessarily stable in JS
        }
        
      }else if( a.repeats == "daily" && b.repeats == 'weekly' ){
        let d1 = moment(), d2 = moment().day(b.repeatsOption);
        if (d1.isBefore(d2)) {            // a comes first
          return 1
        } else if (d1.isAfter(d2)) {     // b comes first
            return -1
        } else {                // equal, so order is irrelevant
            return 0            // note: sort is not necessarily stable in JS
        }
        
      }

      let d1 = moment(a.dateTime, "MM/DD/YYYY hh:mm"), d2 = moment(b.dateTime, "MM/DD/YYYY hh:mm");
      if (d1.isBefore(d2)) {            // a comes first
        return 1
      } else if (d1.isAfter(d2)) {     // b comes first
          return -1
      } else {                // equal, so order is irrelevant
          return 0            // note: sort is not necessarily stable in JS
      }

    });

    this.events = this.events.reverse();
  }

  public goEvent(event:any){
    this.navCtrl.push(EventPage, {
      event,
      user : this.user
    })
  }

  public async addEvent(){
    let r = await this.helper.Camera({ width: 500, height: 500 });
    console.log(r);
    //this.helper.cameraPreview.show();
    /*this.navCtrl.push(NewEventPage, {
      team : this.team
    });*/
  }

  public successImage(e){
    e.element.removeAttribute("hidden");
  }

}
