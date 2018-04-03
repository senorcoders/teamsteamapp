import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, MenuController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { RosterPage } from '../roster/roster';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { HelpersProvider } from '../../providers/helpers/helpers';
import * as moment from 'moment';

/**
 * para agregar los detalles del jugador
 */
@IonicPage()
@Component({
  selector: 'page-create-player-details',
  templateUrl: 'create-player-details.html',
})
export class CreatePlayerDetailsPage {

  public save:boolean=true;

  public user:any;
  public team:any;

  public birthDay:string="";
  public gender:string="";
  public yerseyNumber:string="";
  public positions:string="";
  public contacts:Array<any>=[];
  public nonPlayer:boolean=false;
  public managerAccess:boolean=false;

  public indexContact:number=0;
  public nameContact:string="";
  public infoContact:string="";
  public typeContact:string="email";

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public alertCtrl: AlertController, public http: HttpClient,
  public menuCtrl: MenuController, public auth: AuthServiceProvider,
  public helper: HelpersProvider
  ) {
    this.user = this.navParams.get("user");
  }

  async ngOnInit(){
    let user:any = await this.auth.User();
    let url;
    if( user.role.name === "Player"){
      url = "/team/player/"+ user.id;
    }else if( user.role.name === "Manager" ){
      url = "/team/manager/"+ user.id;
    }else if( user.role.name === "Parent" ){
      url = "/team/parent/"+ user.id;
    }
    
    var res = await this.http.get(url).toPromise();

    this.team = res;
  }

  public setDate(){
    this.helper.nativeDatePicker({ date : new Date(), mode: 'date' })
    .then(date=>{
      this.birthDay = moment(date).format("DD MMM YYYY");
    })
  }

  public addContact(){

    if(
      this.nameContact == '' ||
      this.infoContact == '' 
    ){
      this.alertCtrl.create({
        title: "Required",
        message: "Empty fields",
        buttons: ["Ok"]
      }).present();
      return;
    }

    this.contacts.push({
      name : this.nameContact,
      info: this.infoContact,
      type: this.typeContact
    });

    this.clearFieldsContact();

  }

  public editContact(contact:any, index:number){
    this.indexContact = index;
    this.nameContact = contact.name;
    this.infoContact = contact.info;
    this.typeContact = contact.type;
    this.save = false;
  }

  public updateContact(){
    this.contacts[this.indexContact] = {
      name : this.nameContact,
      info: this.infoContact,
      type: this.typeContact
    };

    this.save = true;

    this.clearFieldsContact();
  }

  public removeContact(index:number){
    if( this.contacts.length === 1)
      this.contacts = [];
    else
      this.contacts.splice(index, 1)
  }

  public clearFieldsContact(){
    this.nameContact = "";
    this.infoContact = "";
    this.typeContact = "email";
  }

  public async saveAction(){

    if(
      this.birthDay == '' ||
      this.gender == '' ||
      this.yerseyNumber == ''
    ){
      this.alertCtrl.create({
        title: "Required",
        message: "Empty fields",
        buttons: ["Ok"]
      }).present();
      return;
    }

    let positions:Array<any> = this.positions.split(",");

    let user:any, player:any = {
      team: this.team.team,
      birthDay: moment(this.birthDay, "DD MMM YYYY").toISOString(),
      yerseyNumber: this.yerseyNumber,
      gender: this.gender,
      nonPlayer: this.nonPlayer,
      managerAccess: this.managerAccess,
      positions: positions
    };

    try{
      this.user.contacts = this.contacts;
      user = await this.http.post("/user/player", this.user).toPromise();
      
      player.user = user.id;

      player = await this.http.post("/players", player).toPromise();

      if( this.user.hasOwnProperty('image') && this.user.image != '' ){
        await this.http.post("/images/users", {
          id : user.id,
          image : this.user.image
        }).toPromise();
      }

    }catch(e){
      console.error(e);
      this.alertCtrl.create({
        title: "Error",
        message: "Fail Saved",
        buttons: ["Ok"]
      }).present();

      return;
    }

    this.navCtrl.setRoot(RosterPage);

  }

}
