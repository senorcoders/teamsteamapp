import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewRequestPage } from '../view-request/view-request';
import { interceptor } from '../../providers/auth-service/interceptor';


@IonicPage()
@Component({
  selector: 'page-view-requests',
  templateUrl: 'view-requests.html',
})
export class ViewRequestsPage {

  public request:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.request = this.navParams.get("requests");
    this.request = this.request.map(function(re){

      if( re.user.hasOwnProperty("firstName") ){
        re.user.fullName = re.user.firstName+ " "+ re.user.lastName;
        let ramdon = new Date().getTime();
        re.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ re.user.id);
      }

      return re;
    });

  }

  public viewRequest(request){
    this.navCtrl.push(ViewRequestPage, { request, requests: this.request });
  }

  public loadImage(request){
    request.image = true;
  }

}
