import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { AsignPaymentPage } from '../asign-payment/asign-payment';
import { AsingpaymentComponent } from '../../components/asingpayment/asingpayment';
import { HelpersProvider } from '../../providers/helpers/helpers';


@IonicPage()
@Component({
  selector: 'page-list-players-payment',
  templateUrl: 'list-players-payment.html',
})
export class ListPlayersPaymentPage {

  public user:any={};
  public players:Array<any>=[];
  public multi=false;
  private down=false;

  private playersSelects:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public loading: LoadingController, public http: HttpClient,
    public modelCtrl: ModalController, public zone: NgZone,
    private helper: HelpersProvider
  ) {

  }


  async ionViewWillEnter() {

    let load = this.helper.getLoadingStandar();

    this.user = MyApp.User;
    try{
      
    let players:any = await this.http.get("/players/team/"+ this.user.team).toPromise();

    this.players = players;
    
    this.players = this.players.filter(function(item){
      return item.user !== undefined;
    });

    this.players = await Promise.all(this.players.map(async function(item){

        item.payments = await this.http.get("/player/payment/"+ item.user.id+ "/"+ item.team).toPromise();
        item.select = false;
        item.loadImage = false;
        let ramdon = new Date().getTime();
        item.image = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ item.user.id);
        item.debe = this.calcDebe(item);

        return item;
      }.bind(this)));
    }
    catch(e){
      console.error(e);
    }
    console.log(this.players);
    load.dismiss();

  }


  public success(event, player){
    player.loadImage = true;
  }

  public viewPlayer(member){
    this.navCtrl.push(AsignPaymentPage, {
      player : member
    });
  }

  public multiSelect(){
    console.log("enter", this.multi);
    this.multi = !this.multi;
    console.log(this.multi);
  }

  public pressed(member){

    //let multi = JSON.parse( JSON.stringify({ m : this.multi }) ).m;
    this.down = true;

    setTimeout(function(){

      if( this.down === false && this.multi === false ){
        this.viewPlayer(member);
      
      }else if( this.down === false && this.multi === true ){
        
        member.select = !member.select;
        if( member.select === true ){
          this.playersSelects.push(member);
        }else{
          let index = this.playersSelects.findIndex(function(it){ return it.id === member.id; });
          //console.log(index, this.playersSelects);
          if( index !== -1 ){
            
            if( this.playersSelects.length === 1 )
              this.playersSelects = [];
            else
              this.playersSelects.splice(index, 1);
          }
        }
        
      }else{
        this.multi = !this.multi;
        
        if( this.multi === false ){
          this.players = this.players.map(function(item){
            item.select = false;
            return item;
          });
          this.playersSelects=[];
        }else{
          member.select = true;
          this.playersSelects.push(member);
        }

      }

    }.bind(this), 500);
  }

  public active(){
    console.log("active "+ new Date().getTime());
  }

  public deactive(){
    this.down = false;
  }

  public multiPayment(){
    
    this.navCtrl.push(AsingpaymentComponent, {
      players : this.playersSelects
    });

    this.playersSelects=[];

  }

  private calcDebe(player){
    
    if( !player.hasOwnProperty("payments") ){
      return 0;
    }

    let suma = 0;
    for(var pay of player.payments){
      if( !pay.hasOwnProperty("invoice_paid") )
        suma += Number(pay.quantity);
    }

    return suma;
  }

  public selectAll(){

    this.playersSelects = [];
    this.players = this.players.map(function(item){
      this.playersSelects.push(item);
      item.select = true;
      return item;
    }.bind(this));

    console.log(this.players);

  }

}
