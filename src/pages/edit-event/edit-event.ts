import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading, ModalController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
 } from '@ionic-native/google-maps';

import moment from 'moment'; 
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { EventPage } from '../event/event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { GoogleMapsComponent } from '../../components/google-maps/google-maps';



@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage {
  private team:string;

  public event:any;
  public eventOriginal:any;
  private updateEvent:boolean=false;

  public callbackUpdate:Function;

  public location:any={
    position : { lat: 51.5033640, lng : -0.12762500 },
    place : {
      placesubAdministrativeArea:"",
      thoroughfare:""
    },
    change: false
  };

  map: GoogleMap;
  load:Loading;
  markerEvent:Marker;
  markerEventOld:Marker;
  public image:boolean=false;
  public imageSrc:string="";

  //var for inputs location
  public locationLink:string;
  public locationDetail:string;

  //var for inputs event
  public name:string="";
  public shortLabel:string;
  public repeats:string="no-repeat";
  public repeatsOption:string="monday";
  public date:string="";
  public time:string="";
  public attendeceTracking:boolean=false;
  public notifyTeam:boolean=false;
  public optionalInfo:string="";
  public description:string="";

  //for max date and min date asing in date time picker
  public minDate:string;
  public maxDate:string;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private googleMaps: GoogleMaps, public geolocation: Geolocation,
    public alertCtrl: AlertController, public loading: LoadingController, 
    private auth: AuthServiceProvider, private http: HttpClient,
    private helper: HelpersProvider, public modalCtrl: ModalController
  ) {
    this.event = this.navParams.get("event");
    //for remove reference
    this.eventOriginal = JSON.parse( JSON.stringify(this.navParams.get("event")) );
    
    console.log(this.event);
    this.locationLink = this.event.location[0].link;
    this.locationDetail = this.event.location[0].detail;

    this.location.position.lat = this.event.location[0].lat;
    this.location.position.lng = this.event.location[0].lng;
    

    this.name = this.event.name;
    this.shortLabel = this.event.shortLabel || "";
    this.repeats = this.event.repeats;
    this.repeatsOption = this.event.repeatsOption || "";
    this.date = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("DD MMM YYYY");
    this.time = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("HH:mm");
    this.attendeceTracking = this.event.attendeceTracking;
    this.notifyTeam = this.event.notifyTeam;
    this.optionalInfo = this.event.optionalInfo;
    this.description = this.event.description;
    this.team = this.event.team;
    this.imageSrc =  this.event.imageSrc;

  
     this.maxDate = moment().add(2, "year",).format("YYYY");
     this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");
     this.minDate, this.maxDate
  }

  async ionViewDidLoad(){
    let places = await this.helper.locationToPlaces(this.location.position);
    this.location.place = places[0];
  }

  public setDate(){
    this.helper.nativeDatePicker({ date : new Date(), mode: 'date' })
    .then(date=>{
      this.date = moment(date).format("DD MMM YYYY");
    })
  }

  public setTime(){
    this.helper.nativeDatePicker({ date : new Date(), mode: 'time' })
    .then(date=>{
      this.time = moment(date).format("HH:mm");
    })
  }

  public loadPlace(){
    let modal = this.modalCtrl.create(GoogleMapsComponent);
    let t = this;
    modal.onDidDismiss(async function(data:any){
      if(data){
        t.location.position = data;
        let places = await t.helper.locationToPlaces(t.location.position);
        t.location.place = places[0];
        t.location.change = true;
      }
    });
    modal.present();
  }

  //#region for change photo
  public success(){
    this.image = true;
  }

  public changePhoto(){
    let t = this;

    this.helper.Camera({ width : 200, height: 200, quality: 50 }).then((result)=>{
      let base64Image = result;
      this.imageSrc = base64Image;
      document.getElementById("imgT").setAttribute("src", base64Image);
      this.image = true;
    })
    .catch((err)=>{
      console.error(err);
    });

  }

  ionViewWillUnload(){
    if( this.updateEvent === false ){
      this.navCtrl.push(EventPage, {
        event: this.eventOriginal,
        user: this.auth.User()
      });
    }
  }

  public async update(){


    this.load = this.loading.create({ content: "Updating..." });
    this.load.present({ disableApp: true });

    //create el object fo send to location event
    let location:any = this.location.position;
    location.link = this.locationLink || "";
    location.detail = this.locationDetail || "";

    console.log(location);

    //Check if the fields required is ok
    let inputsRequired = ["name", "time"], valid = true;
    for(let name of inputsRequired){
      if( this[name] == "" ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: name.toUpperCase()+ " Is Required",
          buttons: ["Ok"]
        }).present();
        valid = false;
        break;
      }
    }
    
    if( valid === false ){
      return;
    }

    if( this.imageSrc == '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: "Image Is Required",
          buttons: ["Ok"]
        }).present();
        return;
    }

    let event:any = {
      team: this.team,
      name : this.name,
      shortLabel : this.shortLabel,
      attendeceTracking: this.attendeceTracking,
      notifyTeam: this.notifyTeam,
      optionalInfo : this.optionalInfo,
      description: this.description,
      user: this.auth.User().id,
      repeats: this.repeats
    };

    //Para chekear como se guardara la fecha de los eventos
    if( this.repeats == "weekly" ){
      event.repeatsOption = this.repeatsOption;
      event.dateTime = moment(moment().format("YYYY/MM/DD")+ " "+ this.time, "YYYY/MM/DD HH:mm").toISOString();
    }else if( this.repeats == 'no-repeat' ){

      if( this.date == '' ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message:"Date Is Required",
          buttons: ["Ok"]
        }).present();

        return;
      }

      event.dateTime =  moment(this.date+ " "+ this.time, "DD MMM YYYY HH:mm").toISOString();
    }else{
      event.dateTime = moment().format("YYYY/MM/DD")+ " "+this.time;
    }

    valid = true;
    let updateEvent:any, updateLocation:any;
    try{
      updateEvent = await this.http.put("/event/"+ this.event.id, event).toPromise();
      updateLocation = await this.http.put("/locationevent/"+ this.event.location[0].id, location).toPromise();
      console.log(updateEvent, updateLocation);
      
      if( this.image === true )
        await this.http.post("/images/events", { id : this.event.id, image : this.imageSrc }).toPromise();

    }
    catch(e){
      console.error(e);
      valid = false;
    }
    
    if( valid === false ){
      this.load.dismiss();
      this.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.load.dismiss();

    let parsedEvent = JSON.parse( JSON.stringify(updateEvent) );
    parsedEvent.location = [updateLocation];
    console.log(parsedEvent);

    this.updateEvent = true;
    let t = this;
    
    this.navCtrl.setRoot(EventsSchedulePage, {}, {animation: "wp-transition"}, function(){
      t.navCtrl.push(EventPage, {event: parsedEvent, user: t.auth.User() });
    });
    
  }

}
