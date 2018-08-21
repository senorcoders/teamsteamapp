import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { SelectOwnerLeaguePage } from '../select-owner-league/select-owner-league';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { AddTeamsLeagueComponent } from '../../components/add-teams-league/add-teams-league';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';


@IonicPage()
@Component({
  selector: 'page-create-league',
  templateUrl: 'create-league.html',
})
export class CreateLeaguePage {

  public name = "";
  public description = "";
  public usersOwners = [];
  public imageSrc = "";
  public image = false;
  public updateImage = false;
  public teamsSelect = [];

  private userPresent = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modalCtrl: ModalController, public alertCtrl: AlertController,
    public http: HttpClient, public auth:AuthServiceProvider
  ) {
    if(MyApp.User !== undefined && MyApp.User !== null){
      this.userPresent = true;
    }
  }

  success() {
    this.image = true;
  }

  public addOwners() {
    let add = this.modalCtrl.create(SelectOwnerLeaguePage);
    add.present();
    add.onDidDismiss(function (user) {
      if (user) {
        let index = this.usersOwners.findIndex(it => {
          return it.id === user.id;
        });
        console.log(user, this.usersOwners, index);
        if (index === -1) {
          this.usersOwners.push(user);
        }
      }
    }.bind(this))
  }

  public removeOwner(i: number) {
    if (this.usersOwners.length === 1) {
      this.usersOwners = [];
    } else {
      this.usersOwners.splice(i, 1);
    }
  }

  public changePhoto() {

    HelpersProvider.me.Camera({ width: 200, height: 200, quality: 75 }).then((result) => {
      if (result) {
        this.imageSrc = result;
        this.updateImage = true;
      }
    })
      .catch((err) => {
        console.error(err);
      });

  }

  public addTeams() {
    let m = this.modalCtrl.create(AddTeamsLeagueComponent, { teamsSelect: this.teamsSelect });
    m.present();
    m.onDidDismiss(function (data: Array<any>) {
      if (data) {
        this.teamsSelect = data;
      }
    }.bind(this))
  }

  public loadImage(team) {
    team.loadImage = true;
  }

  public removeTeam(index) {
    if (this.teamsSelect.length === 1) {
      this.teamsSelect = [];
    } else {
      this.teamsSelect.splice(index, 1)
    }
  }

  public async uploadExcel(){
    let files = await HelpersProvider.me.pickFile(".csv,.xlsx");
    console.log(files);
  }

  public async save() {
    if (
      this.name == ''
    ) {
      let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
        emptyM = await HelpersProvider.me.getWords("EMPTYFIELDS");
      this.alertCtrl.create({
        title: requiredM,
        message: emptyM,
        buttons: ["Ok"]
      }).present();

      return;
    }

    // if (this.usersOwners.length === 0 && this.userPresent === false) {
    //   let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
    //     msg = await HelpersProvider.me.getWords("LEAGUE.CREATE.SELECTSOWNERS");
    //   this.alertCtrl.create({
    //     title: requiredM,
    //     message: msg,
    //     buttons: ["Ok"]
    //   }).present();

    //   return;
    // }

    //Agregamos el usuario actual y filtramos
    let user;
    if(this.userPresent===true){
      user = MyApp.User;
      this.usersOwners.push(user);
    }

    let users:any[]  = [];
    for(let us of this.usersOwners){
      let index = users.findIndex(it=>{
        return us.id === it.id;
      });
      if(index===-1){
        users.push(us);
      }
    }

    if(this.teamsSelect.length===0){
      let requiredM = await HelpersProvider.me.getWords("REQUIRED"),
        msg = await HelpersProvider.me.getWords("LEAGUE.CREATE.SELECTSTEAMS");
      this.alertCtrl.create({
        title: requiredM,
        message: msg,
        buttons: ["Ok"]
      }).present();

      return;
    }

    let league:any = {
      name: this.name,
      description: this.description,
      teams: this.teamsSelect,
      owners: users
    };

    try{
      let load = HelpersProvider.me.getLoadingStandar();
      league = await this.http.post("/league/new", league).toPromise() as any;
      this.name = "";
      this.description = "";
      this.teamsSelect = [];
      this.usersOwners = [];
      if(this.imageSrc!==""){
        await this.http.post("/images/leagues", {
          id: league.id,
          image: this.imageSrc
        }).toPromise();
      }
      if(this.userPresent===true){
        await this.auth.fetchAndUpdateRoles();
      }
      let msg = await HelpersProvider.me.getWords("LEAGUE.CREATE.SUCCESS");
      load.dismissAll();
      
      this.alertCtrl.create({
        message: msg,
        buttons: ["Ok"]
      }).present();

    }
    catch(e){
      console.error(e);
    }

  }

}
