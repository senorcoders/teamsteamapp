import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {

  public user:any={ options : { language: "en" } };
  public lang:string='';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, private http: HttpClient,
    public auth: AuthServiceProvider
  ) {

    this.user = MyApp.User;
    console.log(this.user);
    if( !this.user.hasOwnProperty("options") ){
      this.user.options = { language : 'en' };
    }

    this.lang = this.user.options.language;

    let ramdon = new Date().getTime();
    this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ this.user.id);

  }

  async ionViewWillEnter(){
    try{

    }
    catch(e){
      console.error(e);
    }
  }

  public async changeLang(){

    try{

      let options = this.user.options;
      options.language = this.lang;

      let updatedUser = await this.http.put("/user/"+ this.user.id, { options }).toPromise();
      await this.auth.saveOptions(options);
      console.log(updatedUser);
      this.helper.setLanguage(this.lang);

    }
    catch(e){
      console.error(e);

    }
  }

}
