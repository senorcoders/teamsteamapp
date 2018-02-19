import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';

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
  public player:any;

  public save:boolean=true;

  public contacts:Array<any>=[];
  public nameContact:string="";
  public infoContact:string="";
  public idContact:string;
  public typeContact:string="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public http: HttpClient,
    private camera: Camera, public loading: LoadingController
  ) {

    this.player = this.navParams.get("player");

    if( moment(this.player.birthDay, "MM/DD/YYYY", true).isValid() ){
      this.player.birthDay = moment(this.player.birthDay, "MM/DD/YYYY").format("YYYY-MM-DD");
    }

    this.player.positions = this.player.positions.join(",");
    console.log(this.player);
  }

  async ngOnInit(){
    let cts:any;
    cts = await this.http.get("/contacts/user/"+ this.player.user.id).toPromise();
    this.contacts = cts;
    console.log(this.contacts);
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
    let player = this.player
    player.image = base64Image;
    let load = this.loading.create({content : "Saving..."});
    load.present({ disableApp : true });
    try{
      await this.http.put("/players/"+ this.player.id, player).toPromise();
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
    this.player.image = base64Image;

  }

  private async update(){

    let player = JSON.parse( JSON.stringify(this.player) );
    player.positions = player.positions.split(",");
    delete player.user;
    delete player.image;
    delete player.positions;

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

}
