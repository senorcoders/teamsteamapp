import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewRequestPage } from '../view-request/view-request';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-view-requests',
  templateUrl: 'view-requests.html',
})
export class ViewRequestsPage {

  public request:Array<any>=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {

    this.request = this.navParams.get("requests");
    
  }

  async ionViewDidLoad(){
    this.request = await Promise.all(this.request.map(async function(re){

      if( re.user.hasOwnProperty("firstName") ){
        re.user.fullName = re.user.firstName+ " "+ re.user.lastName;
        let ramdon = new Date().getTime();
        let user = await this.http.get('/user?where={"email":{"like":"'+ re.user.email+ '"}}').toPromise();
        if( user.length !== 0 ){
          re.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ user[0].id);
        }
      }

      return re;
    }.bind(this)) );
  }

  public viewRequest(request){
    this.navCtrl.push(ViewRequestPage, { request, requests: this.request });
  }

  public loadImage(request){
    request.image = true;
  }

}
