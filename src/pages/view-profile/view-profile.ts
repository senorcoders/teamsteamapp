import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ContactsProfilePage } from '../contacts-profile/contacts-profile';
import { TeamsProfilePage } from '../teams-profile/teams-profile';


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
  public edit=false;

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
      //console.log(this.team);
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

    try{

      let image = await this.helper.Camera({ width: 600, height: 600, quality : 80 });
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
      console.log("");
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: unexpectM }).present();
    }

  }

  public success(){
    this.image = true;
  }

  public async mCode(){
    let message = await this.helper.getWords("MCODE");
    this.alertCtrl.create({ message: message})
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
      console.log(e);
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

}
