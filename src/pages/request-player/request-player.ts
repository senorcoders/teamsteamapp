import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';
import { RequestsPlayerPage } from '../requests-player/requests-player';


@IonicPage()
@Component({
  selector: 'page-request-player',
  templateUrl: 'request-player.html',
})
export class RequestPlayerPage {

  public request: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient
  ) {
    this.request = this.navParams.get("request");

    let size = HelpersProvider.me.getSizeImage().text;
    this.request.loadImage = false;
    let ramdon = new Date().getTime();
    this.request.imageSrc = interceptor.transformUrl('/images/' + ramdon + '/events/' + this.request.team.id + size);
  }

  ionViewDidLoad() {
  }

  successImage(){
    this.request.loadImage = true;
  }

  public async updateRequest(response){
    try{
      let res = await this.http.put("/playerfree/request", {
        id: this.request.id,
        user: this.request.user.id,
        team: this.request.team.id,
        acept: response
      }).toPromise();
      console.log(res);
      this.navCtrl.setRoot(RequestsPlayerPage);
    }
    catch(e){
      console.error(e);
    }
  }

}
