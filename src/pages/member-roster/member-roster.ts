import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import moment from 'moment';
import { HttpClient } from '@angular/common/http';

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
    public alertCtrl: AlertController, public http: HttpClient
  ) {
    this.player = this.navParams.get("player");
    this.player.birthDay = moment(this.player.birthDay, "MM/DD/YYYY").format("YYYY-MM-DD")
  }

  async ngOnInit(){
    console.log(this.player);
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

}
