import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { MyApp } from '../../app/app.component';
import { PaymentSubscripcionPage } from '../payment-subscripcion/payment-subscripcion';


@IonicPage()
@Component({
  selector: 'page-payment-monthly',
  templateUrl: 'payment-monthly.html',
})
export class PaymentMonthlyPage {

  public paids:Array<any>=[];
  public team:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient
  ) {
  }

  private async calcMonths(){
    this.team = await this.http.get("/teams/"+ MyApp.User.team).toPromise();
    let monthCurrent = moment().format("MM/YYYY"),
    monthInit = moment(this.team.createdAt), month= monthInit.format("MM/YYYY");

    //Para agregar el month en que se empeso a usar
    if( monthCurrent === month )
      this.paids.push({ month : month, paid: false });

    while(monthCurrent != month){
      this.paids.push({ month : month, paid: false });
      monthInit.add(1, "months");
      month= monthInit.format("MM/YYYY");
    }

    console.log(this.paids);

  }

  async ionViewDidLoad() {

    await this.calcMonths();

    let paids:Array<any> = await this.http.get(`/payments-monthly/${moment().toISOString()}/${MyApp.User.team}`).toPromise() as any;
    
    let i=0;
      for(let p of this.paids){

        let index = paids.findIndex((item)=>{ return item.month === p.month && item.paid === true; });

        if( index !== -1 ){
          this.paids[i] = paids[index];
        }

        i += 1;

      }

  }

  public goPayment(paid){
    this.navCtrl.push(PaymentSubscripcionPage, { month: paid.month, try: true });
  }

}
