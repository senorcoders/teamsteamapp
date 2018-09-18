import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { MemberRosterPage } from '../member-roster/member-roster';
import { ViewPlayerPage } from '../view-player/view-player';
import { interceptor } from '../../providers/auth-service/interceptor';
import { CreatePlayerPage } from '../create-player/create-player';
import { MyApp } from '../../app/app.component';
import { ChatOnePersonPage } from '../chat-one-person/chat-one-person';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { Storage } from '@ionic/storage';

/**
 * para mostrar la lista de jugadores del equipo
 */

@IonicPage()
@Component({
  selector: 'page-roster',
  templateUrl: 'roster.html',
})
export class RosterPage {

  public user = MyApp.User;
  public isManager: boolean = false;

  public players = [];
  public playersOrigin = [];
  public filtro = "";

  public managers = [];
  public managersOrigin = [];
  firstTime:boolean = true;

  public updateImagePlayer = (index: number, stringBase64: string) => {

    let t = this; console.log(index);
    return new Promise(function (resolve, reject) {
      t.players[index].image = stringBase64;
    })

  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public auth: AuthServiceProvider,
    public loading: LoadingController, private storage: Storage
  ) {
  }

  ionViewWillEnter(){
    this.storage.get('firstTimeRoster').then((val) => {
      console.log("Val", val);

      if(val == true && this.user.role.name === "Manager"){
        this.firstTime = false;

      }

    })
  }

  async ionViewDidLoad() {

    let load = HelpersProvider.me.getLoadingStandar();
    try {

      //Cargamos primeramente los players
      let players = await this.http.get("/players/team/" + this.user.team).toPromise() as any[];

      this.players = players.filter(function (item) {
        return item.user !== undefined;
      });

      this.players = this.players.map(function (item) {
        item.loadImage = false;
        item.image = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
        return item;
      });

      this.playersOrigin = this.players;

      //Cargamos los managers
      let managers = await this.http.get(`/roles?where={"team":"${this.user.team}","name":"Manager"}`).toPromise() as any[];

      this.managers = managers.filter(function (item) {
        return item.user !== undefined;
      });

      this.managers = this.managers.map(function (item) {
        item.loadImage = false;
        item.image = interceptor.transformUrl("/userprofile/images/" + item.user.id + "/" + MyApp.User.team);
        return item;
      });

      this.managersOrigin = this.managers;

    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  public success(event, player) {
    player.loadImage = true;
  }

  public validEditEnable(player) {
    if (this.user.role.name !== 'Manager') return true;
    if (player.hasOwnProperty("name")) return true;

    return false;
  }

  public editMember(index: number, member: any) {
    this.navCtrl.push(MemberRosterPage, {
      player: member,
      index,
      updateImage: this.updateImagePlayer
    });
  }

  public viewPlayer(member) {
    this.navCtrl.push(ViewPlayerPage, {
      player: member,
      user: this.user
    });
  }

  public search() {
    if (this.filtro === "") {
      this.players = this.playersOrigin;
      this.managers = this.managersOrigin;
      return;
    }

    this.players = this.playersOrigin.filter(function (it) {
      return it.user.firstName.toLowerCase().includes(this.filtro.toLowerCase()) ||
        it.user.lastName.toLowerCase().includes(this.filtro.toLowerCase());
    }.bind(this));
    
    this.managers = this.managersOrigin.filter(function (it) {
      return it.user.firstName.toLowerCase().includes(this.filtro.toLowerCase()) ||
        it.user.lastName.toLowerCase().includes(this.filtro.toLowerCase());
    }.bind(this));
  }

  public notMembers() {
    if (this.playersOrigin.length === 0 && this.managersOrigin.length === 0) return true;
    return false;
  }

  public addPlayer() {
    this.navCtrl.push(CreatePlayerPage);
  }

  public goChat(user) {
    this.navCtrl.push(ChatOnePersonPage, { user });
  }

  hideOverlay(){
    this.storage.set('firstTimeRoster', false);
    this.firstTime = true;
  }
}
