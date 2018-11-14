import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';

/**
 * para agregar familiar a los players
 */

@IonicPage()
@Component({
  selector: 'page-add-family',
  templateUrl: 'add-family.html',
})
export class AddFamilyPage {

  public static __name = "AddFamilyPage"

  public firstname = "";
  public lastname = "";
  public email = "";

  public relationship = "";
  public phoneNumber = "";
  public address = "";

  constructor(
    public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient
  ) {

  }

  ionViewDidLoad() {
  }

  public async addFamily() {

    if (
      this.firstname === "" ||
      this.lastname === "" ||
      this.email === "" ||
      this.relationship === ""
    ) {
      let empty = await HelpersProvider.me.getWords("EMPTYFIELDS");
      HelpersProvider.me.alertCtrl.create({ message: empty, buttons: ["Ok"] })
        .present();
      return;
    }

    let load = await HelpersProvider.me.getLoadingStandar();
    try {
      let user = {
        firstName: this.firstname,
        lastName: this.lastname,
        email: this.email
      };
      let family = {
        relationship: this.relationship,
        phoneNumber: this.phoneNumber,
        address: this.address,
        team: MyApp.User.team,
        child: MyApp.User.id
      };
      await this.http.post("/user/family-created", { user, family }).toPromise();
      load.dismiss();

      this.firstname = "";
      this.lastname = "";
      this.email = "";
      this.relationship = "";
      this.phoneNumber = "";
      this.address = "";
      
    }catch (e) {
      load.dismiss();
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }

  }

}
