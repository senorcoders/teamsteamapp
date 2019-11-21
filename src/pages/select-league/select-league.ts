import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
//import { ViewController } from 'ionic-angular/navigation/view-controller';
import { ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-select-league',
  templateUrl: 'select-league.html',
})
export class SelectLeaguePage {

  public search = "";
  public leagues = [];

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private viewCtrl: ViewController
  ) {
  }

  ionViewDidLoad() {
  }

  public async searchLeague() {
    if (this.search === "") {
      this.leagues = [];
      return;
    }
    try {
      this.leagues = await this.http.get(`/leagues?where={"name":{"includes":"${this.search}"}}`).toPromise() as any[];
    }
    catch (e) {
      this.leagues = [];
      console.error(e);
    }
  }

  public selectLeague(league) {
    this.viewCtrl.dismiss(league);
  }

}
