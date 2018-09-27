import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, Select } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ContactsProfilePage } from '../contacts-profile/contacts-profile';
import { TeamsProfilePage } from '../teams-profile/teams-profile';
import { ViewRequestsPage } from '../view-requests/view-requests';
import { PaymentMonthlyPage } from '../payment-monthly/payment-monthly';
import { PrivacyPolicePage } from '../privacy-police/privacy-police';
import { ListPlayersPaymentPage } from '../list-players-payment/list-players-payment';
import { ViewPaymentsPlayerPage } from '../view-payments-player/view-payments-player';
import { Storage } from '@ionic/storage';
import { SelectLeaguesPage } from '../select-leagues/select-leagues';
import { AddTeamPage } from '../add-team/add-team';
import { CreateLeaguePage } from '../create-league/create-league';
import { SettingPage } from '../setting/setting';


@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {

  public static __name = "ViewProfilePage"

  @ViewChild('mySelect') selectRef: Select;
  @ViewChild('myRoles') myRoles: Select;


  public user: any = { options: { language: "en" }, role: { name: "" } };
  public lang: string = '';
  public image = false;
  public team: any = { name: "", request: [] };
  public edit = false;
  public icon = 'ios-create-outline';
  public request: Array<any> = [];
  public manager: any = {};
  public roles: Array<any> = [];
  public rolesTypes = [];
  public rolType = "";
  public league: any = {};
  public currentRol: any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, private http: HttpClient,
    public auth: AuthServiceProvider, private loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public storage: Storage
  ) {

  }

  async ionViewWillEnter() {

    this.user = JSON.parse( JSON.stringify(MyApp.User) );

    //Para cuando el usuario no tiene rol
    if(this.user.role===null||this.user.role==undefined){
      this.user.role = {
        name: "None"
      };
    }

    let load = this.helper.getLoadingStandar(), ramdon = new Date().getTime();
    try {
      this.image = false;
      this.user.imageSrc = interceptor.transformUrl("/userprofile/images/" + MyApp.User.id + "/" + MyApp.User.team + "/" + ramdon);

      this.currentRol = this.user.rol;

      let user: any = await this.storage.get("user");
      if (user.roles !== undefined && user.roles !== null) {
        this.roles = user.roles;
      }

      if (this.user.role.hasOwnProperty("team")) {
        this.team = await this.http.get("/team/profile/" + MyApp.User.team).toPromise();
        if (!this.team.hasOwnProperty("request")) {
          this.team.request = [];
        }

        this.request = this.team.request;
      }

      //cargamos los roles types
      for (let rol of MyApp.User.roles) {
        let index = this.rolesTypes.findIndex(it => {
          return rol.name === it.name;
        });
        if (index === -1) {
          this.rolesTypes.push(rol);
        }
      }
      // console.log(this.rolesTypes);

      //Si el rol es de league cargamos la liga
      if (this.user.role.league !== undefined && this.user.role.league !== null) {
        if (Object.prototype.toString.call(this.user.role.league) === "[object Object]")
          this.league = await this.http.get("/leagues/" + this.user.role.league.id).toPromise() as any;
        else
          this.league = await this.http.get("/leagues/" + this.user.role.league).toPromise() as any;
      }

    }
    catch (e) {
      console.error(e);
    }
    load.dismissAll();
  }

  public teamsPresent(){
    if(this.user.role===undefined||this.user.role===null) return false;
    
    return this.user.role.hasOwnProperty('team')
  }

  public selectLeagues() {
    this.navCtrl.push(SelectLeaguesPage);
  }

  public async loadImage() {
    this.image = true;
  }

  public async changeLang() {

    try {

      let options = this.user.options;
      options.language = this.lang;

      /*let updatedUser = */await this.http.put("/user/" + this.user.id, { options }).toPromise();
      await this.auth.saveOptions(options);
      //console.log(updatedUser);
      this.helper.setLanguage(this.lang);

    }
    catch (e) {
      console.error(e);

    }
  }

  public async changePhoto() {

    let unexpectM = await this.helper.getWords("ERORUNEXC");
    let load = HelpersProvider.me.getLoadingStandar(false), ramdon = new Date().getTime();

    try {

      let image = await this.helper.Camera({ width: 170, height: 170, quality: 80 }, true);
      if (image === undefined)
        return;

      let team = MyApp.User.team !== undefined && MyApp.User.team !== null ? MyApp.User.team : "undefined";
      await this.http.post("/userprofile/images", {
        id: MyApp.User.id,
        image: image,
        team
      }).toPromise();

      this.user.imageSrc = interceptor.transformUrl("/userprofile/images/" + MyApp.User.id + "/" + team + "/" + ramdon);

      //es necesario actualizar la image del nav manualmente
      document.getElementById("imageSlide").setAttribute("src", this.user.imageSrc);

      load.dismiss();
    }
    catch (e) {
      console.error(e);
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: unexpectM }).present();
    }

  }

  public success() {
    this.image = true;
  }

  public async mCode() {

    let message = await this.helper.getWords("MCODE"),
      cancelM = await this.helper.getWords("CANCEL"),
      resendVer = await this.helper.getWords("RESENDVERIFICATIONCODE");

    this.alertCtrl.create({
      message: message, buttons: [
        { text: cancelM },
        { text: resendVer, handler: function () { this.resendCode() }.bind(this) }
      ]
    })
      .present();
  }


  public async editNameFull() {

    let entryM = await this.helper.getWords("ENTRYFULLNAME"),
      nameM = await this.helper.getWords("FIRSTNAME"),
      lastNameM = await this.helper.getWords("LASTNAME"),
      cancelM = await this.helper.getWords("CANCEL");

    try {

      this.alertCtrl.create({
        title: entryM, inputs: [
          { name: "firstName", type: "text", placeholder: nameM },
          { name: "lastName", type: "text", placeholder: lastNameM }
        ], buttons: [
          { text: cancelM },
          { text: "Ok", handler: function (data) { this.updateFullName(data.firstName, data.lastName) }.bind(this) }
        ]
      }).present();

    }
    catch (e) {
      console.error(e);
    }
  }

  public async updateFullName(name, last) {

    name = name || "";
    last = last || "";

    let params: any = {};

    if (name == "" && last == "")
      return;

    if (name !== "") {
      params.firstName = name;
    }

    if (last !== "") {
      params.lastName = last;
    }

    let load = HelpersProvider.me.getLoadingStandar();

    try {

      let newUser = await this.http.put("/user/" + this.user.id, params).toPromise();
      this.auth.updateUser(newUser);
      this.user = newUser;

      load.dismiss();
    }
    catch (e) {
      load.dismiss();
      let unecxM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unecxM }).present();
      console.error(e);
    }

  }

  public async editUserName() {
    let entryM = await this.helper.getWords("ENTRYFULLNAME"),
      cancelM = await this.helper.getWords("CANCEL");

    try {

      this.alertCtrl.create({
        title: entryM,
        inputs: [
          { name: "username", type: "text", placeholder: "username" },
        ], buttons: [
          { text: cancelM },
          { text: "Ok", handler: function (data) { this.updateUsername(data.username) }.bind(this) }
        ]
      }).present();

    }
    catch (e) {
      console.error(e);
    }
  }

  public async updateUsername(username) {

    username = username || "";

    let params: any = {};

    if (username === "")
      return;

    params.username = username;

    let load = HelpersProvider.me.getLoadingStandar();

    try {
      //console.log(params);
      let newUser = await this.http.put("/user/" + this.user.id, params).toPromise();
      //console.log(newUser);
      this.auth.updateUser(newUser);
      this.user = newUser;

      load.dismiss();
    }
    catch (e) {
      load.dismiss();
      let unecxM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unecxM }).present();
      console.error(e);
    }

  }

  //este es para comprobar si el usuario desea editar datos
  public editable() {
    return this.user.role.name != 'Manager' && !this.edit;
  }

  public selectTeams() {
    this.navCtrl.push(TeamsProfilePage);
  }

  public viewContacts() {
    this.navCtrl.push(ContactsProfilePage);
  }

  public goViewRequests() {
    this.navCtrl.push(ViewRequestsPage, { requests: this.team.request });
  }

  public paymentsMonthly() {
    this.navCtrl.push(PaymentMonthlyPage);
  }

  private async resendCode() {

    try {

      /*let resend = */await this.http.post("/user/resend-code", {
        id: MyApp.User.id,
        email: MyApp.User.email,
        verificationCode: MyApp.User.verificationCode
      }).toPromise();

      //console.log(resend);

    }
    catch (e) {
      console.error(e);
    }

  }

  public goAbout() {
    this.navCtrl.push(PrivacyPolicePage);
  }

  public viewsPlayerPayments() {
    this.navCtrl.push(ListPlayersPaymentPage)
  }

  public viewsPayments() {
    this.navCtrl.push(ViewPaymentsPlayerPage);
  }

  public async changeEmailAlert() {

    let emailM = await this.helper.getWords("EMAIL");
    this.alertCtrl.create({
      inputs: [{ name: "email", placeholder: emailM, type: "email" }],
      buttons:
        [
          "Cancel",
          { text: "Ok", handler: function (data) { this.changeEmail(data.email) }.bind(this) }
        ]
    })
      .present();
  }

  public async changeEmail(email) {

    let valid = this.helper.validEmail(email);
    if (valid === false) {
      let M = await this.helper.getWords("EMAILINVALID");
      this.alertCtrl.create({ title: "Error", message: M })
        .present();
      return;
    }

    try {
      let user: any = await this.http.put("/user/" + MyApp.User.id, { email, verified: false }).toPromise();
      await this.auth.updateUser(user);
      this.user.email = user.email;
    }
    catch (e) {
      console.error(e);
      let unexpectM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexpectM })
        .present();
    }

  }

  public isManagerRequest() {

    if (MyApp.User === null || MyApp.User === undefined)
      return true;

    if (this.team.request.length !== 0 && this.user.role.name === "Manager") return false;

    return true;
  }



  showEdit() {
    this.edit = !this.edit;
    if (this.edit == false) {
      this.icon = 'ios-create-outline';
    } else {
      this.icon = 'md-checkmark';

    }
  }

  public answerDeleteDevices() {
    this.helper.presentAlertStandar(this.deleteDevices.bind(this));
  }

  public async deleteDevices() {
    let load = this.helper.getLoadingStandar();
    try {
      await this.http.delete("/user/devices/" + MyApp.User.id + "/" + this.helper.getDeviceInfo().uuid).toPromise();
      load.dismissAll();
    }
    catch (e) {
      load.dismissAll();
      console.error(e);
      await this.helper.presentAlertErrorStandar();
    }
  }

  public async logout() {
    let load = HelpersProvider.me.getLoadingStandar();
    await MyApp.me.logout();
    load.dismissAll();
  }

  public openSelectRolesTypes() {
    this.myRoles.open();
  }

  public IsValidToTeam(): Boolean {
    return this.rolesTypes.length > 1;
  }

  public addTeam() {
    this.navCtrl.push(AddTeamPage);
  }

  public createLeague() {
    this.navCtrl.push(CreateLeaguePage);
  }

  public setting() {
    this.navCtrl.push(SettingPage);
  }

  public async changeRol() {

    let role = this.roles.find(function (it) {
      return it.id === this.rolType;
    }.bind(this)) as any;
    if (role === undefined) return;

    if (role.name !== "FreeAgent" && role.name !== "OwnerLeague") {
      try {
        await this.auth.setTimeZoneTeam();
        await HelpersProvider.me.setGeofences(200);
      }
      catch (e) {
        console.error(e);
      }
    } else {
      delete this.user.team;
      try {
        await HelpersProvider.me.stopGeofences();
      }
      catch (e) {
        console.error(e);
      }
    }

    await this.auth.updateRole(role);

    await this.ionViewWillEnter();
  }

}
