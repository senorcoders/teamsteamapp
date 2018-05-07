import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MyApp } from '../../app/app.component';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { CheckPaidPage } from '../check-paid/check-paid';
import { MyTaskPage } from '../my-task/my-task';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-payment-subscripcion',
  templateUrl: 'payment-subscripcion.html',
})
export class PaymentSubscripcionPage {

  public try = true;
  public month = "";
  public paid:any={ paid: false };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private iab: InAppBrowser
  ) {

    let t = this.navParams.get("try");

    if( t !== undefined && t !== null ){
      this.try = false;
      this.month = this.navParams.get("month");
      this.paid = this.navParams.get("paid");
    }

  }

  public async pay(){
    
    if( this.try === false ){
      await this.payMonth();
    }else{
      await this.payInit();
    }

  }

  private async payMonth(){

    let payer = {
      quantity: 10.45,
      nameSale: "Subscripcion mensual",
      description: "el pago mensual de equipo",
      user: MyApp.User.id,
      team: MyApp.User.team,
      month: this.month
    };

    let p:any = await this.http.post("/payment-team", payer).toPromise();
    let link = p.payment.links[1].href;

    let browser = this.iab.create(link);

    this.navCtrl.push(CheckPaidPage, { month: this.month, init: false });

  }

  private async payInit(){

    let payer = {
      quantity: 10.45,
      nameSale: "Subscripcion mensual",
      description: "el pago mensual de equipo",
      user: MyApp.User.id,
      team: MyApp.User.team,
      month: moment().format("MM/YYYY")
    };

    let p:any = await this.http.post("/payment-team", payer).toPromise();
    let link = p.payment.links[1].href;

    let browser = this.iab.create(link);

    this.navCtrl.setRoot(CheckPaidPage, { month: moment().format("MM/YYYY"), init: true });

  }

  public async demo(){
    this.navCtrl.setRoot(EventsSchedulePage);
  }

}
