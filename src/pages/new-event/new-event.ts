import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
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

  map: GoogleMap;
  load:Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private googleMaps: GoogleMaps, public geolocation: Geolocation,
    public loading: LoadingController
  ) {
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
    

  }

  loadMap(lat, lot) {

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
            title: 'Ionic',
            icon: 'blue',
            animation: 'DROP',
            position: {
              lat: 43.0741904,
              lng: -89.3809802
            }
          })
          .then(marker => {
            marker.on(GoogleMapsEvent.MARKER_CLICK)
              .subscribe(() => {
                alert('clicked');
              });
          });

      });
  }

}
