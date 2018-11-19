import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { TabsPage } from '../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-check-paid',
  templateUrl: 'check-paid.html',
})
export class CheckPaidPage {

  public static __name = "ChatPaidPage"

  public moth:any;
  private init=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient, private helper: HelpersProvider, 
  public alertCtrl: AlertController
  ) {

    this.moth = this.navParams.get("month");
    this.init = this.navParams.get("init");

  }

  public async checkPayment(){

    let paid:any = await this.http.get(`/payments-monthly/${moment(this.moth, "MM/YYYY").toISOString()}/${MyApp.User.team}`).toPromise();
    console.log(paid);

    let pay = false;

    for(let p of paid){
      if( p.paid === true ){
        if( this.init === true ){
          this.navCtrl.setRoot(TabsPage);
          // this.navCtrl.setRoot(EventsSchedulePage);
        }else{
          this.navCtrl.pop()
          this.navCtrl.pop()
        }
        pay = true;
        break;
      }
    }

    if( pay === false ){
      let M = await this.helper.getWords("PAYERNOTCOMPLETAD");
      this.alertCtrl.create({ message: M, buttons: ["Ok"] })
      .present();
    }

  }

}
