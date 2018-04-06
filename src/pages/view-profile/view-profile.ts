import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';


@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {

  public user:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider
  ) {
    this.user = MyApp.User;
    let ramdon = new Date().getTime();
    this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users&thumbnail/"+ this.user.id);
  }

  public changeLang(lang:string){
    this.helper.setLanguage(lang);
  }

}
