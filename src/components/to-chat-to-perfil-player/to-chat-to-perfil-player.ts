import { Component } from '@angular/core';
import { ViewController, NavParams, NavController } from 'ionic-angular';
import { ChatOnePersonPage } from '../../pages/chat-one-person/chat-one-person';
import { ViewPlayerPage } from '../../pages/view-player/view-player';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the ToChatToPerfilPlayerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'to-chat-to-perfil-player',
  templateUrl: 'to-chat-to-perfil-player.html'
})
export class ToChatToPerfilPlayerComponent {

  public user:any={};

  constructor(private viewCtrl : ViewController, private navParams: NavParams,
    private navController: NavController, private http: HttpClient
  ) {
    this.user = this.navParams.get("user");
  }

  public toChat(){
    let t = this;
    this.viewCtrl.dismiss()
    .then(function(){
      t.navController.push(ChatOnePersonPage, { user: t.user });
    });
  }

  public async toPerfil(){
    try{
      let t = this;
      let player = await this.http.get("/player/user/"+ this.user.id).toPromise();
      this.viewCtrl.dismiss()
      .then(function(){
        t.navController.push(ViewPlayerPage, { user: MyApp.User, player : player });
      });
    }
    catch(e){
      console.error(e);
    }
  }

}
