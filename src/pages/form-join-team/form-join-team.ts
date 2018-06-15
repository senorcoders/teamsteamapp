import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-form-join-team',
  templateUrl: 'form-join-team.html',
})
export class FormJoinTeamPage {

  public firstName = "";
  public lastName = "";
  public email = "";
  public role="";
  public players:Array<any>=[];
  private team:any={};
  public player="";
  public relationship="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController, public alertCtrl: AlertController,
  private helper: HelpersProvider, private http:HttpClient
  ) {

    this.team = this.navParams.get("team");

  }

  async ngOnInit(){
    try{
      let ps:Array<any> = await this.http.get("/players/team/"+ this.team.id).toPromise() as any;
      this.players = ps.filter(function(it){ return it.hasOwnProperty("user") });
    }
    catch(e){
      console.error(e);
    } 
  }

  public async sent(){

    if( this.firstName == "" || this.lastName === "" || this.email == "" || this.role == "" ){
      let requiredM = await this.helper.getWords("REQUIRED"),
      unex = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: unex })
      .present();
      return;
    }

    if( this.role === "Family" && this.player === "" && this.relationship === "" ){
      let requiredM = await this.helper.getWords("REQUIRED"),
      unex = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: unex })
      .present();
      return;
    }

    /*let email:any = await this.http.get("/user/enable/"+ this.email).toPromise();
    if( email.valid === false ){
      let emailM = await this.helper.getWords("EMAILREADY");
      this.alertCtrl.create({ message:  emailM, buttons: ["Ok"]})
      .present();
      return;
    }*/

    let user:any;
    if( this.role === "Family" ){
      user = { firstName: this.firstName, lastName: this.lastName, 
        email: this.email, player: this.player, role: this.role, relationship: this.relationship };
    }else{
      user = { firstName: this.firstName, lastName: this.lastName, email: this.email, role: this.role };
    }
    
    this.viewCtrl.dismiss(user);

  }

}
