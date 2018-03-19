import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, ViewController, ModalController } from 'ionic-angular';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import { EventPage } from '../event/event';
import { NewEventPage } from '../new-event/new-event';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { CameraPage } from '../camera/camera';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { ViewTrakingComponent } from '../../components/view-traking/view-traking';

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
    public http: HttpClient, public modalCtrl: ModalController,
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
      let user = this.user;

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
        let likesUp=0, likeUp=false, likesDown = 0, likeDown = false;
        for(var t of it.likes){
          if( t.like === true ){
            likesUp +=1;
            if( t.user === user.id){
              likeUp = true;
            }
          }else{
            likesDown +=1;
            if( t.user === user.id){
              likeDown = true;
            }
          }
        }
        it.likesUp = likesUp;
        it.likesDown = likesDown;
        it.likeUp = likeUp;
        it.likeDown = likeDown;
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

  public async like(event, likeUp){
    
    //si no ha dado like en ninguno
    if( event.likeUp === false && event.likeDown === false){
      let like:any = { user : this.user.id, event : event.id, dateTime : moment().toISOString() };
      if( likeUp === true ){
        like.like = true
      }else{
        like.like = false;
      }

      let li = await this.http.post("/likes/", like).toPromise();
      //console.log(li);
      event.likeUp = likeUp;
      event.likeDown = !likeUp;
      event.likes.push(li);
      await this.countLikes(event);
      return;
    }

    //Para cuando ya se ha dado click en cualquiera de los botones
    let idUser = this.user.id;
    let index = event.likes.findIndex(function(elem){ return elem.user === idUser });
    let like = event.likes[index];

    //console.log(like);

    if(event.likeUp === true && likeUp === true){
      let li = await this.http.delete("/likes/"+ like.id).toPromise();
      event.likeUp = false;
      if( event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);
      //console.log(event.likes);
      await this.countLikes(event);
      return;

    }else if(event.likeDown === true && likeUp === false ){
      let li = await this.http.delete("/likes/"+ like.id).toPromise();
      event.likeDown = false;
      if( event.likes.length === 1)
        event.likes = [];
      else
        event.likes.splice(index, 1);

      //console.log(event.likes);
      await this.countLikes(event);
      return;
    }
    
    if(event.likeUp === false && likeUp === true && event.likeDown === true){
      let li = await this.http.put("/likes/"+ like.id, like).toPromise();
      //console.log(li);
      event.likeDown = false;
      event.likeUp = true;
      event.likes[index].like = likeUp;
      await this.countLikes(event);
      
    }else if(event.likeUp === true && likeUp === false && event.likeDown === false){
      let li = await this.http.put("/likes/"+ like.id, like).toPromise();
      //console.log(li);
      event.likeDown = true;
      event.likeUp = false;
      event.likes[index].like = likeUp;
      await this.countLikes(event);
    }

  }

  private async countLikes(event):Promise<Object>{
    let user = this.user;
    return new Promise(function(resolve, reject){
      let likesUp=0, likesDown = 0;
        for(var t of event.likes){
          if( t.like === true ){
            likesUp +=1;
          }else{
            likesDown +=1;
          }
        }
        event.likesUp = likesUp;
        event.likesDown = likesDown;
        resolve(true);
    });
  }

  public async viewTraking(){
    let view = this.modalCtrl.create(ViewTrakingComponent, { event : event });
    view.present();
    console.log(view);
  }

}
