import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { WebSocketsProvider } from '../../providers/web-sockets/web-sockets';
import { ToChatToPerfilPlayerComponent } from '../../components/to-chat-to-perfil-player/to-chat-to-perfil-player';

@IonicPage()
@Component({
  selector: 'page-views-event',
  templateUrl: 'views-event.html',
})
export class ViewsEventPage {

  public selectFilter = "views";
  public views = [];
  public members = [];
  private event: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private socket: WebSocketsProvider
  ) {
    this.event = this.navParams.get("event");
  }

  async ionViewDidLoad() {
    try {
      this.views = await HelpersProvider.me.http.get(`/viewsevent?where={"event":"${this.event.id}"}`).toPromise() as any[];
      this.members = await HelpersProvider.me.http.get(`/roles?where={"team":"${MyApp.User.team}"}`).toPromise() as any[];

      let filter = function (it) {
        return it.existsProperty("user")
      };
      this.views = this.views.filter(filter);
      this.members = this.members.filter(filter);

      //nos subscribimos para cuando se agrege uno nuevo
      this.socket.subscribe("viewsevent-added-" + this.event.id, function (view) {
        if (view.existsProperty("user") === true && view.user.typeObject() === true) {
          this.views.push(view);
        }
      }.bind(this));
    }
    catch (e) {
      console.error(e);
    }
  }

  public inViews(user) {
    return this.views.findIndex(it => {
      return it.user.id === user.id;
    }) !== -1;
  }

  public presentTo(user: any) {
    HelpersProvider.me.modalCtrl.create(ToChatToPerfilPlayerComponent, {
      user: user
    }).present();
  }
}
