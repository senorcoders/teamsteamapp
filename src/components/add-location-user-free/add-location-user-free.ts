import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import * as moment from 'moment';

declare var google: any;
@Component({
  selector: 'add-location-user-free',
  templateUrl: 'add-location-user-free.html'
})
export class AddLocationUserFreeComponent {

  public static __name = "AddLocationUserFreeComponent";

  //Para mostrar el mapa sin usar el plugin
  map: any;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;

  public repeatsDays: Array<string> = [];
  public timeStart: moment.Moment = moment();
  public timeEnd: moment.Moment = moment();
  public positions = "";
  public sport = "";
  public level = "";
  public markers: Array<any> = [];

  public location: any;
  private origin:any;

  constructor(public viewCtrl: ViewController, public alertCtrl: AlertController, 
    public navParams: NavParams
  ) {
    this.timeEnd.subtract(1, "hours");
    this.location = this.navParams.get("loc");
    this.origin = this.navParams.get("origin");
  }

  async ionViewDidLoad() {

    let mapOptions: any = {
      center: this.origin,
      zoom: 12
    };

    this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    this.directionsDisplay.setMap(this.map);

    let image = {
      url: './assets/imgs/icon-marker.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(24, 24),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(0, 8)
    };

    new google.maps.Marker({
      animation: 'DROP',
      position: this.origin,
      map: this.map,
      icon: image
    });

    this.map.addListener('click', function (event) {
      // 3 seconds after the center of the map has changed, pan back to the
      // marker.
      let image = {
        url: './assets/imgs/icon-marker2.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(24, 24),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 8)
      };

      let mar = new google.maps.Marker({
        animation: 'DROP',
        map: this.map,
        icon: image
      });

      mar.addListener("click", function () {
        mar.setMap(null);
        if (this.markers.length === 1) {
          this.markers = [];
        } else {
          let index = this.markers.findIndex(it => it.closure_uid_503952747 === mar.closure_uid_503952747);
          if (index !== -1) {
            this.markers.splice(index, 1);
          }
        }
      }.bind(this));

      mar.setPosition(event.latLng);
      this.markers.push(mar);
    }.bind(this));

    //Para cuando es editar una location
    if (this.location !== undefined) {
      this.agregarData();
    }

  }

  private agregarData() {
    this.repeatsDays = this.location.repeatsDays.split(",");
    this.timeStart = moment(this.location.timeStart);
    this.timeEnd = moment(this.location.timeEnd);
    this.level = this.location.level;
    this.sport = this.location.sport;
    this.positions = this.location.positions;
    for (let mark of this.location.markers) {
      this.agregarLocationForEdit(mark);
    }
  }

  private agregarLocationForEdit(mark) {
    // 3 seconds after the center of the map has changed, pan back to the
    // marker.
    let image = {
      url: './assets/imgs/icon-marker2.png',
      // This marker is 20 pixels wide by 32 pixels high.
      size: new google.maps.Size(24, 24),
      // The origin for this image is (0, 0).
      origin: new google.maps.Point(0, 0),
      // The anchor for this image is the base of the flagpole at (0, 32).
      anchor: new google.maps.Point(0, 8)
    };

    let latLng = new google.maps.LatLng(mark.lat, mark.lng);
    let mar = new google.maps.Marker({
      animation: 'DROP',
      position: latLng,
      map: this.map,
      icon: image
    });
    this.markers.push(mar);

    mar.addListener("click", function () {
      mar.setMap(null);
      if (this.markers.length === 1) {
        this.markers = [];
      } else {
        let index = this.markers.findIndex(it => it.closure_uid_503952747 === mar.closure_uid_503952747);
        if (index !== -1) {
          this.markers.splice(index, 1);
        }
      }
    }.bind(this));
  }

  public async setTimeStart() {
    try {
      let time = await HelpersProvider.me.pickerDateTime(true);
      this.timeStart = moment(time, "hh:mm a");
    }
    catch (e) {
      console.error(e);
    }
  }

  public async setTimeEnd() {
    try {
      let time = await HelpersProvider.me.pickerDateTime(true);
      this.timeEnd = moment(time, "hh:mm a");
    }
    catch (e) {
      console.error(e);
    }
  }

  public getSelectDays(key: string) {
    return -1 !== this.repeatsDays.findIndex(function (el) { return el === key });
  }

  public selectDay(key: string) {

    let index = this.repeatsDays.findIndex(function (el) { return el === key });
    console.log(index, key);
    if (index === -1)
      this.repeatsDays.push(key);
    else {

      if (this.repeatsDays.length === 1)
        this.repeatsDays = [];
      else
        this.repeatsDays.splice(index, 1);

    }

  }

  public async select() {
    if (
      this.sport === "" ||
      this.level === "" ||
      this.positions === ""
    ) {
      let empty = await HelpersProvider.me.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ message: empty, buttons: ["Ok"] })
        .present();
      return;
    }

    if (this.repeatsDays.length === 0) {
      let msgSelectDays = await HelpersProvider.me.getWords("SELECTDAYS");
      this.alertCtrl.create({ message: msgSelectDays, buttons: ["Ok"] })
        .present();
      return;
    }

    if (this.markers.length === 0) {
      let msgSelectMarkers = await HelpersProvider.me.getWords("ADDLOCATION.SELECTLOCATIONS");
      this.alertCtrl.create({ message: msgSelectMarkers, buttons: ["Ok"] })
        .present();
      return;
    }

    let location:any = {
      repeatsDays: this.repeatsDays.join(","),
      positions: this.positions,
      sport: this.sport,
      level: this.level,
      markers: this.markers.map(it => { return { lat: it.position.lat(), lng: it.position.lng() } }),
      timeStart: this.timeStart.toISOString(),
      timeEnd: this.timeEnd.toISOString()
    };
    if (this.location !== undefined) {
      if(this.location.hasOwnProperty("id")){
        location.id = this.location.id;
      }
    }
    

    this.viewCtrl.dismiss(location);
  }

}
