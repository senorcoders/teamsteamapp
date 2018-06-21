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
  public role = "";
  public players: Array<any> = [];
  private team: any = {};
  public playersSelects = [];
  public relationships:any={};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController, public alertCtrl: AlertController,
    private helper: HelpersProvider, private http: HttpClient
  ) {

    this.team = this.navParams.get("team");

  }

  async ngOnInit() {
    try {
      let ps: Array<any> = await this.http.get("/players/team/" + this.team.id).toPromise() as any;
      this.players = ps.filter(function (it) { return it.hasOwnProperty("user") });
    }
    catch (e) {
      console.error(e);
    }
  }

  public getEmail(id):String{
    let player = this.players.find(function(it){ return it.id === id; })
    if(player === undefined){return ""; }
    return player.user.email;
  }

  public async sent() {

    if (this.firstName == "" || this.lastName === "" || this.email == "" || this.role == "") {
      let requiredM = await this.helper.getWords("REQUIRED"),
        unex = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: unex })
        .present();
      return;
    }

    let lengthR = 0;
    for(let n of Object.keys(this.relationships)){
      if(this.relationships[n] !== ""){
        lengthR +=1;
      }
    }
    
    if (this.role === "Family" && (this.playersSelects.length === 0 ||
      this.playersSelects.length !== lengthR) 
    ) {
      let requiredM = await this.helper.getWords("REQUIRED"),
        unex = await this.helper.getWords("EMPTYFIELDS");
      this.alertCtrl.create({ title: requiredM, message: unex })
        .present();
      return;
    }

    let i = 0;
    let playersSelects = this.playersSelects.map(function (it) {
      let p = { id: it, relationship: this.relationships[i] };
      i += 1;
      return p;
    }.bind(this));

    let user: any;
    if (this.role === "Family") {
      user = {
        firstName: this.firstName, lastName: this.lastName,
        email: this.email, players: playersSelects, role: this.role
      };
    } else {
      user = { firstName: this.firstName, lastName: this.lastName, email: this.email, role: this.role };
    }

    this.viewCtrl.dismiss(user);

  }

}
