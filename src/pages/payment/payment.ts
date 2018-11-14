import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {

  public static __name = "PaymentPAge"


  public payment: any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private iab: InAppBrowser
  ) {

    this.payment = this.navParams.get("payment");
    console.log(this.payment);
  }


  public async pay() {

    let wind: InAppBrowserObject;
    if (this.payment.existsProperty("invoice") && this.payment.invoice.existsProperty("metadata") &&
      this.payment.invoice.metadata.existsProperty("payer_view_url")
    ) {
      wind = this.iab.create(this.payment.invoice.metadata.payer_view_url);
    } else
      wind = this.iab.create("https://www.sandbox.paypal.com/");
    wind.show();
  }

  public async load(refresher) {

    let ts: any = await this.http.get("/player/payment/" + MyApp.User.id + "/" + MyApp.User.team).toPromise();
    let index = ts.findIndex(function (it) { return it.id === this.payment.id }.bind(this));
    this.payment = ts[index];

    refresher.complete();
  }

}
