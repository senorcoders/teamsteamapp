import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Loading } from 'ionic-angular';
import { ImageLoaderConfig } from 'ionic-image-loader';
import * as moment from 'moment';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker
 } from '@ionic-native/google-maps';
import { EditEventPage } from '../edit-event/edit-event';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { AndroidSystemUiFlags } from '@ionic-native/android-full-screen';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { PhotoViewer, PhotoViewerOptions } from '@ionic-native/photo-viewer';

/**
 * Generated class for the EventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  map: GoogleMap;
  load:Loading;

  public user:any;
  public event:any;

  public location:any={
    position : { lat: 51.5033640, lng : -0.12762500 },
    place : {
      placesubAdministrativeArea:"",
      thoroughfare:""
    },
    change: false
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private googleMaps: GoogleMaps, public loading: LoadingController,
    private imageLoaderConfig: ImageLoaderConfig, public alertCtrl: AlertController,
    private http: HttpClient, public auth: AuthServiceProvider, public helper:HelpersProvider,
    public photoViewer: PhotoViewer
  ) {
    //this.init();
    let e = this.navParams.get("event");
    this.user = MyApp.User;
    if( e.imageSrc === null || e.imageSrc === undefined ){
      let ramdon = new Date().getTime();
      e.imageSrc = interceptor.url+ "/images/"+ ramdon+ "/events/"+ e.id; 
    }

    this.event = e;
  }

  async ngOnInit(){
    
    console.log(this.event);

    //for geoconder location
    this.location.position = { lat: this.event.location[0].lat, lng: this.event.location[0].lng };
    let places = await this.helper.locationToPlaces(this.location.position);
    this.location.place = places[0];
    this.location.change = true;

    if( moment(this.event.dateTime, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true).isValid() ){
      this.event.dateTime = moment(this.event.dateTime, "YYYY-MM-DDTHH:mm:ss").format("MM/DD/YYYY HH:mm");
    }

    if( !this.event.location[0].link.includes("http") ){
      this.event.link = "http://"+ this.event.location[0].link;
    }else
      this.event.link = this.event.location[0].link 

      this.imageLoaderConfig.enableSpinner(true);

      this.load = this.loading.create({
        content: "Loading Map"
      });
      
      this.load.present({ disableApp : true });
      if( HelpersProvider.Platform() ){
        this.loadMap(this.event.location[0].lat, this.event.location[0].lng);
      }else{
        this.loadMap(HelpersProvider.lat, HelpersProvider.lng);
      }
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
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
              });
          });

      });
  }

  public remove(){
    let t = this;
    let alert = this.alertCtrl.create({
      title: 'Confirm Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Go!',
          handler: data => {
            t.checkPassword(data.password);
          }
        }
      ]
    });
    alert.present();
  }

  public checkPassword(password){
    let username = this.auth.User().username;

    this.load = this.loading.create({ content: "Deleting..." });
    this.load.present({ disableApp : true });
    let t = this;
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){

      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        t.load.dismiss();
        t.alertCtrl.create({
          title: "Error",
          message: "Passwords do not match",
          buttons: ["Ok"]
        }).present();

      }else{

        console.log("success");
        t.deleteEvent();

      }
    }, function(err){
      
      this.load.dismiss();

      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();

      console.error(err);

    });
  }

  private async deleteEvent(){
    let t = this, valid:boolean=true;
    try{
      await t.http.delete("/event/"+ t.event.id).toPromise();
      await t.http.delete("/locationevent/"+ t.event.location[0].id).toPromise();
      await t.http.delete("/images/events/"+ t.event.id).toPromise();
    }
    catch(e){
      console.error(e);
      valid = false;
      t.load.dismissAll();
      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
    }

    if( valid === false )
      return;
    
    t.load.dismiss();
    this.navCtrl.setRoot(EventsSchedulePage);
  }

  private async editEvent(){
    let t = this;
    this.navCtrl.pop({animation: "ios-transition"}, function(){
      t.navCtrl.push(EditEventPage, {
        event: t.event
      }, {animation: "ios-transition"});
    })
  }

  public viewPhoto(src:string, name:string){
    console.log(src);
    this.photoViewer.show(src, name, { share: true})
  }

}
