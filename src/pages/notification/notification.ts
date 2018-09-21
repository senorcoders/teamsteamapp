import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';


@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {

  public group = "athletes";
  public title = "";
  public message = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {
  }

  ionViewDidLoad() {
  }

  public async sendNoti() {

    let load = HelpersProvider.me.getLoadingStandar();
    try {
      if(this.title === "" || this.message === ""){
        let emptyMsg = await HelpersProvider.me.getWords("EMPTYFIELDS");
        return HelpersProvider.me.alertCtrl.create({
          message: emptyMsg,
          buttons: ["Ok"]
        }).present();
      }

      let endpoint = "";
      if(this.group==="athletes"){
        endpoint = "/notification/athletes";
      }else if(this.group==="managers"){
        endpoint = "/notification/managers";
      }else{
        endpoint = "/notification/familys";
      }

      await this.http.post(endpoint, {
        team: MyApp.User.team,
        title: this.title,
        message: this.message
      }, { responseType: "text" }).toPromise();

      this.title = "";
      this.message = "";

      HelpersProvider.me.alertCtrl.create({
        message: await HelpersProvider.me.getWords("NOTIFCATION.SUCCESS"),
        buttons: ["Ok"]
      }).present();
    }
    catch (e) {
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }

    load.dismiss();
  }

}
