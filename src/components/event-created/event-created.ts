import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { EventsSchedulePage } from '../../pages/events-schedule/events-schedule';

@Component({
  selector: 'event-created',
  templateUrl: 'event-created.html'
})
export class EventCreatedComponent {

  public event:any={};

  constructor(public navParams: NavParams, public statusBar: StatusBar,
    public navCtrl: NavController
  ) {
    this.event = this.navParams.get("event");
  }

  ionViewDidLoad(){
    this.statusBar.backgroundColorByHexString("#fe324d");
  }

  ionViewWillLeave(){
    this.statusBar.backgroundColorByName("white");
  }

  public leave(){
    this.navCtrl.setRoot(EventsSchedulePage);
  }

}
