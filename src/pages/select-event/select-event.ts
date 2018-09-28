import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';

@IonicPage()
@Component({
  selector: 'page-select-event',
  templateUrl: 'select-event.html',
})
export class SelectEventPage {

  public static __name = "SelectEventPage"


  public filtro = "";
  public events = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public view: ViewController
  ) {
  }


  public async search() {
    if (this.filtro === "") {
      return this.events = [];
    }

    try {
      this.events = await this.http.get(`/event?where={"team":"${MyApp.User.team}","name":{"contains":"${this.filtro}"}}`).toPromise() as any[];
      this.events = this.events.map(it => {
        it.imgSrc = interceptor.transformUrl('/images/ramdon/events/' + it.id + "-thumbnail");
        it.loadImage = false;
        return it;
      });
    }
    catch (e) {
      console.error(e);
      this.events = [];
    }
  }

  public loadImage(e) {
    e.loadImage = true;
  }

  public selectEvent(e) {
    this.view.dismiss(e);
  }

}
