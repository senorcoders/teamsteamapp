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
import { VALID } from '@angular/forms/src/model';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HttpClient } from '@angular/common/http';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
 

/**
 * Generated class for the NewEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-event',
  templateUrl: 'new-event.html',
})
export class NewEventPage {

  private team:any;

  map: GoogleMap;
  load:Loading;
  markerEvent:Marker;
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
    private http: HttpClient
  ) {

    this.team = this.navParams.get("team");
    console.log(this.team);
    this.load = this.loading.create({
      content: "Loading Map"
    });

    this.load.present({ disableApp : true });

    let t = this;
    
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      t.loadMap(resp.coords.latitude, resp.coords.longitude);
     }).catch((error) => {
       console.log('Error getting location', error);
     });
    
     this.maxDate = moment().add(2, "year",).format("YYYY");
     this.minDate = moment().subtract(1, "day").format("YYYY-MM-DD");
     console.log(this.minDate, this.maxDate);
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
    this.map = GoogleMaps.create('map_canvas', mapOptions);

    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        t.load.dismiss();

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
                title: 'Position of Event',
                icon: 'blue',
                animation: 'DROP',
                position: data[0]
              })
              .then(marker => {
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
            title: 'My Position',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: lat,
              lng: lot
            }
          })
          .then(marker => {
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
    const options: CameraOptions = {
      quality: 100,
      sourceType : 0,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    let fnt = this;

    this.alertCtrl.create({ title : "Source", message : "Select a source",
    buttons : [{
      text : "Library",
      handler : function(){
        fnt.getPhoto(options);
      }
    }, {
      text : "Camera",
      handler: function(){
        options.sourceType  = 1;
        fnt.getPhoto(options);
      }
    }] }).present();

  }

  private getPhoto(options:any){
    
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.imageSrc = base64Image;

     }, (err) => {
      console.error(err);
     });
  }


  public async save(){

    this.load = this.loading.create({ content: "Saving..." });
    this.load.present({ disableApp: true });

    if( this.markerEvent === undefined || this.markerEvent === null ){
      this.load.dismiss();
      this.alertCtrl.create({ title: "Required", message: "select a position for event in map", buttons: ["Ok"]})
      .present();
      return;
    }

    //create el object fo send to location event
    let location:any = this.markerEvent.getPosition();
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
      team: this.team.team,
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
    let newEvent:any;
    try{
      newEvent = await this.http.post("/event", {
        event,
        location
      }).toPromise();
      console.log(newEvent);
      
      await this.http.post("/images/events", { id : newEvent.event.id, image : this.imageSrc }).toPromise();
      

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

    this.navCtrl.setRoot(EventsSchedulePage);

  }
  
}
