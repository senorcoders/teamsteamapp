import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { TeamsProfilePage } from '../teams-profile/teams-profile';
import { interceptor } from '../../providers/auth-service/interceptor';

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

  //Para cuando se va actualizar un team
  public update=false;
  public team:any;
  public updateImage=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public loadingCtrl: LoadingController,
    public helper: HelpersProvider, public alertCtrl: AlertController
  ) {

    this.team = this.navParams.get("team");
    if( this.team !== undefined ){
      this.name = this.team.name;
      this.sport = this.team.sport;
      this.description = this.team.description;
      let ramdon = new Date().getTime();
      this.imageSrc = interceptor.transformUrl("/images/"+ ramdon+ "/teams/"+ this.team.id);
      this.update = true;
    }

  }

  public async success(){
    this.image = true;
  }

  public changePhoto(){
    
    this.helper.Camera({ width : 200, height: 200, quality: 75 }).then((result)=>{
      if( result ){
        this.imageSrc = result;
        this.updateImage=true;
      }
    })
    .catch((err)=>{
      console.error(err);
    });

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
      let newTeam:any = await this.http.post("/teams", { name: this.name, userID: MyApp.User.id,
        description: this.description, sport: this.sport, configuration: { valid : true } }).toPromise();
        
        if( this.imageSrc !== "" )
          await this.http.post("/images/teams", { id : newTeam.id, image : this.imageSrc }).toPromise();

      console.log(newTeam);
      load.dismiss();
      this.navCtrl.setRoot(TeamsProfilePage);
    }
    catch(e){
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }
  
  public async updateAction(){

    if( this.name === "" || this.sport === "" || this.description === "" ){
      let requiredM = await this.helper.getWords("REQUIRED"),
      emptyFields = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: emptyFields })
      .present();
      return;
    }

    let updatingM = await this.helper.getWords("UPDATING"),
    undexM = await this.helper.getWords("ERORUNEXC");

    let load = this.loadingCtrl.create({ content: updatingM });
    load.present({ disableApp: true });

    try{
      let newTeam:any = await this.http.put("/teams/"+ this.team.id, { name: this.name,  description: this.description,
          sport: this.sport, configuration: { valid : true } }).toPromise();
        
        if( this.updateImage === true )
          await this.http.post("/images/teams", { id : newTeam.id, image : this.imageSrc }).toPromise();

      console.log(newTeam);
      load.dismiss();

      if( this.update === true ){
        this.navCtrl.pop();
        return;
      }

      this.navCtrl.setRoot(TeamsProfilePage);
    }
    catch(e){
      load.dismiss();
      this.alertCtrl.create({ title: "Error", message: undexM, buttons: ["Ok"] });
      console.error(e);
    }

  }

}
