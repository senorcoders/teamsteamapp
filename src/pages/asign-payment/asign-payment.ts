import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AsingpaymentComponent } from '../../components/asingpayment/asingpayment';


@IonicPage()
@Component({
  selector: 'page-asign-payment',
  templateUrl: 'asign-payment.html',
})
export class AsignPaymentPage {

  public static __name = "AsignPaymentPage"

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
      player : this.player,
      modal: true
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


  public async delete(pay){

    let m = await this.helper.getWords("PAYMENTSECURE");
    this.alertCtrl.create({
      message: m+ " "+ pay.description,
      buttons: [
        { text: "Cancel" },
        { text: "Ok", handler: function(){
          this.deletePayment(pay);
        }.bind(this) }
      ]
    })
    .present();

  }

  private async deletePayment(pay){
    
    let load = this.helper.getLoadingStandar();
    try{

      await this.http.delete("/paymentuser/"+ pay.id).toPromise();

      let index = this.player.payments.findIndex(function(it){ return it.id === pay.id; });
      if( this.player.payments.length === 1 ){
        this.player.payments = [];
      }else if(index !== -1 ){
        this.player.payments.splice(index, 1);
      }

      load.dismiss();

    }
    catch(e){
      load.dismiss();
      console.error(e);
      let unexM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexM, buttons: ["Ok"]})
      .present();
    }

  }

  
}
