import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { ViewProfilePage } from '../view-profile/view-profile';


@IonicPage()
@Component({
  selector: 'page-data-general-invoice',
  templateUrl: 'data-general-invoice.html',
})
export class DataGeneralInvoicePage {

  public merchant_info={
    "email": "",
    "first_name": "",
    "last_name": "",
    "business_name": ""
  };
  public phone={
    "country_code": "001",
    "national_number": "5032141716"
  };
  public address= {
    "line1": "",
    "city": "",
    "state": "",
    "postal_code": "",
    "country_code": ""
  };

  private manager:any={};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helpers: HelpersProvider, public alertCtrl: AlertController,
    public http: HttpClient
  ) {
    this.manager = this.navParams.get("manager");
  }

  public async saveOrUpdate(){
    console.log(this.validFields());
    if( this.validFields() === false ){
      let emptyFields = await this.helpers.getWords("INVADDATA");
      this.alertCtrl.create({ title: "Error", message: emptyFields, buttons: ["Ok"] })
      .present();
      return;
    }


    let generalDataInvoice:any = {
      merchant_info : this.merchant_info
    };
    generalDataInvoice.merchant_info.phone = this.phone;
    generalDataInvoice.merchant_info.address = this.address;

    try{

      this.manager = await this.http.put("/managers/"+ this.manager.id, { generalDataInvoice }).toPromise() as any;
      console.log(this.manager);
      this.navCtrl.pop();
    }
    catch(e){
      console.error(e);
    }

  }

  public validFields():Boolean{

    let valid = true;

    for(let t of Object.keys(this.merchant_info)){
      
      if(this.merchant_info[t] === "" ){
        valid = false;
      }
    }

    for(let t of Object.keys(this.phone)){
      
      if(this.phone[t] === "" ){
        valid = false;
      }
    }

    for(let t of Object.keys(this.address)){
      
      if(this.address[t] === "" ){
        valid = false;
      }
    }

    if( valid === true ){
      if( this.helpers.validEmail(this.merchant_info.email) === false ){
        valid = false;
      }
    }

    return valid;
  }

  public goProfile(){
    this.navCtrl.setRoot(ViewProfilePage);
  }

}
