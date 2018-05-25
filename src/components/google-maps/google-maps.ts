import { Component } from '@angular/core';
import {ViewController, NavParams, Loading, LoadingController, AlertController} from 'ionic-angular';
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

/* component para selecionar la ubicacion en google maps */
@Component({
  selector: 'google-maps',
  templateUrl: 'google-maps.html'
})
export class GoogleMapsComponent {
  public height= window.innerHeight;
  public width= window.innerWidth;

  public map: GoogleMap;
  private load:Loading;
  public markerEvent:Marker;
  
  constructor(public viewCtrl: ViewController, public geolocation: Geolocation,
    public navParams: NavParams, public loading: LoadingController,
    public alertCtrl: AlertController
  ) {
    
    
  }

  ionViewDidEnter(){
    console.log(this.height, this.width);
    this.load = this.loading.create({
      content: "Loading Map"
    });

    this.load.present({ disableApp : true });

    //comprabamos si los parametros de la location fueron enviados sino usamos la posicion actual
    let t = this;
    if( this.navParams.get('location') === null || this.navParams.get('location') === undefined ){
      this.geolocation.getCurrentPosition().then((resp) => {
        t.loadMap(resp.coords.latitude, resp.coords.longitude);
       }).catch((error) => {
         console.log('Error getting location', error);
       });
    }else{
      let lts = this.navParams.get('location');
      this.loadMap(lts.lat, lts.lng);
    }
  }

  ngOnInit(){
    //esto sirve para ocultar todas las paginas y mostra linear layout del plugin
    let style = document.createElement("style");
    style.innerText = String.raw` .ion-page.show-page:not(google-maps) { opacity: 0 !important; } `;
    document.getElementsByTagName('google-maps')[0].appendChild(style);
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
    let m = document.getElementById('map_canvas');
    console.log(m);
    this.map = GoogleMaps.create(m, mapOptions);
    console.log(this.map, GoogleMaps);
    // Wait the MAP_READY before using any methods.
    this.map.one(GoogleMapsEvent.MAP_READY)
      .then(() => {
        console.log('Map is ready!');

        t.load.dismiss();

        this.map.setMyLocationEnabled(true);

        //for when click in map
        this.map.addEventListener(GoogleMapsEvent.MAP_CLICK).subscribe(
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
            title: 'Current Position',
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


  dismiss() {
    this.viewCtrl.dismiss();
  }

  selectd(){
    if( this.markerEvent === null || this.markerEvent === undefined ){
      this.alertCtrl.create({
        title: "Required",
        message: "Select a place",
        buttons: ["Ok"]
      }).present();
      return;
    }
    this.viewCtrl.dismiss(this.markerEvent.getPosition());
  }

}
