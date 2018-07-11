import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { EditFamilyPage } from '../edit-family/edit-family';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { RosterPage } from '../roster/roster';
import { HelpersProvider } from '../../providers/helpers/helpers';

/**
 * para editar un player
 */

@IonicPage()
@Component({
  selector: 'page-member-roster',
  templateUrl: 'member-roster.html',
})
export class MemberRosterPage {

  public load:Loading;

  public player:any;

  public save:boolean=true;

  public contacts:Array<any>=[];
  public nameContact:string="";
  public infoContact:string="";
  public idContact:string;
  public typeContact:string="";

  public imageSrc:string;
  public image:boolean=false;

  public updateImageCallback:any;
  public index:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
   public loading: LoadingController,
    public auth: AuthServiceProvider, private helper: HelpersProvider
  ) {

    this.player = this.navParams.get("player");
    this.updateImageCallback = this.navParams.get("updateImage");
    this.index = this.navParams.get("index");

    this.player.birthDayParsed = moment(this.player.birthDay).format("DD MMM YYYY");
    
    if( this.player.positions !== undefined ){
      if( Object.prototype.toString.call(this.player.positions) != '[object String]' ){
        this.player.positions = this.player.positions.join(",");
      }
    }else{
      this.player.positions = "";
    }
    
    let random = new Date().getTime();
    this.imageSrc = interceptor.transformUrl("/images/"+ random+ "/users/"+ this.player.user.id);
    
    console.log(this.player);
  }

  //al iniciar cargamos los contactos del player
  async ngOnInit(){
    let cts:any;
    cts = await this.http.get("/contacts/user/"+ this.player.user.id).toPromise();
    this.contacts = cts;
    console.log(this.contacts);
  }

  public setDate(){
    this.helper.nativeDatePicker()
    .then(date=>{
      this.player.birthDayParsed = moment(date).format("DD MMM YYYY");
      this.player.birthDay = moment(date).toISOString();
    })
  }

  public success(){
    this.image = true;
  }

  public editContact(contact){
    this.nameContact = contact.name;
    this.infoContact = contact.info;
    this.idContact = contact.id;
    this.typeContact = contact._type;

    this.save = false;
  }

  public async addContact(){
    if( this.nameContact == "" || this.infoContact == "" || this.typeContact == "" ){
      this.alertCtrl.create({
        title : "Required!",
        subTitle: "There's empty fields",
        buttons: ["OK"]
      }).present();
      return;
    }

    var res = await this.http.post("/contacts", {
      name : this.nameContact,
      info: this.infoContact,
      _type: this.typeContact,
      user: this.player.user.id
    }).toPromise();

    this.contacts.push(res);

    this.cleanIputContact();
  }

  public async updateContact(){
    await this.http.put("/contacts/"+ this.idContact, {
      name : this.nameContact,
      _type: this.typeContact,
      info: this.infoContact
    }).toPromise();

    let cts:any;
    cts = await this.http.get("/contacts/user/"+ this.player.user.id).toPromise();
    this.contacts = cts;

    this.save = true;

    this.cleanIputContact();
  }

  public async removeContact(id:string){
    await this.http.delete("/contacts/"+ id).toPromise();

    let cts:any;
    cts = await this.http.get("/contacts/user/"+ this.player.user.id).toPromise();
    this.contacts = cts;

  }

  private cleanIputContact(){
    this.nameContact="";
    this.infoContact="";
    this.typeContact="";
    this.idContact="";
  }

  public changePhoto(){
    let t = this;

    this.helper.Camera({ width : 200, height: 200, quality: 75 }).then((result)=>{
      t.updatePhoto(result);
    })
    .catch((err)=>{
      console.error(err);
    });

  }

  //la foto se actualiza en el momento de haber sido cambiada
  private async updatePhoto(base64Image){

    this.imageSrc = "./assets/imgs/avatar.gif"

    let load = this.loading.create({content : "Saving..."});
    load.present({ disableApp : true });

    try{
      await this.http.post("/images/users", {
        id : this.player.user.id,
        image : base64Image
      }).toPromise();
    }catch(e){
      
      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title : "Error",
        message: "Fail to saved"
      }).present();

      return;
    }
    
    load.dismiss();
    
    this.imageSrc = base64Image;

    this.updateImageCallback(this.index, base64Image);
    
  }

  private async update(){
    //se copea el objeto de player sin referencia
    let player = JSON.parse( JSON.stringify(this.player) );
    player.positions = player.positions.split(",");
    delete player.user;
    delete player.image;

    let user = this.player.user;
    let msg = await HelpersProvider.me.getWords("UPDATING");
    let load = this.loading.create({content : msg});
    load.present({ disableApp : true });
    try{
      await this.http.put("/players/"+ this.player.id, player).toPromise();
      await this.http.put("/user/"+ this.player.user.id, user).toPromise();
    }catch(e){
      
      load.dismiss();
      console.error(e);
      this.alertCtrl.create({
        title : "Error",
        message: "Fail to saved"
      }).present();

      return;
    }
    
    load.dismiss();

    this.navCtrl.pop();
  }

  public goEditFamily(){
    this.navCtrl.push(EditFamilyPage, {
      player: this.player
    });
  }

  //#region en el futuro eliminar
  //muestra un alert controller para pedirle la contraseña al usuario
  // public remove(){
  //   let t = this;
  //   let alert = this.alertCtrl.create({
  //     title: 'Confirm Password',
  //     inputs: [
  //       {
  //         name: 'password',
  //         placeholder: 'Password',
  //         type: 'password'
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: data => {
  //           console.log('Cancel clicked');
  //         }
  //       },
  //       {
  //         text: 'Go!',
  //         handler: data => {
  //           t.checkPassword(data.password);
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

  //Para comprobar si es el usuario legitimo el que esta borrando datos se le pedi la contraseña nuevamente
  // public checkPassword(password){
  //   let email = this.auth.User().email;

  //   this.load = this.loading.create({ content: "Deleting..." });
  //   this.load.present({ disableApp : true });
  //   let t = this;
  //   this.http.post('/login', { email, password})
  //   .subscribe(function(data:any){

  //     if( data.hasOwnProperty("message") && data.message == "User not found" ){
  //       t.load.dismiss();
  //       t.alertCtrl.create({
  //         title: "Error",
  //         message: "Passwords do not match",
  //         buttons: ["Ok"]
  //       }).present();

  //     }else{

  //       console.log("success");
  //       t.deletePlayer();

  //     }
  //   }, function(err){
      
  //     this.load.dismiss();

  //     t.alertCtrl.create({
  //       title: "Error",
  //       message: "Unexpected Error",
  //       buttons: ["Ok"]
  //     }).present();

  //     console.error(err);

  //   });
  // }
  //#endregion

  public async answerDelete(){
    let msgM = await HelpersProvider.me.getWords(["DELETE", "PLAYER"]);
    console.log(msgM);
    HelpersProvider.me.presentAlertStandar(this.deletePlayer.bind(this), function(){

    }, msgM["DELETE"]+ " "+ msgM["PLAYER"]);
  }

  public async deletePlayer(){
    let t = this, load = HelpersProvider.me.getLoadingStandar();
    try{
      //await this.http.delete("/user/"+ this.player.user.id).toPromise();
      await this.http.delete("/players/"+ this.player.id).toPromise();
      /*await Promise.all(this.contacts.map(async function(item){
        await t.http.delete("/contacts/"+ item.id).toPromise();
      }));*/

      if( t.image === true ){
        await this.http.delete("/images/users/"+ this.player.user.id).toPromise();
      }
      
    }
    catch(e){
      console.error(e);
      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();
    }
    
    load.dismiss();
    this.navCtrl.setRoot(RosterPage);
  }

}
