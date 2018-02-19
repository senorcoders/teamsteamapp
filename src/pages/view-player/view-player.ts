import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ViewPlayerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-player',
  templateUrl: 'view-player.html',
})
export class ViewPlayerPage {

  public player:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.player = this.navParams.get("player");
  }

  ionViewDidLoad() {
  }

}
