import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
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
import { ImageLoader } from 'ionic-image-loader';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * Generated class for the EditEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage {
  private team:string;

  public event:any;

  public callbackUpdate:Function;

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
    private camera: Camera, private auth: AuthServiceProvider,
    private http: HttpClient, private imageLoader: ImageLoader,
    private helper: HelpersProvider
  ) {
    this.event = this.navParams.get("event");
    //this.callbackUpdate = this.navParams.get("updateEvent");

    console.log(this.event);
    this.locationLink = this.event.location[0].link;
    this.locationDetail = this.event.location[0].detail;

    this.name = this.event.name;
    this.shortLabel = this.event.shortLabel || "";
    this.repeats = this.event.repeats;
    this.repeatsOption = this.event.repeatsOption || "";
    this.date = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("MM/DD/YYYY");
    this.time = moment(this.event.dateTime, "MM/DD/YYYY HH:mm").format("HH:mm");
    this.attendeceTracking = this.event.attendeceTracking;
    this.notifyTeam = this.event.notifyTeam;
    this.optionalInfo = this.event.optionalInfo;
    this.description = this.event.description;
    this.team = this.event.team;
    this.imageSrc =  this.event.imageSrc;

    this.load = this.loading.create({
      content: "Loading Map"
    });

    this.load.present({ disableApp : true });

    if( HelpersProvider.Platform() ){
      this.loadMap(this.event.location[0].lat, this.event.location[0].lng);
    }else{
      this.loadMap(HelpersProvider.lat, HelpersProvider.lng);
    }
  
     this.maxDate = moment().add(2, "year",).format("YYYY");
     this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");
     this.minDate, this.maxDate
  }

  loadMap(lat, lot) {
    console.log(lat, lot);
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: lat,
          lng: lot
        },
        zoom: 18,
        tilt: 30
      }
    };

    let t = this;
    this.map = GoogleMaps.create('map_canvas2', mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        t.load.dismissAll();

        this.map.setMyLocationEnabled(true);

        //for when click in map
        this.map.addEventListener(GoogleMapsEvent.MAP_LONG_CLICK).subscribe(
            (data) => {

              let options ={ target: data[0],
              zoom: 18,
              tilt: 30
            }
              this.map.moveCamera(options);
              this.map.addMarker({
                title: 'New Position',
                icon: 'blue',
                animation: 'DROP',
                position: data[0]
              })
              .then(marker => {
                console.log(this);
                if( this.markerEvent !== null && this.markerEvent !== undefined ){
                  this.markerEvent.remove();
                }

                marker.on(GoogleMapsEvent.MARKER_CLICK)
                  .subscribe(() => {
                  });
                this.markerEvent = marker;
              });
            }
        );

        // Now you can use all methods safely.
        this.map.addMarker({
            title: 'Position of Event',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: lat,
              lng: lot
            }
          })
          .then(marker => {
            this.markerEventOld = marker;
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
              });
          });

      });
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

  public async update(){

    this.load = this.loading.create({ content: "Updating..." });
    this.load.present({ disableApp: true });

    //create el object fo send to location event
    let location:any
    if( this.markerEvent === undefined || this.markerEvent === null ){
      location = this.markerEventOld.getPosition();
    }else{
      location = this.markerEvent.getPosition();
    }
     
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

    if( this.repeats == "weekly" ){
      event.repeatsOption = this.repeatsOption;
      event.dateTime = moment().format("YYYY/MM/DD")+ " "+this.time;
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

      event.dateTime = this.date+ " "+ this.time;
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

    let t = this;
    
    //for await three seconds that clean cache
    new Promise(function(resolve, reject){
      setTimeout(resolve(), 3000);
    }).then(function(){

      t.navCtrl.pop();
        t.navCtrl.setRoot(EventsSchedulePage).then(function(){
          t.navCtrl.push(EventPage, {
            event : parsedEvent,
            user : t.auth.User()
          })
        });
    })
    
    

  }

}
