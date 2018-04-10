import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
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
  public image=false;
  public team:any={ name : "" };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, private http: HttpClient,
    public auth: AuthServiceProvider, private loadingCtrl: LoadingController,
    public alertCtrl: AlertController
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

      this.team = await this.http.get("/teams/"+ MyApp.User.team).toPromise();
      console.log(this.team);
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

  public async changePhoto(){

    let unexpectM = await this.helper.getWords("ERORUNEXC"),
    savingM = await this.helper.getWords("SAVING");

    let load = this.loadingCtrl.create({ content: savingM });
    load.present({ disableApp : true });

    try{

      let image = await this.helper.Camera({ quality : 80 });

      await this.http.post("/images/users", {
        id : MyApp.User.id,
        image : image
      }).toPromise();

      let ramdon = new Date().getTime();
      this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ this.user.id);

    }
    catch(e){
      console.log("");
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: unexpectM }).present();
    }

  }

  public success(){
    this.image = true;
  }

}
