import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';

@IonicPage()
@Component({
  selector: 'page-add-team',
  templateUrl: 'add-team.html',
})
export class AddTeamPage {

  public name="";
  public image=false;
  public imageSrc="";
  public sport="";
  public description="";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public loadingCtrl: LoadingController,
    public helper: HelpersProvider, public alertCtrl: AlertController
  ) {
  }

  public async success(){
    this.image = true;
  }

  public async save(){

    if( this.name === "" || this.sport === "" || this.description === "" ){
      let requiredM = await this.helper.getWords("REQUIRED"),
      emptyFields = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: emptyFields })
      .present();
      return;
    }

    let savingM = await this.helper.getWords("SAVING"),
    undexM = await this.helper.getWords("ERORUNEXC");

    let load = this.loadingCtrl.create({ content: savingM });
    load.present({ disableApp: true });

    try{
      let newTeam = await this.http.post("/teams", { name: this.name, userID: MyApp.User.id,
         description: this.description, sport: this.sport }).toPromise();
      console.log(newTeam);
      load.dismiss();
      this.navCtrl.pop();
    }
    catch(e){
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

  public changePhoto(){
    
    this.helper.Camera({ width : 200, height: 200, quality: 75 }).then((result)=>{
      this.imageSrc = result;
    })
    .catch((err)=>{
      console.error(err);
    });

  }

}
