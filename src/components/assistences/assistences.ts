import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { AssistenceComponent } from '../assistence/assistence';
import { NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';


@Component({
  selector: 'assistences',
  templateUrl: 'assistences.html'
})
export class AssistencesComponent {

  public event:any;
  public user=MyApp.User;
  public assistences=[];

  constructor(public viewCtrl: ViewController, public modalCtrl: ModalController,
    public navParams: NavParams, public http: HttpClient
  ) {
    this.event = this.navParams.get("event");
  }

  async ionViewWillEnter(){
    this.assistences = await this.http.get("/assistence/"+ this.event.id).toPromise() as any;
    this.assistences = this.assistences.map(function(it){
      it.dateTime = moment(it.dateTime).toDate();
      return it;
    });
  }

  public toAssitence(assistence){
    this.modalCtrl.create(AssistenceComponent, {event: this.event, assistence})
    .present();
  }

  public addSheetAtendence(){
    this.modalCtrl.create(AssistenceComponent, {event: this.event})
    .present();
  }

}
