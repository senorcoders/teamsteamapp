import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';


@Component({
  selector: 'asingpayment',
  templateUrl: 'asingpayment.html'
})
export class AsingpaymentComponent {

  public players:Array<any>=[];
  public player:any={ user: { firstName: "", lastName: "", email: "" } };
  public multi=false;
  public imageSrc="";
  public image=false;

  //formulario para asignar pagos
  public name="";
  public description="";
  public quantity=0.0;
  public modal=false;

  constructor(public viewCtrl: ViewController, public alertCtrl: AlertController,
    public http: HttpClient, public navParams: NavParams, 
    public helper: HelpersProvider
  ) {

    if( this.navParams.get("modal") !== undefined ){
      this.modal = true;
    }

    if( this.navParams.get("player") !== undefined ){
      this.player = this.navParams.get("player");
      this.imageSrc = this.player.image;
    }else{
      this.players = this.navParams.get("players");
      this.multi = true;
    }

  }

  public async asingPayment(){

    if(
      this.description === "" || 
      this.quantity === 0
    ){
      let emptM = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: "Error", message: emptM, buttons: ["Ok"] })
      .present();
      return;
    }
     let payment = { description: this.description, quantity : Number(this.quantity),
      team: MyApp.User.team, manager: MyApp.User.id
    };

    let load = this.helper.getLoadingStandar();

     if( this.multi === true )
      await this.asingPaymentMore(payment);
    else
      await this.asingPaymentOne(payment);

    load.dismiss();
  }

  public successPlayer(event, player){
    player.loadImage = true;
  }

  public async asingPaymentOne(payment){

    payment.player = this.player.id;
    try{
      let pay = await this.http.post("/player/payment/"+ MyApp.User.id+ "/"+ MyApp.User.team, payment).toPromise();
      console.log(pay);

      this.viewCtrl.dismiss(pay);
    }
    catch(e){
      let unex = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unex, buttons: ["Ok"]})
      .present();
      console.error(e);
    }

  }

  public async asingPaymentMore(payment){

    try{

     for(let player of this.players){

      payment.player = player.id;
      let pay = await this.http.post("/player/payment/"+ MyApp.User.id+ "/"+ MyApp.User.team, payment).toPromise();
      console.log(pay);

     }

     this.viewCtrl.dismiss();

    }
    catch(e){
      let unex = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unex, buttons: ["Ok"]})
      .present();
      console.error(e);
    }
  }

}
