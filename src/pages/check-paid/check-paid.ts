import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-check-paid',
  templateUrl: 'check-paid.html',
})
export class CheckPaidPage {


  constructor(public navCtrl: NavController, public navParams: NavParams,
  private http: HttpClient, private helper: HelpersProvider, 
  public alertCtrl: AlertController
  ) {


  }

  public async checkPayment(){

    let paid:any = await this.http.get(`/payments-monthly/${moment().toISOString()}/${MyApp.User.team}`).toPromise();
    console.log(paid);

    let pay = false;

    for(let p of paid){
      if( p.paid === true ){
        this.navCtrl.setRoot(EventsSchedulePage);
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
