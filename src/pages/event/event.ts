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

  /*public updateEvent = function(ev:any){
    let t = this;
    let promise = new Promise(function(resolve, reject){
      t.event = ev;

    });

  }*/

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private googleMaps: GoogleMaps, public loading: LoadingController,
    private imageLoaderConfig: ImageLoaderConfig
  ) {
    //this.init();
  }

  ngOnInit(){
    this.event = this.navParams.get("event");
    this.user = this.navParams.data.user;
    console.log(this.event);

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

  public editEvent(){
    this.navCtrl.push(EditEventPage, {
      event: this.event/*,
      updateEvent: this.updateEvent*/
    });
  }

}
