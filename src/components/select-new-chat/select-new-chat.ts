import { Component } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { HttpClient } from '@angular/common/http';
import { ChatOnePersonPage } from '../../pages/chat-one-person/chat-one-person';

/**
 * Generated class for the SelectNewChatComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'select-new-chat',
  templateUrl: 'select-new-chat.html'
})
export class SelectNewChatComponent {

  public players:Array<any>=[];
  public search:string='';

  constructor(public viewCtrl: ViewController, public navParams: NavController,
    public http: HttpClient, public navCtrl: NavController
  ) {
    
  }

  async ngOnInit(){
    let team:any = await this.http.get("/team/"+ MyApp.User.team).toPromise();
    this.players = team._players;
    this.players = await Promise.all(this.players.map(async (item)=>{
      item.show = true;
      return item;
    }));
    
  }

  public async filter(){
    let sear = this.search;

    this.players = await Promise.all(this.players.map(async (item)=>{
      let usn = item.user.username.toLowerCase();
      if( sear === '' ){
        item.show = true;
      }else if( usn.includes(sear) ){
        item.show = true;
      }else{
        item.show = false;
      }
      
      return item;

    }));
  }

  public async newChat(player){
    try{
      await this.navCtrl.push(ChatOnePersonPage, {
        user: player.user
      });

      this.viewCtrl.dismiss();
    }
    catch(e){
      console.error(e);
    }
  }

}
