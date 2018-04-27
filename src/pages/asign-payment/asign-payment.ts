import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { AsingpaymentComponent } from '../../components/asingpayment/asingpayment';


@IonicPage()
@Component({
  selector: 'page-asign-payment',
  templateUrl: 'asign-payment.html',
})
export class AsignPaymentPage {

  public player:any={ user: { firstName: "", lastName: "", email: "" } };
  public imageSrc="";
  public image=false;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, public alertCtrl: AlertController,
    public http: HttpClient, private modalCtrl: ModalController
  ) {

    this.player = this.navParams.get("player");
    this.imageSrc = this.player.image;

  }

  public success(){
    this.image = true;
  }

  public assingPayment(){
    let payments = this.modalCtrl.create(AsingpaymentComponent, {
      player : this.player
    });

    payments.onDidDismiss(function(data){

      if( data === undefined || data === null )
        return;

      if( !this.player.hasOwnProperty("payments") ){
        this.player.payments = [data];
      }else{
        this.player.payments.push(data);
      }

    }.bind(this));

    payments.present();

  }

  /*public async checkPassForDelete(id){
    
    let currentM = await this.helper.getWords("CHANGEPASSALERT.CURRENT"), 
    newPassM = await this.helper.getWords("CHANGEPASSALERT.NEWPASS"),
    newPassMAgain = await this.helper.getWords("CHANGEPASSALERT.AGAINNEWPASS"),
    cancelM = await this.helper.getWords("CANCEL"),
    passM = await this.helper.getWords("PASSWORD");


    let c = this.alertCtrl.create({ title: passM, inputs: [
        { type: "password", name: "current", placeholder: currentM  },
        { type: "password", name: "newPass", placeholder: newPassM },
        { type: "password", name: "passAgain", placeholder: newPassMAgain },
      ], buttons: [
        { text: cancelM },
        {text: "Ok", handler: function(data){ this.deletePayment(data, id) }.bind(this) }
      ] });

    c.present();
    
  }

  private checkPass(data){
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){

      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        t.load.dismiss();
        t.alertCtrl.create({
          title: "Error",
          message: "Passwords do not match",
          buttons: ["Ok"]
        }).present();

      }else{

        console.log("success");
        t.deletePlayer();

      }
    }, function(err){
      
      this.load.dismiss();

      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();

      console.error(err);

    });
  }

  //no se elimina lo que hacemos es actualizar para que no lo muestre
  public deletePayment(){

  }*/


}
