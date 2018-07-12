import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { AssistenceComponent } from '../assistence/assistence';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { HelpersProvider } from '../../providers/helpers/helpers';


@Component({
  selector: 'assistences',
  templateUrl: 'assistences.html'
})
export class AssistencesComponent {

  public event: any;
  public user = MyApp.User;
  public assistences = [];
  private daily = false;
  public now = false;
  public assistenceNow: any;

  constructor(public viewCtrl: ViewController, public modalCtrl: ModalController,
    public navParams: NavParams, public http: HttpClient
  ) {
    this.event = this.navParams.get("event");
    this.daily = this.event.repeatsDaily;

    let time: moment.Moment;
    if (this.daily === true) {
      time = moment(this.event.Time, "hh:mm a");

    } else {
      time = moment(this.event.dateTime, "MM/DD/YYYY hh:mm a");
    }

    let now = moment(),
      dateTimeEnd = moment();

    //Si el evento tiene hora fin, se asigna, 
    //si no se asigna un tiempo de diferencia de 12 horas
    if (this.event.hasOwnProperty("dateTimeEnd")) {
      dateTimeEnd = moment(this.event.dateTimeEnd);
    } else {
      dateTimeEnd.add(12, "hours");
    }

    //Para verificar si la hora actual esta entra los rangos
    if (now.isBetween(time, dateTimeEnd)) {
      this.now = true;
    }

    console.log(this.daily, this.now);
  }

  async ionViewWillEnter() {
    let load = HelpersProvider.me.getLoadingStandar();
    this.assistences = await this.http.get("/assistence/" + this.event.id).toPromise() as any;
    this.assistences = this.assistences.map(function (it) {
      it.dateTime = moment(it.dateTime).toDate();
      return it;
    });


    load.dismissAll();
  }

  public toAssistenceNow() {
    let time = moment(this.event.Time, "hh:mm a"), dateTimeEnd = moment();

    //Si el evento tiene hora fin, se asigna, 
    //si no se asigna un tiempo de diferencia de 12 horas
    if (this.event.hasOwnProperty("dateTimeEnd")) {
      dateTimeEnd = moment(this.event.dateTimeEnd);
    } else {
      dateTimeEnd.add(12, "hours");
    }


    this.assistenceNow = this.assistences.find(function (it) {
      it.dateTime = moment(it.dateTime);
      return it.dateTime.isBetween(time, dateTimeEnd);
    });

    if (this.assistenceNow !== undefined) {
      this.modalCtrl.create(AssistenceComponent, { repeats: true, event: this.event, assistence: this.assistenceNow })
        .present();
    } else {
      this.modalCtrl.create(AssistenceComponent, { repeats: true, event: this.event })
        .present();
    }

  }

  public toAssitence(assistence) {
    this.modalCtrl.create(AssistenceComponent, { repeats: true, event: this.event, assistence })
      .present();
  }

  public addSheetAtendence() {
    this.modalCtrl.create(AssistenceComponent, { repeats: true, event: this.event })
      .present();
  }

}
