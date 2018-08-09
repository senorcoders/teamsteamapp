import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SelectOwnerLeaguePage } from '../select-owner-league/select-owner-league';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { AddTeamsLeagueComponent } from '../../components/add-teams-league/add-teams-league';


@IonicPage()
@Component({
  selector: 'page-create-league',
  templateUrl: 'create-league.html',
})
export class CreateLeaguePage {

  public name="";
  public description="";
  public usersOwners=[];
  public imageSrc="";
  public updateImage=false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public modalCtrl:ModalController
  ) {
  }

  ionViewDidLoad() {
    
  }

  public addOwners(){
    let add = this.modalCtrl.create(SelectOwnerLeaguePage);
    add.present();
    add.onDidDismiss(function(user){
      if(user){
          this.usersOwners.push(user);
      }
    }.bind(this))
  }

  public removeOwner(i:number){
    if(this.usersOwners.length===1){
      this.usersOwners = [];
    }else{
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

  public addTeams(){
    let m = this.modalCtrl.create(AddTeamsLeagueComponent);
    m.present();
    m.onDidDismiss(function(data){
      if(data){
        
      }
    })
  }

}
