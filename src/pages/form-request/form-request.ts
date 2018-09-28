import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-form-request',
  templateUrl: 'form-request.html',
})
export class FormRequestPage {

  public static __name = "FormRequestPage"

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FormRequestPage');
  }

}
