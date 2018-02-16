import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the EventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event',
  templateUrl: 'event.html',
})
export class EventPage {

  public user:any;
  public event:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = this.navParams.get("event");
    this.user = this.navParams.data.user;
    
    if( !this.event.location[0].link.includes("http") ){
      this.event.link = "http://"+ this.event.location[0].link;
    }else
      this.event.link = this.event.location[0].link 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventPage');
  }

}
