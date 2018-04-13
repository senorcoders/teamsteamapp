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
  public type:string;
  public repeats:boolean=false;
  public repeatsDays:Array<any>=[];
  public repeatsDaily:boolean=false;
  public date:string="";
  public time:string="";
  public attendeceTracking:boolean=false;
  public notifyTeam:boolean=false;
  public optionalInfo:string="";
  public description:string="";
  public address='';


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
    this.locationLink = this.event.location.link || "";
    this.locationDetail = this.event.location.detail || "";
    this.address = this.event.location.address || "";
    

    this.name = this.event.name;
    this.type = this.event.type || "";
    this.repeats = this.event.repeats;
    this.repeatsDays = this.event.repeatsDays || [];
    this.repeatsDaily = this.event.repeatsDaily;
    this.date = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("DD MMM YYYY");
    this.time = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("HH:mm");
    this.attendeceTracking = this.event.attendeceTracking;
    this.optionalInfo = this.event.optionalInfo;
    this.description = this.event.description;
    this.team = this.event.team;
    this.imageSrc =  this.event.imageSrc;
  }

  async ionViewDidLoad(){

    if( this.event.location.hasOwnProperty('lat') && this.event.location.hasOwnProperty('lng') ){
      this.location.position.lat = this.event.location.lat;
      this.location.position.lng = this.event.location.lng;
      let places = await this.helper.locationToPlaces(this.location.position);
      if( places !== null)
        this.location.place = places[0];
    }
    
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

  public getSelectDays(key:string){
    return -1 !== this.repeatsDays.findIndex(function(el){ return el === key });
  }

  public showDaysRepeats():boolean{
    return this.repeats === true && this.repeatsDaily === false;
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

  /*
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
      type : this.type,
      attendeceTracking: this.attendeceTracking,
      notifyTeam: this.notifyTeam,
      optionalInfo : this.optionalInfo,
      description: this.description,
      user: this.auth.User().id,
      repeats: this.repeats
    };

    //Para chekear como se guardara la fecha de los eventos
    if( this.repeats == true && this.repeatsDaily == false ){
      event.repeatsDays = this.repeatsDays;
      event.dateTime = moment(moment().format("YYYY/MM/DD")+ " "+ this.time, "YYYY/MM/DD HH:mm").toISOString();
    }else if( this.repeats == false ){

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
    let updateEvent:any;
    try{
      updateEvent = await this.http.put("/event/"+ this.event.id, event).toPromise();
      
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


    this.updateEvent = true;
    let t = this;
    
    this.navCtrl.setRoot(EventsSchedulePage, {}, {animation: "wp-transition"}, function(){
      t.navCtrl.push(EventPage, {event: updateEvent, user: t.auth.User() });
    });
    
  }
  */

  public async update(){

    let content = await this.helper.getWords("UPDATING"); 
    this.load = this.loading.create({ content: content });
    this.load.present({ disableApp: true });

    let requiredM = await this.helper.getWords("REQUIRED"),
    AddressOrMap = await this.helper.getWords("ADDRESSORDATE");

    if( this.location.placesubAdministrativeArea === "" && this.address === '' ){
      this.alertCtrl.create({ title: requiredM, message: AddressOrMap, buttons: ["Ok"] }).present();
      this.load.dismiss();
      return;
    }

    //create el object fo send to location event
    let locate:any;
    if( this.location.placesubAdministrativeArea === "" ){
      locate = {};
    }else{
      locate = this.location.position;
    }

    locate.address = this.address;
    locate.link = this.locationLink || "";
    locate.detail = this.locationDetail || "";
    
    console.log(locate);

    //Check if the fields required is ok
    let isRequired = await this.helper.getWords("ISREQUIRED");
    let nameM = await this.helper.getWords("NAME"),
    timeM = await this.helper.getWords("TIME");

    if( this.name === '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: nameM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();
        
        return;
    }
    
    if( this.time === '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: timeM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();
        
        return;
    }

    /*if( this.imageSrc == '' ){
      this.load.dismiss();
        this.alertCtrl.create({
          title: requiredM,
          message: "Image "+ isRequired,
          buttons: ["Ok"]
        }).present();
        return;
    }*/

    let event:any = {
      team: this.team,
      name : this.name,
      type : this.type,
      attendeceTracking: this.attendeceTracking,
      optionalInfo : this.optionalInfo,
      description: this.description,
      repeats: this.repeats,
      repeatsDaily: this.repeatsDaily,
      repeatsDays: this.repeatsDays.join(","),
      location: locate
    };
    console.log(event);

    //si es por semana entonces hay que chequear que este seleccionado almenos un dia
    let dayM = await this.helper.getWords("DAY");

    if( this.repeatsDaily === false && this.repeats === true ){
      
      if( this.repeatsDays.length === 0 ){
        this.load.dismiss();
        this.alertCtrl.create({ title: requiredM, message: dayM+ " "+ isRequired}).present();
        return;
      }else{
        event.dateTime = moment(moment().format("YYYY/MM/DD")+ " "+ this.time, "YYYY/MM/DD HH:mm").toISOString();
      }

    }else if( this.repeats === false ){

      let dateM = await this.helper.getWords("DATE");
      if( this.date == '' ){
        this.load.dismiss();
        this.alertCtrl.create({
          title: "Required",
          message: dateM+ " "+ isRequired,
          buttons: ["Ok"]
        }).present();

        return;
      }

      event.dateTime = moment(this.date+ " "+ this.time, "DD MMM YYYY HH:mm").toISOString();
    }else{
      event.dateTime = moment().format("YYYY/MM/DD")+ " "+this.time;
    }

    let valid = true;
    let updateEvent:any;
    try{
      
      updateEvent = await this.http.put("/event/"+ this.event.id, event).toPromise();
      
      if( this.image === true )
        await this.http.post("/images/events", { id : this.event.id, image : this.imageSrc }).toPromise();


    }
    catch(e){
      console.error(e);
      valid = false;
    }
    
    let unexp = await this.helper.getWords("ERORUNEXC");
    if( valid === false ){
      this.load.dismiss();
      this.alertCtrl.create({
        title: "Error",
        message: unexp,
        buttons: ["Ok"]
      }).present();
      return;
    }

    let t = this;
    
    this.navCtrl.setRoot(EventsSchedulePage, {}, {animation: "wp-transition"}, function(){
      t.navCtrl.push(EventPage, {event: updateEvent, user: t.auth.User() });
    });

  }


}
