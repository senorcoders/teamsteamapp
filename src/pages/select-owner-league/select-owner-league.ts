import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';

@IonicPage()
@Component({
  selector: 'page-select-owner-league',
  templateUrl: 'select-owner-league.html',
})
export class SelectOwnerLeaguePage {

  public search="";
  public user:any;
  public userEnable=false;
  public loadImage = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public viewCtrl:ViewController
  ) {
  }

  ionViewDidLoad() {
    
  }

  public async searchUser(){
    try{
      let user = await this.http.get(`/user/search/${this.search}`).toPromise();
      if(user.hasOwnProperty("msg")){
        this.userEnable = false;
      }else{
        this.user = user as any;
        this.user.imgSrc = interceptor.transformUrl("/images/ramdon/users/" + this.user.id);
        this.userEnable = true;
        this.loadImage = false;
      }
    }
    catch(e){
      console.error(e);
    }
  }

  public loadImg(){
    this.loadImage = true;
  }

  public add(){
    this.viewCtrl.dismiss(this.user);
  }

}
