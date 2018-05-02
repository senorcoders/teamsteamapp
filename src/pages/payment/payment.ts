import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {

  public payment:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {

    this.payment = this.navParams.get("payment");

  }


  public async pay(){
    let pay = await this.http.post("/player/pay/", { id : this.payment.id }).toPromise();
    console.log(pay);
  }

}
