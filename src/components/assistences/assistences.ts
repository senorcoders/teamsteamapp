import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { AssistenceComponent } from '../assistence/assistence';
import { NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';


@Component({
  selector: 'assistences',
  templateUrl: 'assistences.html'
})
export class AssistencesComponent {

  public event:any;
  public user=MyApp.User;

  constructor(public viewCtrl: ViewController, public modalCtrl: ModalController,
    public navParams: NavParams
  ) {
    this.event = this.navParams.get("event");
  }

  public addSheetAtendence(){
    this.modalCtrl.create(AssistenceComponent, {event: this.event})
    .present();
  }

}
