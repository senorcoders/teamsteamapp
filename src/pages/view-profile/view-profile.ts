import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
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


@IonicPage()
@Component({
  selector: 'page-view-profile',
  templateUrl: 'view-profile.html',
})
export class ViewProfilePage {

  public user:any={ options : { language: "en" } };
  public lang:string='';
  public image=false;
  public team:any={ name : "", request: [] };
  public edit=false;
  public icon = 'ios-create-outline';
  public request:Array<any>=[];
  public manager:any={};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public helper: HelpersProvider, private http: HttpClient,
    public auth: AuthServiceProvider, private loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {

    this.user = MyApp.User;
    if( !this.user.hasOwnProperty("options") ){
      this.user.options = { language : 'en' };
    }

    this.lang = this.user.options.language;

    let ramdon = new Date().getTime();
    this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ this.user.id);

  }

  async ionViewWillEnter(){
    try{

      //console.log(this.manager);

      this.team = await this.http.get("/team/profile/"+ MyApp.User.team).toPromise();
      //console.log(this.team);
      if( !this.team.hasOwnProperty("request") ){
        this.team.request = [];
      }

      //console.log(this.team.request);
      this.request = this.team.request;
      if( this.user.verified === false ){
        let v:any = await this.http.get("/user/verified-code/"+ this.user.id).toPromise();
        //console.log(v);
        if( v.verified === true ){
          this.user.verified = true;
          await this.auth.updateUser(this.user);
        }
      }

    }
    catch(e){
      console.error(e);
    }
  }

  public async loadImage(){
    this.image = true;
  }

  public async changeLang(){

    try{

      let options = this.user.options;
      options.language = this.lang;

      /*let updatedUser = */await this.http.put("/user/"+ this.user.id, { options }).toPromise();
      await this.auth.saveOptions(options);
      //console.log(updatedUser);
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

    try{

      let image = await this.helper.Camera({ width: 600, height: 600, quality : 80 });
      if( image === undefined )
        return;
        
      load.present({ disableApp : true });

      await this.http.post("/images/users", {
        id : MyApp.User.id,
        image : image
      }).toPromise();

      let ramdon = new Date().getTime();
      this.user.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/users/"+ this.user.id);

      //es nessasario actualizar la image delnav manualmente
      document.getElementById("imageSlide").setAttribute("src", this.user.imageSrc);

      load.dismiss();
    }
    catch(e){
      //console.log("");
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: unexpectM }).present();
    }

  }

  public success(){
    this.image = true;
  }

  public async mCode(){

    let message = await this.helper.getWords("MCODE"),
    cancelM = await this.helper.getWords("CANCEL"),
    resendVer = await this.helper.getWords("RESENDVERIFICATIONCODE");

    this.alertCtrl.create({ message: message, buttons: [ 
      { text:cancelM },
      { text: resendVer, handler: function(){ this.resendCode() }.bind(this) }
    ]})
    .present();
  }


  public async editNameFull(){

    let entryM = await this.helper.getWords("ENTRYFULLNAME"),
    nameM = await this.helper.getWords("FIRSTNAME"),
    lastNameM = await this.helper.getWords("LASTNAME"),
    cancelM = await this.helper.getWords("CANCEL");

    try{
      
      this.alertCtrl.create({ title: entryM, inputs: [
        {name: "firstName", type: "text", placeholder: nameM},
        {name: "lastName", type: "text", placeholder: lastNameM}
      ], buttons: [
        {text: cancelM },
        { text: "Ok", handler : function(data){ this.updateFullName(data.firstName, data.lastName) }.bind(this) }
      ]}).present();

    }
    catch(e){
      console.error(e);
    }
  }

  public async updateFullName(name, last){

    name = name || "";
    last = last || "";

    let params:any = {};
    
    if( name == "" && last == "" )
      return;

    if( name !== "" ){
      params.firstName = name;
    }

    if( last !== "" ){
      params.lastName = last;
    }

    let updatingM = await this.helper.getWords("UPDATING");
    let load = this.loadingCtrl.create({ content: updatingM });
    load.present({ disableApp : true });

    try{

      let newUser = await this.http.put("/user/"+ this.user.id, params).toPromise();
      this.auth.updateUser(newUser);
      this.user = newUser;

      load.dismiss();
    }
    catch(e){
      load.dismiss();
      let unecxM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unecxM }).present();
      console.error(e);
    }

  }

  public async editUserName(){
    let entryM = await this.helper.getWords("ENTRYFULLNAME"),
    cancelM = await this.helper.getWords("CANCEL");

    try{
      
      this.alertCtrl.create({ title: entryM,
        inputs: [
        {name: "username", type: "text", placeholder: "username"},
      ], buttons: [
        {text: cancelM },
        { text: "Ok", handler : function(data){ this.updateUsername(data.username) }.bind(this) }
      ]}).present();

    }
    catch(e){
      console.error(e);
    }
  }

  public async updateUsername(username){

    username = username || "";

    let params:any = {};
    
    if( username === "" )
      return;

    params.username = username;

    let updatingM = await this.helper.getWords("UPDATING");
    let load = this.loadingCtrl.create({ content: updatingM });
    load.present({ disableApp : true });

    try{
      //console.log(params);
      let newUser = await this.http.put("/user/"+ this.user.id, params).toPromise();
      //console.log(newUser);
      this.auth.updateUser(newUser);
      this.user = newUser;

      load.dismiss();
    }
    catch(e){
      load.dismiss();
      let unecxM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unecxM }).present();
      console.error(e);
    }

  }

  //este es para comprobar si el usuario desea editar datos
  public editable(){
    return this.user.role.name != 'Manager' && !this.edit;
  }

  public selectTeams(){
    this.navCtrl.push(TeamsProfilePage);
  }

  public viewContacts(){
    this.navCtrl.push(ContactsProfilePage);
  }

  public goViewRequests(){
    this.navCtrl.push(ViewRequestsPage, {requests: this.team.request});
  }

  public async changePassword(){
    
    let currentM = await this.helper.getWords("CHANGEPASSALERT.CURRENT"), 
    newPassM = await this.helper.getWords("CHANGEPASSALERT.NEWPASS"),
    newPassMAgain = await this.helper.getWords("CHANGEPASSALERT.AGAINNEWPASS"),
    cancelM = await this.helper.getWords("CANCEL"),
    passM = await this.helper.getWords("PASSWORD");


    let c = this.alertCtrl.create({ title: passM, inputs: [
        { type: "password", name: "current", placeholder: currentM  },
        { type: "password", name: "newPass", placeholder: newPassM },
        { type: "password", name: "passAgain", placeholder: newPassMAgain },
      ], buttons: [
        { text: cancelM },
        {text: "Ok", handler: function(data){ this.changePass(data) }.bind(this) }
      ] });

    c.present();
    
  }

  private async changePass(data){
    //console.log(data);
    let current = data.current || "",
    newPass = data.newPass || "",
    againPass = data.passAgain || "";
    
    if( newPass == "" || againPass == "" ){

      let emptM = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: "Error", message: emptM })
      .present();
      return;

    }else if( newPass !== againPass ){
      let emptM = await this.helper.getWords("PASSWORDNOT");
      this.alertCtrl.create({ title: "Error", message: emptM })
      .present();
      return;

    }

    try{

      let params = { password: current, 
        passwordHash: MyApp.User.password,
        newPassword : newPass,
        id : MyApp.User.id
      };

      let v:any = await this.http.post("/password/change", params).toPromise();
      //console.log(v);

      if( v.hasOwnProperty("id") && v.id === true ){
        let changedM = await this.helper.getWords("CHANGED");
        this.alertCtrl.create({ message: changedM, buttons: ["Ok"] })
        .present();
      }else{
        let inconM = await this.helper.getWords("PASSWORDINCORRECTO");
        this.alertCtrl.create({ message: inconM, buttons: ["Ok"] })
        .present();
        return;
      }

    }
    catch(e){
      console.error(e);
    }

  }

  public paymentsMonthly(){
    this.navCtrl.push(PaymentMonthlyPage);
  }

  private async resendCode(){
    
    try{

      /*let resend = */await this.http.post("/user/resend-code", { 
        id: MyApp.User.id,
        email: MyApp.User.email,
        verificationCode: MyApp.User.verificationCode
      }).toPromise();

      //console.log(resend);

    }
    catch(e){
      console.error(e);
    }

  }

  public goAbout(){
    this.navCtrl.push(PrivacyPolicePage);
  }

  public viewsPlayerPayments(){
    this.navCtrl.push(ListPlayersPaymentPage)
  }

  public viewsPayments(){
    this.navCtrl.push(ViewPaymentsPlayerPage);
  }

  public async changeEmailAlert(){

    let emailM = await this.helper.getWords("EMAIL");
    this.alertCtrl.create({ 
      inputs: [ {name: "email", placeholder: emailM, type:"email"} ],
      buttons: 
      [
        "Cancel",
        {text: "Ok", handler: function(data){ this.changeEmail(data.email) }.bind(this) }
      ]
    })
    .present();
  }

  public async changeEmail(email){

    let valid = this.helper.validEmail(email);
    if( valid === false ){
      let M = await this.helper.getWords("EMAILINVALID");
      this.alertCtrl.create({ title: "Error", message: M })
      .present();
      return;
    }

    try{
      let user:any = await this.http.put("/user/"+ MyApp.User.id, { email, verified: false }).toPromise();
      await this.auth.updateUser(user);
      this.user.email = user.email;
    }
    catch(e){
      console.error(e);
      let unexpectM = await this.helper.getWords("ERORUNEXC");
      this.alertCtrl.create({ title: "Error", message: unexpectM })
      .present();
    }

  }

  public isManagerRequest(){
    
    if( MyApp.User === null || MyApp.User === undefined )
      return true;

    if( this.team.request.length !== 0 && MyApp.User.role.name === "Manager" ) return false;

    return true;
  }

 

  showEdit(){
    this.edit = !this.edit;
    if(this.edit == false){
      this.icon = 'ios-create-outline';
    }else{
      this.icon = 'md-checkmark';

    }
  }

}
