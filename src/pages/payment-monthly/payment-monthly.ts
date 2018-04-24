import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-payment-monthly',
  templateUrl: 'payment-monthly.html',
})
export class PaymentMonthlyPage {

  public paids:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient
  ) {
  }

  async ionViewDidLoad() {
    this.paids = await this.http.get(`/payments-monthly/${moment().toISOString()}/${MyApp.User.team}`).toPromise() as any;
    console.log(this.paids);
  }

}
