import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { PaymentPage } from '../payment/payment';
import { HelpersProvider } from '../../providers/helpers/helpers';


@IonicPage()
@Component({
  selector: 'page-view-payments-player',
  templateUrl: 'view-payments-player.html',
})
export class ViewPaymentsPlayerPage {

  public static __name = "ViewPaymentsPlayer"


  public payments:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private helper: HelpersProvider
  ) {
  }

  async ionViewDidEnter(){
    let load = this.helper.getLoadingStandar();

    let ts:any = await this.http.get("/player/payment/"+ MyApp.User.id+ "/"+ MyApp.User.team).toPromise();
    this.payments = ts;
    console.log(this.payments);
    
    load.dismiss();
  }

  public goPayment(payment){ 
    this.navCtrl.push(PaymentPage, { payment });
  }

}
