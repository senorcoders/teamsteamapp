import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-view-request',
  templateUrl: 'view-request.html',
})
export class ViewRequestPage {

  public user:any={ fullName: "", email: "", password: "" };
  public request:any;
  public imageSrc="";
  public image=false;
  private requests:Array<any>=[];

  public player:any = { user: {firstName: "", lastName: "" } };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public helper: HelpersProvider,
    public http: HttpClient
  ) {

    this.request = this.navParams.get("request");
    this.user = this.request.user;
    this.imageSrc = this.user.imageSrc;
    this.requests = this.navParams.get("requests");

    console.log(this.request, this.requests, this.player);
    if( !this.request.hasOwnProperty("dened") ){
      this.request.dened = false;
    }

  }

  async ionViewDidLoad(){
    if(this.request.role === "Family"){
      let player = await this.http.get("/players/"+ this.request.user.player).toPromise();
      //console.log(player);
      this.player = player;
    }
  }


  public loadImage(){
    this.image = true;
  }

  public async acceptRequest(){

    this.request.acept = true;
    let index = this.requests.findIndex(function(it){ return it.user.email === this.request.user.email }.bind(this));
    if( index === -1 ){
      let unexM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexM})
      .present();
      return;
    }

    let request = JSON.parse( JSON.stringify(this.request) );
    delete request.imageSrc;
    this.requests[index] = request;
    let requests = await this.http.put("/team/request", { id: MyApp.User.team, request: this.requests, index }).toPromise();
    console.log(requests);

  }

  public async denRequest(){

    this.request.dened = true;
    let index = this.requests.findIndex(function(it){ return it.user.email === this.request.user.email }.bind(this));
    if( index === -1 ){
      let unexM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexM})
      .present();
      return;
    }

    let request = JSON.parse( JSON.stringify(this.request) );
    delete request.imageSrc;
    this.requests[index] = request;
    let requests = await this.http.put("/team/request", { id: MyApp.User.team, request: this.requests, index }).toPromise();
    console.log(requests);
  }

}
