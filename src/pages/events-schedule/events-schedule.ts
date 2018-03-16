import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, ViewController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { EventPage } from '../event/event';
import { NewEventPage } from '../new-event/new-event';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { CameraPage } from '../camera/camera';
import { HelpersProvider } from '../../providers/helpers/helpers';

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

  public by:string="past";

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public auth: AuthServiceProvider,
    public http: HttpClient,
    public alertCtrl: AlertController, public helper:HelpersProvider,
    public popoverCtrl: PopoverController, public zone: NgZone
  ) {
    MyApp.initNotifcations();
  }

  async ngOnInit(){
    await this.getEvents();
  }

  private async getEvents(){

    try{
      this.user = await this.auth.User();
      if( this.user.role.name != "Manager"){
        this.addEventButton.nativeElement.style.display = "none";
      }

      this.team = this.user.team;
      console.log("/event/team/"+ this.by+ "/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team);
      let events:any= await this.http.get("/event/team/"+ this.by+ "/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team).toPromise();
      
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
    catch(e){
      console.error(e);
    }
  }

  public goEvent(event:any){
    this.navCtrl.push(EventPage, {
      event,
      user : this.user
    })
  }

  public async addEvent(){
    this.navCtrl.push(NewEventPage, {
      team : this.team
    });
  }

  public successImage(e){
    e.element.removeAttribute("hidden");
  }

  public byS(b){
    let t =this;
    this.zone.run(function(){
      t.by = b;
      t.getEvents();
    })
  }

}
