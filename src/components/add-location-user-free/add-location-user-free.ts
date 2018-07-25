import { Component } from '@angular/core';
import { ViewController, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { HelpersProvider } from '../../providers/helpers/helpers';
import * as moment from 'moment';

declare var google: any;
@Component({
  selector: 'add-location-user-free',
  templateUrl: 'add-location-user-free.html'
})
export class AddLocationUserFreeComponent {

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

  constructor(public viewCtrl: ViewController, public geolocation: Geolocation,
    public alertCtrl: AlertController
  ) {
    this.timeEnd.subtract(1, "hours");
  }

  async ionViewDidLoad() {

    /***
     * Para mostrar la position actual
     */
    let resp: any;
    resp = await (this.geolocation as any).getCurrentPosition();
    console.log("location", resp);
    let origin = { lat: resp.coords.latitude, lng: resp.coords.longitude };

    let mapOptions: any = {
      center: origin,
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
      position: origin,
      map: this.map,
      icon: image
    });

    this.map.addListener('click', function (event) {
      // 3 seconds after the center of the map has changed, pan back to the
      // marker.
      let image = {
        url: './assets/imgs/icon-marker.png',
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

      mar.setPosition(event.latLng);
      
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
      this.level === ""
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

    let location = {
      positions: this.positions,
      sport: this.sport,
      level: this.level
    };

    this.viewCtrl.dismiss(location);
  }

}
