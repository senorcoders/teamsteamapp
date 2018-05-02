import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { PaymentPage } from '../payment/payment';


@IonicPage()
@Component({
  selector: 'page-view-payments-player',
  templateUrl: 'view-payments-player.html',
})
export class ViewPaymentsPlayerPage {

  public payments:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  async ngOnInit(){
    let ts:any = await this.http.get("/player/payment/"+ MyApp.User.id).toPromise();
    this.payments = ts;
    console.log(this.payments);
  }

  public goPayment(payment){ 
    this.navCtrl.push(PaymentPage, { payment });
  }

}
