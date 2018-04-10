import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, PopoverController, ViewController, ModalController, Events } from 'ionic-angular';
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
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import {TranslateService} from '@ngx-translate/core';

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

  public by:string="upcoming";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public auth: AuthServiceProvider, private sockets: WebSocketsProvider,
    public http: HttpClient, public modalCtrl: ModalController,
    public alertCtrl: AlertController, public helper:HelpersProvider,
    public popoverCtrl: PopoverController, public zone: NgZone,
    private translate: TranslateService
  ) {
    MyApp.initNotifcations();

    // this language will be used as a fallback when a translation isn't found in the current language
    /*translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');
    this.translate.getTranslation("es").subscribe(function(next){
      console.log(next);
    })

    this.translate.get("EVENTS.TITLE").subscribe(function(next){
      console.log(next);
    });*/

  }

  async ngOnInit(){
    await this.getEvents();
  }

  private async getEvents(){

    try{
      this.user = await this.auth.User();

      this.team = this.user.team;
      let url = "/event/team/"+ this.by+ "/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team;
      console.log(url);
      let events:any= await this.http.get("/event/team/"+ this.by+ "/"+ moment().format("MM-DD-YYYY-hh:mm") + "/"+ this.team).toPromise();

      this.events = await this.parserEvents(events);
      console.log(this.events);
      let user = this.user;

      //this.events = this.events.reverse();
    }
    catch(e){
      console.error(e);
    }
  }

  private async parserEvents(events){

    let user = MyApp.User, th = this;
    try{

      //preformarting for events
      events = events.map(function(it, index){
        
        //Para saber si el evento es semanal
        it.weeks = it.repeats === true && it.repeatsDaily === false;

        if( it.weeks === true ){
          let str = th.getDayCercano(it.repeatsDays).format("Do MMMM YYYY hh:mm");
          it.parsedDateTime = str;
        }else{
          it.parsedDateTime = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("Do MMMM YYYY hh:mm");
        }
        
        if( it.repeatsDaily === true ){
          it.Time = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("hh:mm");
        }

        it.dateTime = moment(it.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]").format("MM/DD/YYYY hh:mm");
        it.loadImage = false;
        let ramdon = new Date().getTime();
        it.imageSrc = interceptor.transformUrl('/images/'+ ramdon+ '/events/'+ it.id);

        //Para obtener los likes y comments
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
      });

      //for sort events
      events = events.sort(function(a, b){
        if( a.repeatsDaily == true ){
          return -1;

        }else if( b.repeatsDaily == true ){
          return 1;

        }else if( a.repeats == true && a.repeatsDaily === false && b.repeats == false ){
          let d1 = th.getDayCercano(a.repeatsDays), d2 = moment(b.dateTime, "MM/DD/YYYY hh:mm");
          if (d1.isBefore(d2)) {            // a comes first
            return -1
          } else if (d1.isAfter(d2)) {     // b comes first
              return 1
          } else {                // equal, so order is irrelevant
              return 0            // note: sort is not necessarily stable in JS
          }

        }else if( a.repeats == false && b.repeats == true && b.repeatsDaily == false ){
          let d1 = moment(a.dateTime, "MM/DD/YYYY hh:mm"), d2 = th.getDayCercano(b.repeatsDays);
          if (d1.isBefore(d2)) {            // a comes first
            return -1
          } else if (d1.isAfter(d2)) {     // b comes first
              return 1
          } else {                // equal, so order is irrelevant
              return 0            // note: sort is not necessarily stable in JS
          }
          
        }else if( a.repeats == true && a.repeatsDaily === false && b.repeatsDaily == true ){
          let d1 = th.getDayCercano(a.repeatsDays), d2 = moment();
          if (d1.isBefore(d2)) {            // a comes first
            return 1
          } else if (d1.isAfter(d2)) {     // b comes first
              return -1
          } else {                // equal, so order is irrelevant
              return 0            // note: sort is not necessarily stable in JS
          }
          
        }else if( a.repeatsDaily === true && b.repeats == true && b.repeatsDaily === false ){
          let d1 = moment(), d2 = th.getDayCercano(b.repeatsDays);
          if (d1.isBefore(d2)) {            // a comes first
            return -1
          } else if (d1.isAfter(d2)) {     // b comes first
              return 1
          } else {                // equal, so order is irrelevant
              return 0            // note: sort is not necessarily stable in JS
          }
          
        }

        let d1 = moment(a.dateTime, "MM/DD/YYYY hh:mm"), d2 = moment(b.dateTime, "MM/DD/YYYY hh:mm");
        if (d1.isBefore(d2)) {            // a comes first
          return -1
        } else if (d1.isAfter(d2)) {     // b comes first
            return 1
        } else {                // equal, so order is irrelevant
            return 0            // note: sort is not necessarily stable in JS
        }

      });

    }
    catch(e){
      console.error(e);
    }

    return events;

  }

  //Para cuando los eventos son por semana
  //pueden haber varios dias en la semana que el evento ocurre
  //hay que buscar el evento mas cercano al fecha actual
  private getDayCercano(days:any):any{

    let daysNumber = {
      "m": 1,
      "tu": 2,
      "w": 3,
      "th": 4,
      "f": 5,
      "sa": 6,
      "su": 7
      };
    //console.log(days);
    let daysMoment=[];
    let Days = Object.prototype.toString.call(days) === '[object String]' ? days.split(',') : days;

    if( Days.length === 1 ){
      let newmoment = moment();
      newmoment.day(daysNumber[Days[0]]);
      return newmoment;
    }
    
    for(let day of Days){
      let newmoment = moment();
      newmoment.day(daysNumber[day]);
      daysMoment.push( newmoment );
    }

    let cercanoMoment;
    for(let i=0; i<daysMoment.length; i++){
      if( i === 0 ) cercanoMoment = daysMoment[i];
      else{
        if( cercanoMoment.diff( moment() ) > daysMoment[i].diff(moment()) ){
          cercanoMoment = daysMoment[i];
        }
      } 
    }

    return cercanoMoment;
    
  }

  ionViewWillEnter (){
    
    let t = this;
    //nos subscribimos con push
    this.sockets.subscribeWithPush('event', function(data){
      
      console.log("new event ", event);

      //Para obtener los datos de manera fiel es mejor recargargar la lista de eventos
      //Sobre todo porque hay que iterar sobre ellos para calcular orden y parsear propiedades
      t.zone.run(function(){ t.getEvents(); });
      
    }, function(data){
      console.log("actualizamos el evento", data);
      //Para obtener los datos de manera fiel es mejor recargargar la lista de eventos
      //Sobre todo porque hay que iterar sobre ellos para calcular orden y parsear propiedades
      t.zone.run(function(){ t.getEvents(); });

    }, function(data){
      console.log("eliminamos el evento", data);
      //obtenemos la posicion que tiene en el array para despues eliminarlo
      let index = t.events.findIndex(function(el){ return el.id === data.id });
      if( index !== -1){
        if( this.events.length === 0 )
          this.events = [];
        else{
          this.events.splice(index, 1)
        }

      }
      
    });
  }

  ionViewWillUnload (){
    console.log("unsubscribe");
    this.sockets.unsubscribeWithPush('event');
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

  public async viewTraking(e){
    let view = this.modalCtrl.create(ViewTrakingComponent, { e });
    view.present();
  }

}
