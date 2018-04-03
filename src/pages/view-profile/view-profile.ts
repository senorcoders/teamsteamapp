import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';


@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {

  public user:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.user = MyApp.User;
    let ramdon = new Date().getTime();
    this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ this.user.id);
  }

}
