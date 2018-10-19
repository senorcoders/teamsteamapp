import { Component } from '@angular/core';
import { ViewController, NavParams, NavController, App } from 'ionic-angular';
import { ChatOnePersonPage } from '../../pages/chat-one-person/chat-one-person';
import { ViewPlayerPage } from '../../pages/view-player/view-player';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';

/* es para darle la opcion al usuario de seleccionar si 
desea enviar un mensaje o ver el perfil del player
 */
@Component({
  selector: 'to-chat-to-perfil-player',
  templateUrl: 'to-chat-to-perfil-player.html'
})
export class ToChatToPerfilPlayerComponent {

  public static __name = "ToChatToPerfilComponent"

  public user:any={};

  constructor(public viewCtrl : ViewController, private navParams: NavParams,
    private app: App, private http: HttpClient
  ) {
    this.user = this.navParams.get("user");
  }

  public toChat(){
    let t = this;
    this.viewCtrl.dismiss()
    .then(function(){
      t.app.getRootNav().push(ChatOnePersonPage, { user: t.user });
    });
  }

  public async toPerfil(){
    try{
      let t = this;
      let player = await this.http.get("/player/user/"+ this.user.id).toPromise();
      this.viewCtrl.dismiss()
      .then(function(){
        t.app.getRootNav().push(ViewPlayerPage, { user: MyApp.User, player : player });
      });
    }
    catch(e){
      console.error(e);
    }
  }

}
