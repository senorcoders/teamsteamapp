import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { Geolocation } from '@ionic-native/geolocation';
import { AddLocationUserFreeComponent } from '../../components/add-location-user-free/add-location-user-free';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-places-player-free',
  templateUrl: 'places-player-free.html',
})
export class PlacesPlayerFreePage {

  public static __name = "PlacesPlayerFreePage"


  public places = [];
  public myPosition: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public modalCtrl: ModalController,
    public geolocation: Geolocation
  ) {
  }

  async ionViewDidLoad() {
    let places: Array<any> = await this.http.get("/places/freeagent/" + MyApp.User.id).toPromise() as any;
    this.places = places.map(it => {
      it.markers = it.markers.map(mark => {
        return { lng: mark.coordinates[0], lat: mark.coordinates[1] };
      })

      return it;
    });
    console.log(this.places);
  }
  public async addLocation() {
    /***
     * Para mostrar la position actual
     */
    if (this.myPosition === null || this.myPosition === undefined) {
      let load = HelpersProvider.me.getLoadingStandar();
      let resp: any;
      resp = await (this.geolocation as any).getCurrentPosition();
      console.log("location", resp);
      this.myPosition = { lat: resp.coords.latitude, lng: resp.coords.longitude };
      load.dismissAll();
    }

    let addLocation = this.modalCtrl.create(AddLocationUserFreeComponent, { origin: this.myPosition });
    addLocation.onDidDismiss(async function (data) {
      if (data) {
        data.user = MyApp.User.id;
        let location = await this.http.post("/places", data).toPromise();
        location.markers = location.markers.map(it => {
          return { lng: it.coordinates[0], lat: it.coordinates[1] };
        });
        this.places.push(location);
      }
    }.bind(this))
    addLocation.present();
  }

  public async editLocation(loc, index) {

    if (this.myPosition === null || this.myPosition === undefined) {
      let load = HelpersProvider.me.getLoadingStandar();
      let resp: any;
      resp = await (this.geolocation as any).getCurrentPosition();
      console.log("location", resp);
      this.myPosition = { lat: resp.coords.latitude, lng: resp.coords.longitude };
      load.dismissAll();
    }

    let addLocation = this.modalCtrl.create(AddLocationUserFreeComponent, { loc, origin: this.myPosition });
    addLocation.onDidDismiss(async function (data) {
      if (data) {
        data.user = MyApp.User.id;
        let location = await this.http.put("/places", data).toPromise();
        location.markers = location.markers.map(it => {
          return { lng: it.coordinates[0], lat: it.coordinates[1] };
        });
        this.places[index] = location;
      }
    }.bind(this))
    addLocation.present();
  }

  public async removeLocation(loc, index) {
    let msgRemove = await HelpersProvider.me.getWords("PLACES.DELETE");
    let sport = await HelpersProvider.me.getWords("SPORTS."+loc.sport.toUpperCase());
    let level = await HelpersProvider.me.getWords("LEVEL."+loc.level.toUpperCase());

    HelpersProvider.me.presentAlertStandar(async function () {
      await this.http.delete("/places/" + loc.id, { responseType: "text" }).toPromise();
      if (this.places.length === 1) {
        this.places = [];
      } else if (this.places.length > 1) {
        this.places.splice(index, 1);
      }
    }.bind(this), function () {

    }, `${msgRemove} ${sport} ${level}`);
  }

}
