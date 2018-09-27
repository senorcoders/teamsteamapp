import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-search-team',
  templateUrl: 'search-team.html',
})
export class SearchTeamPage {

  public static __name = "SearchTeamPage"


  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchTeamPage');
  }

}
