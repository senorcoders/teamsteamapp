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

  public username = "";
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

    let valid = HelpersProvider.me.validadorFields(this, [
      { value: this.username, type: "text", nameMessage: "Username" },
      { value: this.firstname, type: "text", nameMessage: "FIRSTNAME" },
      { value: this.lastname, type: "text", nameMessage: "LASTNAME" },
      { value: this.email, type: "email", nameMessage: "Email" },
      { value: this.relationship, type: "text", nameMessage: "RELATIONSHIP" }
    ]);
    if (valid.valid === false) {
      return;
    }

    let load = await HelpersProvider.me.getLoadingStandar();
    try {
      let user = {
        username: this.username,
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
      this.navCtrl.pop();
    }catch (e) {
      load.dismiss();
      console.error(e);
      HelpersProvider.me.presentAlertErrorStandar();
    }

  }

}
