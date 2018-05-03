import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';


@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {

  public payment:any;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private helper: HelpersProvider
  ) {

    this.payment = this.navParams.get("payment");

  }


  public async pay(){
    let load = this.helper.getLoadingStandar();

    let pay = await this.http.post("/player/pay/", { id : this.payment.id }).toPromise();
    console.log(pay);

    //load.dismiss();
  }

}
