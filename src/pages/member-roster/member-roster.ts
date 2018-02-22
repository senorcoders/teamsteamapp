import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { EditFamilyPage } from '../edit-family/edit-family';
import { interceptor } from '../../providers/auth-service/interceptor';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { RosterPage } from '../roster/roster';

/**
 * Generated class for the MemberRosterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
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
    private camera: Camera, public loading: LoadingController,
    public auth: AuthServiceProvider
  ) {

    this.player = this.navParams.get("player");
    this.updateImageCallback = this.navParams.get("updateImage");
    this.index = this.navParams.get("index");

    if( moment(this.player.birthDay, "MM/DD/YYYY", true).isValid() ){
      this.player.birthDay = moment(this.player.birthDay, "MM/DD/YYYY").format("YYYY-MM-DD");
    }
    
    if( this.player.positions !== undefined ){
      if( Object.prototype.toString.call(this.player.positions) != '[object String]' ){
        this.player.positions = this.player.positions.join(",");
      }
    }else{
      this.player.positions = "";
    }

    this.imageSrc = this.player.image;
    
    console.log(this.player);
  }

  async ngOnInit(){
    let cts:any;
    cts = await this.http.get("/contacts/user/"+ this.player.user.id).toPromise();
    this.contacts = cts;
    console.log(this.contacts);
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
    const options: CameraOptions = {
      quality: 100,
      sourceType : 0,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    let fnt = this;

    this.alertCtrl.create({ title : "Source", message : "Select a source",
    buttons : [{
      text : "Library",
      handler : function(){
        fnt.getPhoto(options);
      }
    }, {
      text : "Camera",
      handler: function(){
        options.sourceType  = 1;
        fnt.getPhoto(options);
      }
    }] }).present();

  }

  private getPhoto(options:any){
    
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.updatePhoto(base64Image);

     }, (err) => {
      console.error(err);
     });
  }

  private async updatePhoto(base64Image){

    this.imageSrc = "./assets/imgs/avatar.gif"

    let load = this.loading.create({content : "Saving..."});
    load.present({ disableApp : true });

    try{
      await this.http.post("/players/image", {
        id : this.player.id,
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

    let player = JSON.parse( JSON.stringify(this.player) );
    player.positions = player.positions.split(",");
    delete player.user;
    delete player.image;

    player.birthDay = moment(player.birthDay, "YYYY-MM-DD").format("MM/DD/YYYY");

    let user = this.player.user;

    let load = this.loading.create({content : "Updating..."});
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

  public remove(){
    let t = this;
    let alert = this.alertCtrl.create({
      title: 'Confirm Password',
      inputs: [
        {
          name: 'password',
          placeholder: 'Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Go!',
          handler: data => {
            t.checkPassword(data.password);
          }
        }
      ]
    });
    alert.present();
  }

  public checkPassword(password){
    let username = this.auth.User().username;

    this.load = this.loading.create({ content: "Deleting..." });
    this.load.present({ disableApp : true });
    let t = this;
    this.http.post('/login', { username, password})
    .subscribe(function(data:any){

      if( data.hasOwnProperty("message") && data.message == "User not found" ){
        t.load.dismiss();
        t.alertCtrl.create({
          title: "Error",
          message: "Passwords do not match",
          buttons: ["Ok"]
        }).present();

      }else{

        console.log("success");
        t.deletePlayer();

      }
    }, function(err){
      
      this.load.dismiss();

      t.alertCtrl.create({
        title: "Error",
        message: "Unexpected Error",
        buttons: ["Ok"]
      }).present();

      console.error(err);

    });
  }

  public async deletePlayer(){
    let t = this;
    try{
      await this.http.delete("/user/"+ this.player.user.id).toPromise();
      await this.http.delete("/players/"+ this.player.id).toPromise();
      await Promise.all(this.contacts.map(async function(item){
        await t.http.delete("/contacts/"+ item.id).toPromise();
      }));

      if( t.image === true ){
        await this.http.delete("/players/image/"+ this.player.id).toPromise();
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
    
    t.load.dismiss();
    this.navCtrl.setRoot(RosterPage);
  }

}
