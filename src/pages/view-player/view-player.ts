import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { interceptor } from '../../providers/auth-service/interceptor';

/**
 * Generated class for the ViewPlayerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-player',
  templateUrl: 'view-player.html',
})
export class ViewPlayerPage {

  public player:any;
  public user:any;

  public image:boolean=false;
  public imageSrc:string="";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.player = this.navParams.get("player");
    this.user = this.navParams.get("user");
    
    if( this.player.positions === undefined ){
      this.player.positions = [];
    }else if( Object.prototype.toString.call(this.player.positions) === '[object String]' ){
      this.player.positions = this.player.positions.split(",");
    }

    let random = new Date().getTime();
    this.imageSrc = interceptor.transformUrl("/images/"+ random+ "/users/"+ this.player.user.id);
    
  }

  ionViewDidLoad() {
  }

  public success(e){
    this.image = true;
  }

}
